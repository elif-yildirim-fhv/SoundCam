interface Zone {
  x: number
  y: number
  width: number
  height: number
  action: string
  element: HTMLElement
}

export class ZoneDetector {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private video: HTMLVideoElement
  private zones: Zone[]
  private previousFrameData: ImageData | null
  private detectionThreshold: number
  private motionThreshold: number
  private cooldownTime: number
  private lastActionTime: { [key: string]: number }
  private onZoneActivated: ((action: string) => void) | null
  private isRunning: boolean

  constructor(canvas: HTMLCanvasElement, video: HTMLVideoElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")!
    this.video = video
    this.zones = []
    this.previousFrameData = null
    this.detectionThreshold = 30
    this.motionThreshold = 15
    this.cooldownTime = 1000
    this.lastActionTime = {}
    this.onZoneActivated = null
    this.isRunning = false
  }

  initializeZones(): void {
    const zoneElements = document.querySelectorAll(".zone")

    zoneElements.forEach((element) => {
      const action = (element as HTMLElement).dataset.action || ""

      const zone: Zone = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        action,
        element: element as HTMLElement,
      }

      this.zones.push(zone)
    })

    this.updateZonePositions()
  }

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
          zone.x = canvasWidth - zoneWidth - margin 
          zone.y = canvasHeight - zoneHeight - margin
          break
        case "pause":
          zone.x = margin 
          zone.y = canvasHeight - zoneHeight - margin
          break
      }
      zone.width = zoneWidth
      zone.height = zoneHeight
    })
  }

  setZoneCallback(callback: (action: string) => void): void {
    this.onZoneActivated = callback
  }

  start(): void {
    this.isRunning = true
    this.detectMotion()
  }

  stop(): void {
    this.isRunning = false
  }

  private detectMotion(): void {
    if (!this.isRunning) return

    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
      this.ctx.save()
      this.ctx.scale(-1, 1)
      this.ctx.drawImage(this.video, -this.canvas.width, 0, this.canvas.width, this.canvas.height)
      this.ctx.restore()

      const currentFrameData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)

      if (this.previousFrameData) {
        this.zones.forEach((zone) => {
          const isActive = this.detectZoneCoverage(currentFrameData, this.previousFrameData!, zone)
          this.updateZoneVisual(zone, isActive)
          if (isActive) this.handleZoneActivation(zone)
        })
      }

      this.previousFrameData = currentFrameData
    }

    requestAnimationFrame(() => this.detectMotion())
  }

  private detectZoneCoverage(currentFrame: ImageData, previousFrame: ImageData, zone: Zone): boolean {
    let motionPixels = 0
    let totalPixels = 0

    const startX = Math.floor(zone.x)
    const startY = Math.floor(zone.y)
    const endX = Math.floor(zone.x + zone.width)
    const endY = Math.floor(zone.y + zone.height)

    for (let y = startY; y < endY; y += 4) {
      for (let x = startX; x < endX; x += 4) {
        const index = (y * this.canvas.width + x) * 4

        const rDiff = Math.abs(currentFrame.data[index] - previousFrame.data[index])
        const gDiff = Math.abs(currentFrame.data[index + 1] - previousFrame.data[index + 1])
        const bDiff = Math.abs(currentFrame.data[index + 2] - previousFrame.data[index + 2])

        const avgDiff = (rDiff + gDiff + bDiff) / 3
        if (avgDiff > this.detectionThreshold) motionPixels++
        totalPixels++
      }
    }

    const motionPercentage = (motionPixels / totalPixels) * 100
    return motionPercentage > this.motionThreshold
  }

  private updateZoneVisual(zone: Zone, isActive: boolean): void {
    if (isActive) zone.element.classList.add("active")
    else zone.element.classList.remove("active")

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
        statusElement.classList.toggle("active", isActive)
      }
    }
  }

  private handleZoneActivation(zone: Zone): void {
    const now = Date.now()
    const lastAction = this.lastActionTime[zone.action] || 0
    if (now - lastAction < this.cooldownTime) return

    this.lastActionTime[zone.action] = now
    if (this.onZoneActivated) this.onZoneActivated(zone.action)
  }
}
