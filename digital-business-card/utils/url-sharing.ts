"use client"

import type { Theme } from "@/components/theme-selector"

export interface ShareableProfile {
  name: string
  title: string
  company: string
  email: string
  phone: string
  location: string
  website: string
  bio: string
  avatar: string
  skills: string[]
  social: {
    linkedin: string
    twitter: string
    github: string
  }
}

export interface ShareableData {
  profile: ShareableProfile
  theme: Theme
  version: string
}

// Compress and encode data for URL sharing
export function encodeProfileForURL(profile: ShareableProfile, theme: Theme): string {
  try {
    const data: ShareableData = {
      profile,
      theme,
      version: "1.0",
    }

    // Convert to JSON and then to base64
    const jsonString = JSON.stringify(data)
    const base64 = btoa(unescape(encodeURIComponent(jsonString)))

    // Further compress by removing common patterns
    return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")
  } catch (error) {
    console.error("Error encoding profile for URL:", error)
    throw new Error("Failed to encode profile data")
  }
}

// Decode and decompress data from URL
export function decodeProfileFromURL(encodedData: string): ShareableData | null {
  try {
    // Restore base64 padding and characters
    let base64 = encodedData.replace(/-/g, "+").replace(/_/g, "/")

    // Add padding if needed
    while (base64.length % 4) {
      base64 += "="
    }

    // Decode from base64 to JSON
    const jsonString = decodeURIComponent(escape(atob(base64)))
    const data = JSON.parse(jsonString) as ShareableData

    // Validate the data structure
    if (!data.profile || !data.theme || !data.version) {
      throw new Error("Invalid data structure")
    }

    return data
  } catch (error) {
    console.error("Error decoding profile from URL:", error)
    return null
  }
}

// Generate a shareable URL
export function generateShareableURL(profile: ShareableProfile, theme: Theme): string {
  const encodedData = encodeProfileForURL(profile, theme)
  const baseURL = typeof window !== "undefined" ? window.location.origin + window.location.pathname : ""
  return `${baseURL}#shared=${encodedData}`
}

// Extract shared data from current URL
export function getSharedDataFromURL(): ShareableData | null {
  if (typeof window === "undefined") return null

  const hash = window.location.hash
  const sharedMatch = hash.match(/#shared=([^&]+)/)

  if (!sharedMatch) return null

  return decodeProfileFromURL(sharedMatch[1])
}

// Check if current URL contains shared data
export function hasSharedData(): boolean {
  if (typeof window === "undefined") return false
  return window.location.hash.includes("#shared=")
}

// Clear shared data from URL
export function clearSharedDataFromURL(): void {
  if (typeof window === "undefined") return

  const url = new URL(window.location.href)
  url.hash = ""
  window.history.replaceState({}, "", url.toString())
}

// Validate profile data
export function validateProfileData(profile: any): profile is ShareableProfile {
  return (
    typeof profile === "object" &&
    typeof profile.name === "string" &&
    typeof profile.title === "string" &&
    typeof profile.company === "string" &&
    typeof profile.email === "string" &&
    typeof profile.phone === "string" &&
    typeof profile.location === "string" &&
    typeof profile.website === "string" &&
    typeof profile.bio === "string" &&
    typeof profile.avatar === "string" &&
    Array.isArray(profile.skills) &&
    typeof profile.social === "object" &&
    typeof profile.social.linkedin === "string" &&
    typeof profile.social.twitter === "string" &&
    typeof profile.social.github === "string"
  )
}

// Get URL length estimate
export function getURLLength(profile: ShareableProfile, theme: Theme): number {
  try {
    const shareableURL = generateShareableURL(profile, theme)
    return shareableURL.length
  } catch {
    return 0
  }
}

// Check if URL is too long (most browsers support ~2000 chars, but we'll be conservative)
export function isURLTooLong(profile: ShareableProfile, theme: Theme): boolean {
  return getURLLength(profile, theme) > 1800
}
