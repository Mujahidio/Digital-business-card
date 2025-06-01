"use client"

import type React from "react"
import { Copy, Download, Share2, Edit, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import type { Theme } from "./theme-selector"

interface ThemedBusinessCardProps {
  theme: Theme
  profile: any
  isEditing: boolean
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onCopyContact: () => void
  onShare: () => void
  onDownloadVCard: () => void
  onUploadImage: () => void
  children: React.ReactNode
}

export function ThemedBusinessCard({
  theme,
  profile,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onCopyContact,
  onShare,
  onDownloadVCard,
  onUploadImage,
  children,
}: ThemedBusinessCardProps) {
  const getCardStyle = () => {
    switch (theme.layout) {
      case "modern":
        return "overflow-hidden border-2"
      case "corporate":
        return "overflow-hidden border border-slate-300 shadow-lg"
      case "creative":
        return "overflow-hidden border-2 border-purple-200 shadow-xl"
      case "dark":
        return "overflow-hidden border border-gray-700 bg-gray-900 text-white"
      case "classic":
        return "overflow-hidden border-2 border-amber-200 shadow-lg bg-gradient-to-b from-amber-50 to-orange-50"
      default:
        return "overflow-hidden border-2"
    }
  }

  const getHeaderStyle = () => {
    switch (theme.layout) {
      case "modern":
        return `relative h-32 bg-gradient-to-r ${theme.colors.primary}`
      case "corporate":
        return `relative h-24 bg-gradient-to-r ${theme.colors.primary}`
      case "creative":
        return `relative h-40 bg-gradient-to-r ${theme.colors.primary}`
      case "dark":
        return `relative h-32 bg-gradient-to-r ${theme.colors.primary}`
      case "classic":
        return `relative h-28 bg-gradient-to-r ${theme.colors.primary} border-b-4 border-amber-300`
      default:
        return `relative h-32 bg-gradient-to-r ${theme.colors.primary}`
    }
  }

  const getAvatarPosition = () => {
    switch (theme.layout) {
      case "corporate":
        return "absolute -bottom-8 left-6"
      case "creative":
        return "absolute -bottom-12 left-1/2 transform -translate-x-1/2"
      case "classic":
        return "absolute -bottom-10 right-6"
      default:
        return "absolute -bottom-12 left-6"
    }
  }

  const getContentPadding = () => {
    switch (theme.layout) {
      case "corporate":
        return "pt-12 pb-6"
      case "creative":
        return "pt-16 pb-6 text-center"
      case "classic":
        return "pt-14 pb-6"
      default:
        return "pt-16 pb-6"
    }
  }

  const getNameStyle = () => {
    switch (theme.layout) {
      case "creative":
        return "text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
      case "dark":
        return "text-2xl font-bold text-white"
      case "classic":
        return "text-2xl font-bold text-amber-900"
      default:
        return "text-2xl font-bold"
    }
  }

  const getBadgeStyle = () => {
    switch (theme.layout) {
      case "creative":
        return "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200"
      case "dark":
        return "bg-gray-800 text-emerald-400 border-gray-700"
      case "classic":
        return "bg-amber-100 text-amber-800 border-amber-200"
      default:
        return ""
    }
  }

  return (
    <Card className={getCardStyle()}>
      <CardHeader className="p-0">
        <div className={getHeaderStyle()}>
          {/* Action Buttons */}
          <div className="absolute top-4 right-4">
            {!isEditing ? (
              <Button size="sm" variant="secondary" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button size="sm" variant="secondary" onClick={onSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={onCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className={getAvatarPosition()}>
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                <AvatarFallback className="text-2xl bg-blue-100 text-blue-800">
                  {profile.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md"
                  onClick={onUploadImage}
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit profile picture</span>
                </Button>
              )}
            </div>
          </div>

          {/* Creative Layout - Decorative Elements */}
          {theme.layout === "creative" && (
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-4 left-4 w-8 h-8 bg-white/20 rounded-full" />
              <div className="absolute bottom-4 right-8 w-6 h-6 bg-white/20 rounded-full" />
              <div className="absolute top-8 right-12 w-4 h-4 bg-white/30 rounded-full" />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className={getContentPadding()}>
        {/* Name and Title */}
        <div className={`space-y-1.5 mb-4 ${theme.layout === "creative" ? "text-center" : ""}`}>
          {!isEditing && (
            <>
              <h2 className={getNameStyle()}>{profile.name}</h2>
              <p className={`${theme.colors.muted} ${theme.layout === "creative" ? "text-lg" : ""}`}>
                {profile.title} at {profile.company}
              </p>
            </>
          )}
        </div>

        {/* Content Tabs */}
        <div className="w-full">{children}</div>
      </CardContent>

      {/* Footer */}
      {!isEditing && (
        <>
          <Separator className={theme.layout === "dark" ? "bg-gray-700" : ""} />
          <CardFooter className="flex justify-between p-4">
            <Button variant="outline" size="sm" onClick={onCopyContact}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={onShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={onDownloadVCard}>
              <Download className="h-4 w-4 mr-2" />
              Save
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  )
}
