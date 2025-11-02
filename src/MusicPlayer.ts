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
  }

  private initializePlaylist(): void {
    this.playlist = [
      
      {title: "Neon", artist: "artist 1", url: "1_Neon.mp3"}, 
      {title: "Born this way", artist: "artist 2", url: "2_BornThisWay.mp3"}, 
      {title: "Mirror", artist: "artist 3", url: "3_Mirror.mp3"}, 
      {title: "I miss the sun", artist: "artist 4 ", url: "4_IMissTheSun.mp3"}, 
      {title: "Silver Moon", artist: "artist 5", url: "5_SilverMoon.mp3"}, 
      {title: "Explode", artist: "artist 6", url: "6_Explode.mp3"}, 
      {title: "That ticking", artist: "artist 7", url: "7_ThatTicking.mp3"}, 
      {title: "Minimal dance", artist: "artist 8", url: "8_MinimalDance.mp3"}, 
      {title: "Goodbye love", artist: "artist 9", url: "9_GoodByeLove.mp3"}, 
      {title: "The stroller", artist: "artist 10", url: "10_TheStroller.mp3"}, 

    ]
  }

  play(): void {
    if (!this.isPlaying) {
      this.isPlaying = true
      const track = this.playlist[this.currentTrackIndex]

      if (this.audioElement.src !== track.url) {
        this.audioElement.src = track.url
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
  this.updateTrackDisplay()

  if (this.isPlaying) {
    this.isPlaying = false
    this.play()
  }
}

  nextTrack(): void {
  this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length
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
