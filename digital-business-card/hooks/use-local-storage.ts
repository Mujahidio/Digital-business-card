"use client"

import { useState, useEffect } from "react"

export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isLoading, setIsLoading] = useState(true)

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value

      // Save state
      setStoredValue(valueToStore)

      // Save to local storage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.error(`Error saving to localStorage:`, error)
    }
  }

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const item = window.localStorage.getItem(key)
        if (item) {
          const parsedValue = JSON.parse(item)
          setStoredValue(parsedValue)
        }
      }
    } catch (error) {
      console.error(`Error reading from localStorage:`, error)
    } finally {
      setIsLoading(false)
    }
  }, [key])

  return [storedValue, setValue, isLoading] as const
}

// Utility function to clear specific localStorage items
export function clearLocalStorage(keys: string[]) {
  if (typeof window !== "undefined") {
    keys.forEach((key) => {
      window.localStorage.removeItem(key)
    })
  }
}

// Utility function to export all data
export function exportLocalStorageData() {
  if (typeof window === "undefined") return null

  const data = {
    profile: window.localStorage.getItem("businessCard_profile"),
    theme: window.localStorage.getItem("businessCard_theme"),
    exportedAt: new Date().toISOString(),
    version: "1.0",
  }

  return data
}

// Utility function to import data
export function importLocalStorageData(data: any) {
  if (typeof window === "undefined") return false

  try {
    if (data.profile) {
      window.localStorage.setItem("businessCard_profile", data.profile)
    }
    if (data.theme) {
      window.localStorage.setItem("businessCard_theme", data.theme)
    }
    return true
  } catch (error) {
    console.error("Error importing data:", error)
    return false
  }
}
