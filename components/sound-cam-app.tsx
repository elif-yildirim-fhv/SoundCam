"use client"

import { useState } from "react"
import { CameraView } from "./camera-view"
import { MusicPlayer } from "./music-player"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Camera, Music } from "lucide-react"

export function SoundCamApp() {
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [currentSongIndex, setCurrentSongIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const handleZoneTrigger = (zone: "top-left" | "top-right" | "bottom-left" | "bottom-right") => {
    console.log("[v0] Zone triggered:", zone)

    switch (zone) {
      case "top-left":
        // Previous song
        setCurrentSongIndex((prev) => (prev > 0 ? prev - 1 : 0))
        break
      case "top-right":
        // Next song
        setCurrentSongIndex((prev) => (prev < 4 ? prev + 1 : 4))
        break
      case "bottom-left":
        // Play
        setIsPlaying(true)
        break
      case "bottom-right":
        // Pause
        setIsPlaying(false)
        break
    }
  }

  const handleEnableCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach((track) => track.stop()) // Just checking permission
      setCameraEnabled(true)
    } catch (error) {
      console.error("[v0] Camera access denied:", error)
      alert("Camera access is required for SoundCam to work. Please allow camera access.")
    }
  }

  if (!cameraEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Camera className="w-10 h-10 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-balance">Welcome to SoundCam</h1>
            <p className="text-muted-foreground text-pretty leading-relaxed">
              Control your music with hand gestures! Cover different zones in your camera view to play, pause, and skip
              tracks.
            </p>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground text-left bg-muted/50 p-4 rounded-lg">
            <p className="font-semibold text-foreground flex items-center gap-2">
              <Music className="w-4 h-4" />
              Gesture Controls:
            </p>
            <ul className="space-y-1 ml-6">
              <li>
                • <span className="font-medium">Top Left:</span> Previous Song
              </li>
              <li>
                • <span className="font-medium">Top Right:</span> Next Song
              </li>
              <li>
                • <span className="font-medium">Bottom Left:</span> Play
              </li>
              <li>
                • <span className="font-medium">Bottom Right:</span> Pause
              </li>
            </ul>
          </div>
          <Button onClick={handleEnableCamera} size="lg" className="w-full">
            Enable Camera
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Camera className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">SoundCam</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm text-muted-foreground">Camera Active</span>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto p-4 flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <CameraView onZoneTrigger={handleZoneTrigger} />
        </div>
        <div className="lg:w-96">
          <MusicPlayer
            currentSongIndex={currentSongIndex}
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            onPrevious={() => setCurrentSongIndex((prev) => (prev > 0 ? prev - 1 : 0))}
            onNext={() => setCurrentSongIndex((prev) => (prev < 4 ? prev + 1 : 4))}
          />
        </div>
      </div>
    </div>
  )
}
