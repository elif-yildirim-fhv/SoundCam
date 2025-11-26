interface Track {
  title: string
  artist: string
  url: string
}

export class MusicPlayer {
  private audioElement: HTMLAudioElement
  private playlist: Track[]
  private currentTrackIndex: number
  private isPlaying: boolean

  constructor(audioElement: HTMLAudioElement) {
    this.audioElement = audioElement
    this.playlist = []
    this.currentTrackIndex = 0
    this.isPlaying = false
    this.initializePlaylist()
    this.setupAudioEventListeners()
  }

  private initializePlaylist(): void {
    this.playlist = [
      { title: "Neon", artist: "artist 1", url: "1_Neon.mp3" },
      { title: "Born this way", artist: "artist 2", url: "2_BornThisWay.mp3" },
      { title: "Mirror", artist: "artist 3", url: "3_Mirror.mp3" },
      { title: "I miss the sun", artist: "artist 4 ", url: "4_IMissTheSun.mp3" },
      { title: "Silver Moon", artist: "artist 5", url: "5_SilverMoon.mp3" },
      { title: "Explode", artist: "artist 6", url: "6_Explode.mp3" },
      { title: "That ticking", artist: "artist 7", url: "7_ThatTicking.mp3" },
      { title: "Minimal dance", artist: "artist 8", url: "8_MinimalDance.mp3" },
      { title: "Goodbye love", artist: "artist 9", url: "9_GoodByeLove.mp3" },
      { title: "The stroller", artist: "artist 10", url: "10_TheStroller.mp3" },
    ]
  }

  private setupAudioEventListeners(): void {
    this.audioElement.addEventListener("timeupdate", () => {
      console.log("[v0] timeupdate event fired, currentTime:", this.audioElement.currentTime)
      this.updateProgress()
    })
    this.audioElement.addEventListener("loadedmetadata", () => {
      console.log("[v0] loadedmetadata event fired, duration:", this.audioElement.duration)
      this.updateProgress()
    })
    this.audioElement.addEventListener("ended", () => this.onTrackEnded())
  }

  private updateProgress(): void {
    const progressFill = document.getElementById("progress-fill")
    const currentTimeEl = document.getElementById("current-time")
    const totalTimeEl = document.getElementById("total-time")

    console.log(
      "[v0] updateProgress called - progressFill:",
      !!progressFill,
      "currentTimeEl:",
      !!currentTimeEl,
      "totalTimeEl:",
      !!totalTimeEl,
    )

    if (progressFill && currentTimeEl && totalTimeEl) {
      const currentTime = this.audioElement.currentTime
      const duration = this.audioElement.duration

      console.log("[v0] currentTime:", currentTime, "duration:", duration)

      if (duration > 0) {
        const percentage = (currentTime / duration) * 100
        progressFill.style.width = percentage + "%"
        console.log("[v0] Progress set to:", percentage + "%")
      }

      currentTimeEl.textContent = this.formatTime(currentTime)
      totalTimeEl.textContent = this.formatTime(duration)
      console.log("[v0] Time display updated:", this.formatTime(currentTime), "/ ", this.formatTime(duration))
    }
  }

  private formatTime(seconds: number): string {
    if (!isFinite(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  private onTrackEnded(): void {
    this.nextTrack()
  }

  play(): void {
    if (!this.isPlaying) {
      this.isPlaying = true
      const track = this.playlist[this.currentTrackIndex]

      const isSameTrack = this.audioElement.src.endsWith(track.url)

      if (!isSameTrack) {
        this.audioElement.src = track.url
        this.audioElement.currentTime = 0
        console.log("[v0] Loading new track:", track.url)
      } else {
        console.log("[v0] Resuming same track at:", this.audioElement.currentTime)
      }

      this.audioElement.play().catch((error) => {
        console.error("Error playing audio:", error)
      })

      this.updatePlaybackStatus("Playing")
      this.updateTrackDisplay()
    }
  }

  pause(): void {
    if (this.isPlaying) {
      this.isPlaying = false
      this.audioElement.pause()
      this.updatePlaybackStatus("Paused")
    }
  }

  previousTrack(): void {
    this.currentTrackIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length
    this.audioElement.currentTime = 0
    this.updateTrackDisplay()

    if (this.isPlaying) {
      this.isPlaying = false
      this.play()
    }
  }

  nextTrack(): void {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length
    this.audioElement.currentTime = 0
    this.updateTrackDisplay()

    if (this.isPlaying) {
      this.isPlaying = false
      this.play()
    }
  }

  getCurrentTrack(): Track {
    return this.playlist[this.currentTrackIndex]
  }

  getIsPlaying(): boolean {
    return this.isPlaying
  }

  private updateTrackDisplay(): void {
    const track = this.playlist[this.currentTrackIndex]
    const titleElement = document.getElementById("track-title")
    const artistElement = document.getElementById("track-artist")

    if (titleElement) titleElement.textContent = track.title
    if (artistElement) artistElement.textContent = track.artist
  }

  private updatePlaybackStatus(status: string): void {
    const statusText = document.getElementById("status-text")
    const statusIndicator = document.getElementById("status-indicator")

    if (statusText) statusText.textContent = status

    if (statusIndicator) {
      if (status === "Playing") {
        statusIndicator.classList.add("playing")
      } else {
        statusIndicator.classList.remove("playing")
      }
    }
  }
}
