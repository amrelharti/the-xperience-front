"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ZoomIn, ZoomOut, RotateCw, Crop, X, Check } from "lucide-react"

interface ImageCropperProps {
  open: boolean
  onClose: () => void
  imageFile: File | null
  onCropComplete: (croppedImageUrl: string) => void
  aspectRatio?: number // e.g., 1 for square, 16/9 for widescreen
  cropShape?: "rect" | "round"
}

export function ImageCropper({
  open,
  onClose,
  imageFile,
  onCropComplete,
  aspectRatio = 1,
  cropShape = "round"
}: ImageCropperProps) {
  const [imageSrc, setImageSrc] = useState<string>("")
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (imageFile && open) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImageSrc(e.target?.result as string)
        setZoom(1)
        setRotation(0)
        setPosition({ x: 0, y: 0 })
      }
      reader.readAsDataURL(imageFile)
    }
  }, [imageFile, open])

  useEffect(() => {
    if (imageSrc && canvasRef.current) {
      drawCanvas()
    }
  }, [imageSrc, zoom, rotation, position])

  const drawCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const img = new Image()
    img.onload = () => {
      imageRef.current = img

      // Set canvas size
      const containerWidth = 400
      const containerHeight = 400
      canvas.width = containerWidth
      canvas.height = containerHeight

      // Clear canvas
      ctx.fillStyle = "#000"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Calculate image dimensions
      const scale = Math.min(containerWidth / img.width, containerHeight / img.height) * zoom
      const width = img.width * scale
      const height = img.height * scale

      // Calculate position with drag offset
      const x = (containerWidth - width) / 2 + position.x
      const y = (containerHeight - height) / 2 + position.y

      // Save context
      ctx.save()

      // Apply rotation around center
      ctx.translate(containerWidth / 2, containerHeight / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.translate(-containerWidth / 2, -containerHeight / 2)

      // Draw image
      ctx.drawImage(img, x, y, width, height)

      // Restore context
      ctx.restore()

      // Draw crop overlay
      drawCropOverlay(ctx, containerWidth, containerHeight)
    }
    img.src = imageSrc
  }

  const drawCropOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const cropSize = Math.min(width, height) * 0.7
    const cropX = (width - cropSize) / 2
    const cropY = (height - cropSize) / 2

    // Darken outside crop area
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
    ctx.fillRect(0, 0, width, cropY) // Top
    ctx.fillRect(0, cropY + cropSize, width, height - cropY - cropSize) // Bottom
    ctx.fillRect(0, cropY, cropX, cropSize) // Left
    ctx.fillRect(cropX + cropSize, cropY, width - cropX - cropSize, cropSize) // Right

    // Draw crop border
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 2

    if (cropShape === "round") {
      ctx.beginPath()
      ctx.arc(width / 2, height / 2, cropSize / 2, 0, Math.PI * 2)
      ctx.stroke()
    } else {
      ctx.strokeRect(cropX, cropY, cropSize, cropSize)
    }

    // Draw grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
    ctx.lineWidth = 1
    const gridSize = cropSize / 3
    
    // Vertical lines
    ctx.beginPath()
    ctx.moveTo(cropX + gridSize, cropY)
    ctx.lineTo(cropX + gridSize, cropY + cropSize)
    ctx.moveTo(cropX + gridSize * 2, cropY)
    ctx.lineTo(cropX + gridSize * 2, cropY + cropSize)
    
    // Horizontal lines
    ctx.moveTo(cropX, cropY + gridSize)
    ctx.lineTo(cropX + cropSize, cropY + gridSize)
    ctx.moveTo(cropX, cropY + gridSize * 2)
    ctx.lineTo(cropX + cropSize, cropY + gridSize * 2)
    ctx.stroke()
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setIsDragging(true)
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      const touch = e.touches[0]
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      })
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const getCroppedImage = () => {
    const canvas = canvasRef.current
    if (!canvas || !imageRef.current) return null

    const containerWidth = canvas.width
    const containerHeight = canvas.height
    const cropSize = Math.min(containerWidth, containerHeight) * 0.7

    // Create a new canvas for the cropped image
    const croppedCanvas = document.createElement("canvas")
    const outputSize = 400 // Final output size
    croppedCanvas.width = outputSize
    croppedCanvas.height = outputSize
    const croppedCtx = croppedCanvas.getContext("2d")
    if (!croppedCtx) return null

    // Get the crop area from the main canvas
    const cropX = (containerWidth - cropSize) / 2
    const cropY = (containerHeight - cropSize) / 2

    // Fill with white background
    croppedCtx.fillStyle = "#ffffff"
    croppedCtx.fillRect(0, 0, outputSize, outputSize)

    if (cropShape === "round") {
      // Create circular clip
      croppedCtx.beginPath()
      croppedCtx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2)
      croppedCtx.clip()
    }

    // Draw the cropped portion
    croppedCtx.drawImage(
      canvas,
      cropX,
      cropY,
      cropSize,
      cropSize,
      0,
      0,
      outputSize,
      outputSize
    )

    return croppedCanvas.toDataURL("image/jpeg", 0.9)
  }

  const handleCropComplete = () => {
    const croppedImage = getCroppedImage()
    if (croppedImage) {
      onCropComplete(croppedImage)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crop className="h-5 w-5 text-[#0476D7]" />
            Crop & Edit Profile Picture
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Canvas Preview */}
          <div className="flex justify-center bg-black rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              className="cursor-move touch-none"
              style={{ maxWidth: "100%", height: "auto" }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Zoom Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <ZoomIn className="h-4 w-4" />
                  Zoom
                </label>
                <span className="text-sm text-muted-foreground">{zoom.toFixed(1)}x</span>
              </div>
              <Slider
                value={[zoom]}
                onValueChange={(value) => setZoom(value[0])}
                min={0.5}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Rotation Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <RotateCw className="h-4 w-4" />
                  Rotation
                </label>
                <span className="text-sm text-muted-foreground">{rotation}°</span>
              </div>
              <Slider
                value={[rotation]}
                onValueChange={(value) => setRotation(value[0])}
                min={0}
                max={360}
                step={1}
                className="w-full"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="flex-1"
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Rotate 90°
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setZoom(1)
                  setRotation(0)
                  setPosition({ x: 0, y: 0 })
                }}
                className="flex-1"
              >
                Reset
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <p className="font-medium mb-1">💡 Tips:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Drag the image to reposition it</li>
              <li>Use the zoom slider to scale the image</li>
              <li>Rotate to adjust orientation</li>
              <li>The circular area shows your final profile picture</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleCropComplete}
            className="bg-gradient-to-r from-[#0476D7] to-[#005eb8] hover:from-[#005eb8] hover:to-[#0476D7] text-white"
          >
            <Check className="h-4 w-4 mr-2" />
            Apply & Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

