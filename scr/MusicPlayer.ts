/**
 * MusicPlayer.ts
 * Manages music playback and playlist
 */

export interface Track {
  title: string
  artist: string
  url: string
}

export class MusicPlayer {
  private audioElement: HTMLAudioElement
  private playlist: Track[] = []
  private currentTrackIndex = 0
  private isPlaying = false

  constructor(audioElement: HTMLAudioElement) {
    this.audioElement = audioElement
    this.initializePlaylist()
  }

  /**
   * Initialize the playlist with sample tracks
   */
  private initializePlaylist(): void {
    this.playlist = [
      { title: "Electronic Dreams", artist: "Synthwave Artist", url: "song1.mp3" },
      { title: "Digital Horizon", artist: "Cyber Sound", url: "song2.mp3" },
      { title: "Neon Nights", artist: "Future Beats", url: "song3.mp3" },
    ]
  }

  /**
   * Play the current track
   */
  play(): void {
    if (!this.isPlaying) {
      this.isPlaying = true
      const track = this.playlist[this.currentTrackIndex]

      // Set audio source if not already set
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

  /**
   * Pause the current track
   */
  pause(): void {
    if (this.isPlaying) {
      this.isPlaying = false
      this.audioElement.pause()
      this.updatePlaybackStatus("Paused")
    }
  }

  /**
   * Go to previous track
   */
  previousTrack(): void {
    this.currentTrackIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length
    this.updateTrackDisplay()

    if (this.isPlaying) {
      this.isPlaying = false
      this.play()
    }
  }

  /**
   * Go to next track
   */
  nextTrack(): void {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length
    this.updateTrackDisplay()

    if (this.isPlaying) {
      this.isPlaying = false
      this.play()
    }
  }

  /**
   * Get current track
   */
  getCurrentTrack(): Track {
    return this.playlist[this.currentTrackIndex]
  }

  /**
   * Check if music is playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying
  }

  /**
   * Update track display in UI
   */
  private updateTrackDisplay(): void {
    const track = this.playlist[this.currentTrackIndex]
    const titleElement = document.getElementById("track-title")
    const artistElement = document.getElementById("track-artist")

    if (titleElement) titleElement.textContent = track.title
    if (artistElement) artistElement.textContent = track.artist
  }

  /**
   * Update playback status in UI
   */
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
