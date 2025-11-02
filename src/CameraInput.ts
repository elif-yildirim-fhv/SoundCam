export class CameraInput {
  private video: HTMLVideoElement
  private stream: MediaStream | null

  constructor(videoElement: HTMLVideoElement) {
    this.video = videoElement
    this.stream = null
  }

  async requestAccess(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user", 
        },
      })

      this.video.srcObject = this.stream

      this.video.style.transform = "scaleX(-1)"
      this.video.style.transformOrigin = "center"
      this.video.style.webkitTransform = "scaleX(-1)" 

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

  getVideoElement(): HTMLVideoElement {
    return this.video
  }

  getDimensions(): { width: number; height: number } {
    return {
      width: this.video.videoWidth,
      height: this.video.videoHeight,
    }
  }

  stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
      this.stream = null
    }
  }
}
