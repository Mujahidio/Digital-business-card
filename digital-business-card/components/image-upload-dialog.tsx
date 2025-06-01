"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Camera, ZoomIn, ZoomOut, RotateCcw, RotateCw, Square, Circle, ImageIcon, Check } from "lucide-react"

interface ImageUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImageCropped: (croppedImageUrl: string) => void
}

// Define preset crop sizes
const CROP_PRESETS = [
  { name: "Square", aspect: 1, shape: "square", icon: <Square className="h-4 w-4" /> },
  { name: "Circle", aspect: 1, shape: "circle", icon: <Circle className="h-4 w-4" /> },
  { name: "Landscape", aspect: 16 / 9, shape: "square", icon: <ImageIcon className="h-4 w-4" /> },
  { name: "Portrait", aspect: 3 / 4, shape: "square", icon: <ImageIcon className="h-4 w-4 rotate-90" /> },
]

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export function ImageUploadDialog({ open, onOpenChange, onImageCropped }: ImageUploadDialogProps) {
  const [imgSrc, setImgSrc] = useState("")
  const imgRef = useRef<HTMLImageElement>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<Crop>()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("upload")
  const [selectedPreset, setSelectedPreset] = useState(0)
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader()
      reader.addEventListener("load", () => {
        setImgSrc(reader.result?.toString() || "")
        setActiveTab("crop")
        setZoom(100)
        setRotation(0)
        // Reset crop when new image is loaded
        setCrop(undefined)
        setPreviewUrl(null)
      })
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget
      const preset = CROP_PRESETS[selectedPreset]
      setCrop(centerAspectCrop(width, height, preset.aspect))
    },
    [selectedPreset],
  )

  const handleCropComplete = useCallback((c: Crop) => {
    setCompletedCrop(c)
    updatePreview(c)
  }, [])

  const updatePreview = useCallback(
    (c: Crop) => {
      if (!imgRef.current || !c.width || !c.height || !canvasRef.current) return

      const image = imgRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")

      if (!ctx) return

      // Set canvas size to match the desired output size
      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height
      const pixelRatio = window.devicePixelRatio || 1

      canvas.width = c.width * scaleX * pixelRatio
      canvas.height = c.height * scaleY * pixelRatio
      canvas.style.width = `${c.width}px`
      canvas.style.height = `${c.height}px`

      ctx.scale(pixelRatio, pixelRatio)
      ctx.imageSmoothingQuality = "high"

      // Apply rotation if needed
      if (rotation !== 0) {
        ctx.save()
        ctx.translate(canvas.width / (2 * pixelRatio), canvas.height / (2 * pixelRatio))
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.translate(-canvas.width / (2 * pixelRatio), -canvas.height / (2 * pixelRatio))
      }

      // Apply zoom
      const zoomFactor = zoom / 100
      const cropX = c.x * scaleX
      const cropY = c.y * scaleY
      const cropWidth = c.width * scaleX
      const cropHeight = c.height * scaleY

      ctx.drawImage(
        image,
        cropX / zoomFactor,
        cropY / zoomFactor,
        cropWidth / zoomFactor,
        cropHeight / zoomFactor,
        0,
        0,
        c.width,
        c.height,
      )

      if (rotation !== 0) {
        ctx.restore()
      }

      // Convert to data URL for preview
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95)
      setPreviewUrl(dataUrl)
    },
    [rotation, zoom],
  )

  const getCroppedImg = useCallback(() => {
    if (!imgRef.current || !completedCrop || !canvasRef.current) {
      return
    }

    setIsLoading(true)

    const canvas = canvasRef.current
    // Convert canvas to blob
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setIsLoading(false)
          return
        }
        const croppedImageUrl = URL.createObjectURL(blob)
        onImageCropped(croppedImageUrl)
        setIsLoading(false)
        onOpenChange(false)
      },
      "image/jpeg",
      0.95,
    )
  }, [completedCrop, onImageCropped, onOpenChange])

  const handleSave = () => {
    if (completedCrop) {
      getCroppedImg()
    }
  }

  const handleSaveWithoutCrop = () => {
    if (!imgRef.current || !imgSrc) return

    setIsLoading(true)

    // Create a canvas to process the full image
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      // Set canvas size to a reasonable profile picture size
      const maxSize = 400
      const aspectRatio = img.width / img.height

      if (img.width > img.height) {
        canvas.width = maxSize
        canvas.height = maxSize / aspectRatio
      } else {
        canvas.height = maxSize
        canvas.width = maxSize * aspectRatio
      }

      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setIsLoading(false)
            return
          }
          const imageUrl = URL.createObjectURL(blob)
          onImageCropped(imageUrl)
          setIsLoading(false)
          onOpenChange(false)
        },
        "image/jpeg",
        0.95,
      )
    }

    img.src = imgSrc
  }

  const handleCancel = () => {
    setImgSrc("")
    setCrop(undefined)
    setCompletedCrop(undefined)
    setActiveTab("upload")
    setPreviewUrl(null)
    onOpenChange(false)
  }

  const handlePresetChange = (index: number) => {
    setSelectedPreset(index)
    if (imgRef.current) {
      const preset = CROP_PRESETS[index]
      const { width, height } = imgRef.current
      setCrop(centerAspectCrop(width, height, preset.aspect))
    }
  }

  const handleZoomChange = (value: number[]) => {
    setZoom(value[0])
    if (completedCrop) {
      updatePreview(completedCrop)
    }
  }

  const handleRotate = (direction: "left" | "right") => {
    const newRotation = direction === "left" ? rotation - 90 : rotation + 90
    setRotation(newRotation % 360)
    if (completedCrop) {
      updatePreview(completedCrop)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Upload Profile Picture</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="upload" disabled={activeTab === "crop" && !!imgSrc}>
              Upload
            </TabsTrigger>
            <TabsTrigger value="crop" disabled={!imgSrc}>
              Crop
            </TabsTrigger>
            <TabsTrigger value="preview" disabled={!previewUrl}>
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="flex flex-col items-center justify-center gap-4 p-6 border-2 border-dashed rounded-lg">
              <Camera className="w-10 h-10 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Drag and drop or click to upload</p>
                <p className="text-xs text-muted-foreground">Supports JPG, PNG, GIF (Max 5MB)</p>
              </div>
              <Label
                htmlFor="picture-upload"
                className="flex items-center justify-center w-full py-2 px-4 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Label>
              <input id="picture-upload" type="file" accept="image/*" onChange={onSelectFile} className="hidden" />
            </div>

            {/* Add save button for upload tab when image is selected */}
            {imgSrc && (
              <div className="flex justify-center pt-4">
                <Button onClick={handleSaveWithoutCrop} disabled={isLoading} className="w-full">
                  {isLoading ? "Processing..." : "Use Image As Is"}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="crop" className="space-y-4">
            {imgSrc && (
              <>
                <div className="flex flex-col space-y-4">
                  {/* Crop shape presets */}
                  <div className="flex justify-center space-x-2">
                    {CROP_PRESETS.map((preset, index) => (
                      <Button
                        key={preset.name}
                        size="sm"
                        variant={selectedPreset === index ? "default" : "outline"}
                        onClick={() => handlePresetChange(index)}
                        className="flex items-center gap-2"
                      >
                        {preset.icon}
                        <span>{preset.name}</span>
                        {selectedPreset === index && <Check className="h-3 w-3 ml-1" />}
                      </Button>
                    ))}
                  </div>

                  {/* Crop controls */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm mb-2 block">Zoom</Label>
                      <div className="flex items-center gap-2">
                        <ZoomOut className="h-4 w-4 text-muted-foreground" />
                        <Slider
                          value={[zoom]}
                          min={50}
                          max={200}
                          step={1}
                          onValueChange={handleZoomChange}
                          className="flex-1"
                        />
                        <ZoomIn className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm mb-2 block">Rotate</Label>
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleRotate("left")} className="h-8 w-8">
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground w-12 text-center">{rotation}°</span>
                        <Button variant="outline" size="icon" onClick={() => handleRotate("right")} className="h-8 w-8">
                          <RotateCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Crop area */}
                  <div className="border rounded-md overflow-hidden bg-checkerboard">
                    <ReactCrop
                      crop={crop}
                      onChange={(_, percentCrop) => setCrop(percentCrop)}
                      onComplete={handleCropComplete}
                      aspect={CROP_PRESETS[selectedPreset].aspect}
                      circularCrop={CROP_PRESETS[selectedPreset].shape === "circle"}
                      className="max-h-[400px] mx-auto"
                    >
                      <img
                        ref={imgRef}
                        alt="Upload"
                        src={imgSrc || "/placeholder.svg"}
                        onLoad={onImageLoad}
                        style={{
                          transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                          transformOrigin: "center",
                          maxHeight: "400px",
                          margin: "0 auto",
                        }}
                        className="max-w-full h-auto transition-transform"
                      />
                    </ReactCrop>
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    Drag to reposition. Resize using the corners.
                  </p>

                  {/* Hidden canvas for processing */}
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={() => setActiveTab("upload")}>
                    Back
                  </Button>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={!completedCrop || isLoading}>
                      {isLoading ? "Processing..." : "Save"}
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab("preview")} disabled={!completedCrop}>
                      Preview
                    </Button>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="text-center mb-2">
                <h3 className="font-medium">Preview</h3>
                <p className="text-sm text-muted-foreground">Here's how your profile picture will look</p>
              </div>

              <div className="flex flex-col items-center gap-6">
                {/* Large preview */}
                <div
                  className={`border-4 border-white shadow-lg ${
                    CROP_PRESETS[selectedPreset].shape === "circle" ? "rounded-full overflow-hidden" : "rounded-md"
                  }`}
                  style={{ width: "150px", height: "150px" }}
                >
                  {previewUrl && (
                    <img
                      src={previewUrl || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      style={{
                        borderRadius: CROP_PRESETS[selectedPreset].shape === "circle" ? "50%" : "4px",
                      }}
                    />
                  )}
                </div>

                {/* Small preview (as it would appear in the card) */}
                <div className="flex flex-col items-center">
                  <p className="text-xs text-muted-foreground mb-2">In business card</p>
                  <div
                    className={`border-2 border-white shadow-md ${
                      CROP_PRESETS[selectedPreset].shape === "circle" ? "rounded-full overflow-hidden" : "rounded-md"
                    }`}
                    style={{ width: "48px", height: "48px" }}
                  >
                    {previewUrl && (
                      <img
                        src={previewUrl || "/placeholder.svg"}
                        alt="Small Preview"
                        className="w-full h-full object-cover"
                        style={{
                          borderRadius: CROP_PRESETS[selectedPreset].shape === "circle" ? "50%" : "4px",
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setActiveTab("crop")}>
                Back to Crop
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Processing..." : "Save & Apply"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          {activeTab === "upload" && imgSrc && (
            <Button onClick={handleSaveWithoutCrop} disabled={isLoading}>
              {isLoading ? "Processing..." : "Use Image As Is"}
            </Button>
          )}
          {activeTab === "crop" && (
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!completedCrop || isLoading}>
                {isLoading ? "Processing..." : "Save"}
              </Button>
              <Button variant="outline" onClick={() => setActiveTab("preview")} disabled={!completedCrop}>
                Preview
              </Button>
            </div>
          )}
          {activeTab === "preview" && (
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Processing..." : "Save & Apply"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
