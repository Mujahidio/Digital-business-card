"use client"

import type React from "react"

import { Download, Upload, Trash2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { exportLocalStorageData, importLocalStorageData, clearLocalStorage } from "@/hooks/use-local-storage"
import { useState, useRef } from "react"

interface DataManagementProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDataCleared: () => void
}

export function DataManagement({ open, onOpenChange, onDataCleared }: DataManagementProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const handleExportData = () => {
    const data = exportLocalStorageData()
    if (!data) {
      toast({
        title: "Export failed",
        description: "Unable to export data",
        variant: "destructive",
      })
      return
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.download = `business-card-data-${new Date().toISOString().split("T")[0]}.json`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Data exported",
      description: "Your business card data has been downloaded",
    })
  }

  const handleImportData = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        const success = importLocalStorageData(data)

        if (success) {
          toast({
            title: "Data imported",
            description: "Your business card data has been restored. Please refresh the page.",
          })
          // Refresh the page to load the imported data
          setTimeout(() => window.location.reload(), 2000)
        } else {
          throw new Error("Import failed")
        }
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Invalid file format or corrupted data",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)

    // Reset the input
    event.target.value = ""
  }

  const handleClearData = () => {
    clearLocalStorage(["businessCard_profile", "businessCard_theme"])
    onDataCleared()
    setShowClearConfirm(false)
    onOpenChange(false)

    toast({
      title: "Data cleared",
      description: "All saved data has been removed",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Data Management</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your data is stored locally in your browser. Export your data to keep a backup.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h3 className="font-medium">Export Data</h3>
                <p className="text-sm text-muted-foreground">Download your profile and theme settings</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h3 className="font-medium">Import Data</h3>
                <p className="text-sm text-muted-foreground">Restore from a previously exported file</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleImportData}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg border-red-200">
              <div>
                <h3 className="font-medium text-red-700">Clear All Data</h3>
                <p className="text-sm text-red-600">Remove all saved profile and theme data</p>
              </div>
              <Button variant="destructive" size="sm" onClick={() => setShowClearConfirm(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />

        {showClearConfirm && (
          <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Data Deletion</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to clear all saved data? This action cannot be undone.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowClearConfirm(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleClearData}>
                  Clear All Data
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  )
}
