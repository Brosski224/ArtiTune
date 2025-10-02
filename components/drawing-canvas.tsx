"use client"

import type React from "react"

import { useRef, useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Play, Square, Trash2, Save, FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { AudioEngine } from "@/lib/audio-engine"

interface Point {
  x: number
  y: number
  time: number
}

interface Stroke {
  points: Point[]
  color: string
  length: number
  duration: number
  speed: number
}

const COLORS = [
  { name: "Red", value: "#ef4444", label: "Piano" },
  { name: "Blue", value: "#3b82f6", label: "Synth" },
  { name: "Green", value: "#10b981", label: "Pluck" },
  { name: "Yellow", value: "#f59e0b", label: "Bell" },
  { name: "Purple", value: "#a855f7", label: "Pad" },
]

export function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [currentStroke, setCurrentStroke] = useState<Point[]>([])
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value)
  const [isReplaying, setIsReplaying] = useState(false)
  const [strokeStartTime, setStrokeStartTime] = useState(0)
  const replayTimeoutRef = useRef<NodeJS.Timeout>()
  const audioEngineRef = useRef<AudioEngine | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height

      redrawCanvas()
    }

    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)

    return () => window.removeEventListener("resize", updateCanvasSize)
  }, [])

  useEffect(() => {
    audioEngineRef.current = new AudioEngine()
  }, [])

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    strokes.forEach((stroke) => {
      drawStroke(ctx, stroke.points, stroke.color)
    })
  }, [strokes])

  const drawStroke = (ctx: CanvasRenderingContext2D, points: Point[], color: string) => {
    if (points.length < 2) return

    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)

    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y)
    }

    ctx.stroke()
  }

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isReplaying) return

    const pos = getMousePos(e)
    setIsDrawing(true)
    setStrokeStartTime(Date.now())
    setCurrentStroke([{ ...pos, time: 0 }])
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isReplaying) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const pos = getMousePos(e)
    const time = Date.now() - strokeStartTime
    const newPoint = { ...pos, time }

    setCurrentStroke((prev) => {
      const updated = [...prev, newPoint]

      if (updated.length >= 2) {
        const lastTwo = updated.slice(-2)
        drawStroke(ctx, lastTwo, selectedColor)
      }

      return updated
    })
  }

  const handleMouseUp = () => {
    if (!isDrawing) return

    setIsDrawing(false)

    if (currentStroke.length > 1) {
      let length = 0
      for (let i = 1; i < currentStroke.length; i++) {
        const dx = currentStroke[i].x - currentStroke[i - 1].x
        const dy = currentStroke[i].y - currentStroke[i - 1].y
        length += Math.sqrt(dx * dx + dy * dy)
      }

      const duration = currentStroke[currentStroke.length - 1].time
      const speed = duration > 0 ? length / duration : 0

      const newStroke: Stroke = {
        points: currentStroke,
        color: selectedColor,
        length,
        duration,
        speed,
      }

      setStrokes((prev) => [...prev, newStroke])
    }

    setCurrentStroke([])
  }

  const handleClear = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setStrokes([])
    setCurrentStroke([])
  }

  const handleReplay = async () => {
    if (strokes.length === 0 || isReplaying) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    setIsReplaying(true)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const stroke of strokes) {
      if (audioEngineRef.current) {
        audioEngineRef.current.playStroke(stroke.color, stroke.length, stroke.speed, stroke.duration / 1000)
      }

      await replayStroke(ctx, stroke)
      await new Promise((resolve) => setTimeout(resolve, 200))
    }

    setIsReplaying(false)
  }

  const replayStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke): Promise<void> => {
    return new Promise((resolve) => {
      let pointIndex = 0

      const animate = () => {
        if (pointIndex < stroke.points.length) {
          const points = stroke.points.slice(0, pointIndex + 1)

          ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

          const currentStrokeIndex = strokes.indexOf(stroke)
          for (let i = 0; i < currentStrokeIndex; i++) {
            drawStroke(ctx, strokes[i].points, strokes[i].color)
          }

          drawStroke(ctx, points, stroke.color)

          pointIndex++

          const delay =
            pointIndex < stroke.points.length
              ? Math.min(stroke.points[pointIndex].time - stroke.points[pointIndex - 1].time, 50)
              : 0

          replayTimeoutRef.current = setTimeout(animate, delay)
        } else {
          resolve()
        }
      }

      animate()
    })
  }

  const handleStop = () => {
    if (replayTimeoutRef.current) {
      clearTimeout(replayTimeoutRef.current)
    }
    if (audioEngineRef.current) {
      audioEngineRef.current.stop()
    }
    setIsReplaying(false)
    redrawCanvas()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold text-primary">SoundDraw</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {strokes.length} {strokes.length === 1 ? "stroke" : "strokes"}
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
        <div className="relative w-full max-w-4xl">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={cn(
              "h-[500px] w-full rounded-lg border-2 border-border bg-card shadow-lg",
              isReplaying ? "cursor-wait" : "cursor-crosshair",
            )}
          />

          {isReplaying && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/50 backdrop-blur-sm">
              <div className="text-lg font-medium text-primary">Replaying...</div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Instrument:</span>
          <div className="flex gap-2">
            {COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                className={cn(
                  "group relative flex h-12 w-12 items-center justify-center rounded-lg border-2 transition-all hover:scale-110",
                  selectedColor === color.value
                    ? "border-primary shadow-lg"
                    : "border-border hover:border-muted-foreground",
                )}
                disabled={isReplaying}
              >
                <div className="h-8 w-8 rounded-md" style={{ backgroundColor: color.value }} />
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  {color.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={handleReplay} disabled={strokes.length === 0 || isReplaying} size="lg" className="gap-2">
            <Play className="h-4 w-4" />
            Replay
          </Button>

          <Button onClick={handleStop} disabled={!isReplaying} size="lg" variant="secondary" className="gap-2">
            <Square className="h-4 w-4" />
            Stop
          </Button>

          <Button
            onClick={handleClear}
            disabled={strokes.length === 0 || isReplaying}
            size="lg"
            variant="outline"
            className="gap-2 bg-transparent"
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>

        </div>
      </div>
    </div>
  )
}
