"use client"

import { useState, useEffect } from "react"
import { Copy, Share2, ExternalLink, AlertTriangle, CheckCircle, QrCode } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { QRCodeSVG } from "qrcode.react"
import { generateShareableURL, getURLLength, isURLTooLong, type ShareableProfile } from "@/utils/url-sharing"
import type { Theme } from "@/components/theme-selector"

interface URLSharingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: ShareableProfile
  theme: Theme
}

export function URLSharingDialog({ open, onOpenChange, profile, theme }: URLSharingDialogProps) {
  const [shareableURL, setShareableURL] = useState("")
  const [urlLength, setUrlLength] = useState(0)
  const [isTooLong, setIsTooLong] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      try {
        const url = generateShareableURL(profile, theme)
        const length = getURLLength(profile, theme)
        const tooLong = isURLTooLong(profile, theme)

        setShareableURL(url)
        setUrlLength(length)
        setIsTooLong(tooLong)
      } catch (error) {
        console.error("Error generating shareable URL:", error)
        toast({
          title: "Error",
          description: "Failed to generate shareable URL",
          variant: "destructive",
        })
      }
    }
  }, [open, profile, theme, toast])

  const handleCopyURL = async () => {
    try {
      await navigator.clipboard.writeText(shareableURL)
      toast({
        title: "URL copied",
        description: "Shareable URL copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy URL to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name}'s Digital Business Card`,
          text: `Check out ${profile.name}'s digital business card`,
          url: shareableURL,
        })
      } catch (error) {
        // User cancelled or error occurred
        console.log("Share cancelled or failed:", error)
      }
    } else {
      handleCopyURL()
    }
  }

  const handleOpenInNewTab = () => {
    window.open(shareableURL, "_blank")
  }

  const getURLStatusColor = () => {
    if (isTooLong) return "text-red-600"
    if (urlLength > 1200) return "text-yellow-600"
    return "text-green-600"
  }

  const getURLStatusIcon = () => {
    if (isTooLong) return <AlertTriangle className="h-4 w-4 text-red-600" />
    return <CheckCircle className="h-4 w-4 text-green-600" />
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Your Business Card
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">Shareable URL</TabsTrigger>
            <TabsTrigger value="qr">QR Code</TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shareable-url">Shareable URL</Label>
              <div className="flex gap-2">
                <Input
                  id="shareable-url"
                  value={shareableURL}
                  readOnly
                  className="font-mono text-sm"
                  placeholder="Generating URL..."
                />
                <Button variant="outline" size="icon" onClick={handleCopyURL} disabled={!shareableURL}>
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy URL</span>
                </Button>
              </div>
            </div>

            {/* URL Status */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {getURLStatusIcon()}
                <span className={getURLStatusColor()}>URL Length: {urlLength} characters</span>
              </div>
              {urlLength > 0 && (
                <span className="text-muted-foreground">
                  {isTooLong ? "URL may be too long for some platforms" : "URL length is optimal"}
                </span>
              )}
            </div>

            {isTooLong && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This URL is quite long and may not work on all platforms. Consider shortening your bio or reducing the
                  number of skills to create a more compact URL.
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button onClick={handleNativeShare} disabled={!shareableURL} className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />
                {typeof navigator.share === "function" ? "Share" : "Copy URL"}
              </Button>
              <Button variant="outline" onClick={handleOpenInNewTab} disabled={!shareableURL}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>

            {/* Instructions */}
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">How to use:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Share this URL with anyone to show them your business card</li>
                <li>• Recipients can view your card without needing to install anything</li>
                <li>• The URL contains all your profile data and theme preferences</li>
                <li>• Your original data remains private and unchanged</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="qr" className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-6 rounded-lg border">
                {shareableURL && (
                  <QRCodeSVG
                    value={shareableURL}
                    size={256}
                    level="M"
                    includeMargin={true}
                    imageSettings={{
                      src: profile.avatar,
                      x: undefined,
                      y: undefined,
                      height: 48,
                      width: 48,
                      excavate: true,
                    }}
                  />
                )}
              </div>
              <p className="text-sm text-center text-muted-foreground max-w-md">
                Scan this QR code with any smartphone camera to instantly view your business card. Perfect for
                networking events and meetings.
              </p>

              <Button
                variant="outline"
                onClick={() => {
                  // Download QR code as image
                  const svg = document.querySelector('svg[role="img"]') as SVGElement
                  if (svg) {
                    const canvas = document.createElement("canvas")
                    const ctx = canvas.getContext("2d")
                    const img = new Image()

                    canvas.width = 256
                    canvas.height = 256

                    const svgData = new XMLSerializer().serializeToString(svg)
                    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
                    const url = URL.createObjectURL(svgBlob)

                    img.onload = () => {
                      ctx?.drawImage(img, 0, 0)
                      canvas.toBlob((blob) => {
                        if (blob) {
                          const downloadUrl = URL.createObjectURL(blob)
                          const link = document.createElement("a")
                          link.download = `${profile.name.replace(/\s+/g, "_")}_business_card_qr.png`
                          link.href = downloadUrl
                          link.click()
                          URL.revokeObjectURL(downloadUrl)
                        }
                      })
                      URL.revokeObjectURL(url)
                    }

                    img.src = url
                  }
                }}
              >
                <QrCode className="h-4 w-4 mr-2" />
                Download QR Code
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
