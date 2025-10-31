/**
 * App.ts
 * Main application entry point - coordinates all modules
 */

import { CameraInput } from "./CameraInput.js"
import { ZoneDetector } from "./ZoneDetector.js"
import { MusicPlayer } from "./MusicPlayer.js"

class App {
  private cameraInput: CameraInput
  private zoneDetector: ZoneDetector
  private musicPlayer: MusicPlayer

  constructor() {
    // Get DOM elements
    const videoElement = document.getElementById("webcam") as HTMLVideoElement
    const canvasElement = document.getElementById("canvas") as HTMLCanvasElement
    const audioElement = document.getElementById("audio-player") as HTMLAudioElement

    // Initialize modules
    this.cameraInput = new CameraInput(videoElement)
    this.zoneDetector = new ZoneDetector(canvasElement, videoElement)
    this.musicPlayer = new MusicPlayer(audioElement)

    // Setup event listeners
    this.setupEventListeners()
  }

  /**
   * Setup UI event listeners
   */
  private setupEventListeners(): void {
    const enableButton = document.getElementById("enable-camera")
    enableButton?.addEventListener("click", () => this.startApplication())
  }

  /**
   * Start the application
   */
  private async startApplication(): Promise<void> {
    try {
      // Request camera access
      await this.cameraInput.requestAccess()

      // Setup canvas dimensions
      const dimensions = this.cameraInput.getDimensions()
      const canvas = document.getElementById("canvas") as HTMLCanvasElement
      canvas.width = dimensions.width
      canvas.height = dimensions.height

      // Hide permission overlay
      this.hidePermissionOverlay()

      // Initialize zone detector
      this.zoneDetector.initializeZones()
      this.zoneDetector.setZoneCallback((action) => this.handleZoneAction(action))
      this.zoneDetector.start()

      console.log("SoundCam started successfully")
    } catch (error) {
      console.error("Error starting application:", error)
      alert("Could not start SoundCam. Please check camera permissions.")
    }
  }

  /**
   * Hide the permission overlay
   */
  private hidePermissionOverlay(): void {
    const overlay = document.getElementById("permission-overlay")
    overlay?.classList.add("hidden")
  }

  /**
   * Handle zone activation
   */
  private handleZoneAction(action: string): void {
    console.log(`Zone activated: ${action}`)

    switch (action) {
      case "play":
        this.musicPlayer.play()
        break
      case "pause":
        this.musicPlayer.pause()
        break
         case "next":
        this.musicPlayer.nextTrack()
        break
      case "previous":
        this.musicPlayer.previousTrack()
        break
     
    }
  }
}

// Initialize application when DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  new App()
})

export { App }
