"use client"

import { X, Eye, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SharedProfileBannerProps {
  sharedProfileName: string
  onViewOwn: () => void
  onDismiss: () => void
}

export function SharedProfileBanner({ sharedProfileName, onViewOwn, onDismiss }: SharedProfileBannerProps) {
  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50">
      <Eye className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          You're viewing <strong>{sharedProfileName}'s</strong> business card.
        </span>
        <div className="flex gap-2 ml-4">
          <Button variant="outline" size="sm" onClick={onViewOwn}>
            <Download className="h-4 w-4 mr-2" />
            View My Card
          </Button>
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
