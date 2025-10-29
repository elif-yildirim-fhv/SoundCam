/**
 * CameraInput.ts
 * Handles webcam access and video stream management
 */

export class CameraInput {
  private video: HTMLVideoElement
  private stream: MediaStream | null = null

  constructor(videoElement: HTMLVideoElement) {
    this.video = videoElement
  }

  /**
   * Request camera access from the user
   * @returns Promise that resolves when camera is ready
   */
  async requestAccess(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      this.video.srcObject = this.stream

      // Wait for video metadata to load
      return new Promise((resolve) => {
        this.video.addEventListener("loadedmetadata", () => {
          resolve()
        })
      })
    } catch (error) {
      console.error("Error accessing camera:", error)
      throw new Error("Could not access camera. Please ensure you have granted camera permissions.")
    }
  }

  /**
   * Get the video element
   */
  getVideoElement(): HTMLVideoElement {
    return this.video
  }

  /**
   * Get video dimensions
   */
  getDimensions(): { width: number; height: number } {
    return {
      width: this.video.videoWidth,
      height: this.video.videoHeight,
    }
  }

  /**
   * Stop the camera stream
   */
  stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
      this.stream = null
    }
  }
}
