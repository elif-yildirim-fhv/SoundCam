/**
 * ZoneDetector.ts
 * Detects motion and coverage in defined zones of the video feed
 */

export interface Zone {
  x: number
  y: number
  width: number
  height: number
  action: string
  element: HTMLElement
}

export type ZoneCallback = (action: string) => void

export class ZoneDetector {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private video: HTMLVideoElement
  private zones: Zone[] = []
  private previousFrameData: ImageData | null = null
  private detectionThreshold = 30
  private motionThreshold = 15 // Percentage of zone that must have motion
  private cooldownTime = 1000 // 1 second cooldown
  private lastActionTime: { [key: string]: number } = {}
  private onZoneActivated: ZoneCallback | null = null
  private isRunning = false

  constructor(canvas: HTMLCanvasElement, video: HTMLVideoElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")!
    this.video = video
  }

  /**
   * Initialize zones based on DOM elements
   */
  initializeZones(): void {
    const zoneElements = document.querySelectorAll(".zone")

    zoneElements.forEach((element) => {
      const htmlElement = element as HTMLElement
      const action = htmlElement.dataset.action || ""

      const zone: Zone = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        action: action,
        element: htmlElement,
      }

      this.zones.push(zone)
    })

    this.updateZonePositions()
  }

  /**
   * Update zone positions based on canvas size
   */
  private updateZonePositions(): void {
    const canvasWidth = this.canvas.width
    const canvasHeight = this.canvas.height
    const zoneWidth = canvasWidth * 0.25
    const zoneHeight = canvasHeight * 0.35
    const margin = canvasWidth * 0.05

    this.zones.forEach((zone) => {
      switch (zone.action) {
        case "previous":
          zone.x = margin
          zone.y = margin
          break
        case "next":
          zone.x = canvasWidth - zoneWidth - margin
          zone.y = margin
          break
        case "play":
          zone.x = margin
          zone.y = canvasHeight - zoneHeight - margin
          break
        case "pause":
          zone.x = canvasWidth - zoneWidth - margin
          zone.y = canvasHeight - zoneHeight - margin
          break
      }
      zone.width = zoneWidth
      zone.height = zoneHeight
    })
  }

  /**
   * Set callback for zone activation
   */
  setZoneCallback(callback: ZoneCallback): void {
    this.onZoneActivated = callback
  }

  /**
   * Start detection loop
   */
  start(): void {
    this.isRunning = true
    this.detectMotion()
  }

  /**
   * Stop detection loop
   */
  stop(): void {
    this.isRunning = false
  }

  /**
   * Main detection loop
   */
  private detectMotion(): void {
    if (!this.isRunning) return

    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
      // Draw current frame to canvas
      this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height)
      const currentFrameData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)

      if (this.previousFrameData) {
        // Check each zone for motion
        this.zones.forEach((zone) => {
          const isActive = this.detectZoneCoverage(currentFrameData, this.previousFrameData!, zone)
          this.updateZoneVisual(zone, isActive)

          if (isActive) {
            this.handleZoneActivation(zone)
          }
        })
      }

      this.previousFrameData = currentFrameData
    }

    requestAnimationFrame(() => this.detectMotion())
  }

  /**
   * Detect if a zone is covered based on motion
   */
  private detectZoneCoverage(currentFrame: ImageData, previousFrame: ImageData, zone: Zone): boolean {
    let motionPixels = 0
    let totalPixels = 0

    const startX = Math.floor(zone.x)
    const startY = Math.floor(zone.y)
    const endX = Math.floor(zone.x + zone.width)
    const endY = Math.floor(zone.y + zone.height)

    // Sample every 4th pixel for performance
    for (let y = startY; y < endY; y += 4) {
      for (let x = startX; x < endX; x += 4) {
        const index = (y * this.canvas.width + x) * 4

        const rDiff = Math.abs(currentFrame.data[index] - previousFrame.data[index])
        const gDiff = Math.abs(currentFrame.data[index + 1] - previousFrame.data[index + 1])
        const bDiff = Math.abs(currentFrame.data[index + 2] - previousFrame.data[index + 2])

        const avgDiff = (rDiff + gDiff + bDiff) / 3

        if (avgDiff > this.detectionThreshold) {
          motionPixels++
        }
        totalPixels++
      }
    }

    const motionPercentage = (motionPixels / totalPixels) * 100
    return motionPercentage > this.motionThreshold
  }

  /**
   * Update visual feedback for zone
   */
  private updateZoneVisual(zone: Zone, isActive: boolean): void {
    if (isActive) {
      zone.element.classList.add("active")
    } else {
      zone.element.classList.remove("active")
    }

    // Update status display
    const statusMap: { [key: string]: string } = {
      previous: "status-tl",
      next: "status-tr",
      play: "status-bl",
      pause: "status-br",
    }

    const statusId = statusMap[zone.action]
    if (statusId) {
      const statusElement = document.getElementById(statusId)
      if (statusElement) {
        statusElement.textContent = isActive ? "Active" : "Inactive"
        if (isActive) {
          statusElement.classList.add("active")
        } else {
          statusElement.classList.remove("active")
        }
      }
    }
  }

  /**
   * Handle zone activation with cooldown
   */
  private handleZoneActivation(zone: Zone): void {
    const now = Date.now()
    const lastAction = this.lastActionTime[zone.action] || 0

    // Check cooldown
    if (now - lastAction < this.cooldownTime) {
      return
    }

    this.lastActionTime[zone.action] = now

    // Trigger callback
    if (this.onZoneActivated) {
      this.onZoneActivated(zone.action)
    }
  }
}
