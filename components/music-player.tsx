"use client"

import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { SkipBack, SkipForward, Play, Pause, Music } from "lucide-react"

interface Song {
  title: string
  artist: string
  duration: string
}

const PLAYLIST: Song[] = [
  { title: "Digital Dreams", artist: "Synthwave Collective", duration: "3:45" },
  { title: "Neon Nights", artist: "Retrowave", duration: "4:12" },
  { title: "Cyber City", artist: "Future Sounds", duration: "3:28" },
  { title: "Electric Pulse", artist: "Wave Riders", duration: "4:01" },
  { title: "Midnight Drive", artist: "Synthwave Collective", duration: "3:55" },
]

interface MusicPlayerProps {
  currentSongIndex: number
  isPlaying: boolean
  onPlayPause: () => void
  onPrevious: () => void
  onNext: () => void
}

export function MusicPlayer({ currentSongIndex, isPlaying, onPlayPause, onPrevious, onNext }: MusicPlayerProps) {
  const currentSong = PLAYLIST[currentSongIndex]

  return (
    <Card className="p-6 space-y-6 sticky top-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Music className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="font-semibold">Now Playing</h2>
          <p className="text-sm text-muted-foreground">
            Track {currentSongIndex + 1} of {PLAYLIST.length}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold text-balance">{currentSong.title}</h3>
        <p className="text-muted-foreground">{currentSong.artist}</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0:00</span>
          <span>{currentSong.duration}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full bg-primary transition-all duration-1000 ${isPlaying ? "animate-pulse" : ""}`}
            style={{ width: isPlaying ? "45%" : "0%" }}
          />
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrevious}
          disabled={currentSongIndex === 0}
          className="h-12 w-12 bg-transparent"
        >
          <SkipBack className="w-5 h-5" />
        </Button>

        <Button size="icon" onClick={onPlayPause} className="h-14 w-14">
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onNext}
          disabled={currentSongIndex === PLAYLIST.length - 1}
          className="h-12 w-12 bg-transparent"
        >
          <SkipForward className="w-5 h-5" />
        </Button>
      </div>

      <div className="pt-4 border-t">
        <h4 className="text-sm font-semibold mb-3">Playlist</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {PLAYLIST.map((song, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg transition-colors ${
                index === currentSongIndex ? "bg-primary/10 border border-primary/20" : "bg-muted/50 hover:bg-muted"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${index === currentSongIndex ? "text-primary" : ""}`}>
                    {song.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                </div>
                <span className="text-xs text-muted-foreground ml-2">{song.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
