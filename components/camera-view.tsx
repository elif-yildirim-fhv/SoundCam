"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Card } from "./ui/card"
import { SkipBack, SkipForward, Play, Pause } from "lucide-react"

interface Zone {
  id: "top-left" | "top-right" | "bottom-left" | "bottom-right"
  x: number
  y: number
  width: number
  height: number
  label: string
  icon: React.ReactNode
}

interface CameraViewProps {
  onZoneTrigger: (zone: "top-left" | "top-right" | "bottom-left" | "bottom-right") => void
}

export function CameraView({ onZoneTrigger }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeZone, setActiveZone] = useState<string | null>(null)
  const [zones, setZones] = useState<Zone[]>([])
  const lastTriggerTime = useRef<{ [key: string]: number }>({})
  const TRIGGER_COOLDOWN = 1000 // 1 second cooldown between triggers

  useEffect(() => {
    let stream: MediaStream | null = null

    const initCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      } catch (error) {
        console.error("[v0] Error accessing camera:", error)
      }
    }

    initCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas) return

    const handleVideoLoad = () => {
      const videoWidth = video.videoWidth
      const videoHeight = video.videoHeight

      canvas.width = videoWidth
      canvas.height = videoHeight

      // Define zones (20% of video dimensions)
      const zoneWidth = videoWidth * 0.2
      const zoneHeight = videoHeight * 0.2

      const newZones: Zone[] = [
        {
          id: "top-left",
          x: 0,
          y: 0,
          width: zoneWidth,
          height: zoneHeight,
          label: "Previous",
          icon: <SkipBack className="w-6 h-6" />,
        },
        {
          id: "top-right",
          x: videoWidth - zoneWidth,
          y: 0,
          width: zoneWidth,
          height: zoneHeight,
          label: "Next",
          icon: <SkipForward className="w-6 h-6" />,
        },
        {
          id: "bottom-left",
          x: 0,
          y: videoHeight - zoneHeight,
          width: zoneWidth,
          height: zoneHeight,
          label: "Play",
          icon: <Play className="w-6 h-6" />,
        },
        {
          id: "bottom-right",
          x: videoWidth - zoneWidth,
          y: videoHeight - zoneHeight,
          width: zoneWidth,
          height: zoneHeight,
          label: "Pause",
          icon: <Pause className="w-6 h-6" />,
        },
      ]

      setZones(newZones)
      startDetection()
    }

    const startDetection = () => {
      const ctx = canvas.getContext("2d", { willReadFrequently: true })
      if (!ctx) return

      const detectMotion = () => {
        if (!video || video.paused || video.ended) return

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        zones.forEach((zone) => {
          const imageData = ctx.getImageData(zone.x, zone.y, zone.width, zone.height)
          const brightness = calculateBrightness(imageData)

          // If brightness drops significantly, zone is covered
          const threshold = 80 // Adjust based on testing
          const isCovered = brightness < threshold

          if (isCovered) {
            const now = Date.now()
            const lastTrigger = lastTriggerTime.current[zone.id] || 0

            if (now - lastTrigger > TRIGGER_COOLDOWN) {
              console.log("[v0] Zone covered:", zone.id, "brightness:", brightness)
              setActiveZone(zone.id)
              onZoneTrigger(zone.id)
              lastTriggerTime.current[zone.id] = now

              // Reset active zone after animation
              setTimeout(() => setActiveZone(null), 500)
            }
          }
        })

        requestAnimationFrame(detectMotion)
      }

      detectMotion()
    }

    video.addEventListener("loadedmetadata", handleVideoLoad)

    return () => {
      video.removeEventListener("loadedmetadata", handleVideoLoad)
    }
  }, [zones, onZoneTrigger])

  const calculateBrightness = (imageData: ImageData): number => {
    const data = imageData.data
    let totalBrightness = 0

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      // Calculate perceived brightness
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b
      totalBrightness += brightness
    }

    return totalBrightness / (data.length / 4)
  }

  return (
    <Card className="relative overflow-hidden bg-black">
      <div className="relative aspect-video">
        <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />

        {/* Hidden canvas for detection */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Zone overlays */}
        <div className="absolute inset-0 pointer-events-none">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className={`absolute transition-all duration-300 ${
                activeZone === zone.id ? "bg-primary/60 scale-95" : "bg-primary/20 hover:bg-primary/30"
              }`}
              style={{
                left: `${(zone.x / (canvasRef.current?.width || 1)) * 100}%`,
                top: `${(zone.y / (canvasRef.current?.height || 1)) * 100}%`,
                width: `${(zone.width / (canvasRef.current?.width || 1)) * 100}%`,
                height: `${(zone.height / (canvasRef.current?.height || 1)) * 100}%`,
              }}
            >
              <div className="w-full h-full flex flex-col items-center justify-center text-white">
                <div className={`transition-transform ${activeZone === zone.id ? "scale-125" : ""}`}>{zone.icon}</div>
                <span className="text-xs font-semibold mt-1">{zone.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Corner indicators */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-primary/50" />
        <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-primary/50" />
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-primary/50" />
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-primary/50" />
      </div>

      <div className="p-4 bg-card border-t">
        <p className="text-sm text-muted-foreground text-center">Cover the zones with your hand to control playback</p>
      </div>
    </Card>
  )
}
