"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Palette, Check } from "lucide-react"

export interface Theme {
  id: string
  name: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
    muted: string
  }
  layout: "modern" | "corporate" | "creative" | "dark" | "classic"
  preview: string
}

export const themes: Theme[] = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean and minimalist design",
    colors: {
      primary: "from-blue-600 to-indigo-600",
      secondary: "bg-blue-50",
      accent: "text-blue-600",
      background: "bg-white",
      text: "text-gray-900",
      muted: "text-gray-600",
    },
    layout: "modern",
    preview: "🎨",
  },
  {
    id: "corporate",
    name: "Corporate",
    description: "Professional business style",
    colors: {
      primary: "from-slate-700 to-slate-900",
      secondary: "bg-slate-50",
      accent: "text-slate-700",
      background: "bg-white",
      text: "text-slate-900",
      muted: "text-slate-600",
    },
    layout: "corporate",
    preview: "🏢",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Vibrant and artistic design",
    colors: {
      primary: "from-purple-500 via-pink-500 to-orange-500",
      secondary: "bg-purple-50",
      accent: "text-purple-600",
      background: "bg-gradient-to-br from-purple-50 to-pink-50",
      text: "text-purple-900",
      muted: "text-purple-600",
    },
    layout: "creative",
    preview: "🎭",
  },
  {
    id: "dark",
    name: "Dark Tech",
    description: "Modern dark theme for tech professionals",
    colors: {
      primary: "from-emerald-400 to-cyan-400",
      secondary: "bg-gray-800",
      accent: "text-emerald-400",
      background: "bg-gray-900",
      text: "text-white",
      muted: "text-gray-400",
    },
    layout: "dark",
    preview: "🌙",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional and elegant style",
    colors: {
      primary: "from-amber-600 to-orange-600",
      secondary: "bg-amber-50",
      accent: "text-amber-700",
      background: "bg-cream",
      text: "text-amber-900",
      muted: "text-amber-700",
    },
    layout: "classic",
    preview: "📜",
  },
]

interface ThemeSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTheme: Theme
  onThemeChange: (theme: Theme) => void
}

export function ThemeSelector({ open, onOpenChange, currentTheme, onThemeChange }: ThemeSelectorProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Choose Your Theme
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {themes.map((theme) => (
            <Card
              key={theme.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                currentTheme.id === theme.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => {
                onThemeChange(theme)
                onOpenChange(false)
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{theme.preview}</span>
                    <div>
                      <h3 className="font-semibold">{theme.name}</h3>
                      <p className="text-sm text-muted-foreground">{theme.description}</p>
                    </div>
                  </div>
                  {currentTheme.id === theme.id && <Check className="h-5 w-5 text-primary" />}
                </div>

                {/* Theme Preview */}
                <div className="space-y-2">
                  <div className={`h-8 rounded-md bg-gradient-to-r ${theme.colors.primary}`} />
                  <div className="flex gap-2">
                    <div className={`h-4 w-full rounded ${theme.colors.secondary}`} />
                    <div className={`h-4 w-full rounded ${theme.colors.secondary}`} />
                  </div>
                  <div className="flex gap-1">
                    <Badge className="text-xs">
                      Sample
                    </Badge>
                    <Badge className="text-xs">
                      Skills
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
