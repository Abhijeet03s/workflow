"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, X, CheckCircle } from "lucide-react"
import { dataStore } from "@/lib/data-store"

interface AssetUploadZoneProps {
  clientId: string
  onUploadComplete?: () => void
}

interface UploadingFile {
  id: string
  name: string
  size: number
  progress: number
  status: "uploading" | "completed" | "error"
  file: File
}

export function AssetUploadZone({ clientId, onUploadComplete }: AssetUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }, [])

  const handleFiles = (files: File[]) => {
    const newUploadingFiles: UploadingFile[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      progress: 0,
      status: "uploading" as const,
      file,
    }))

    setUploadingFiles((prev) => [...prev, ...newUploadingFiles])

    newUploadingFiles.forEach((uploadingFile) => {
      simulateUploadAndSave(uploadingFile)
    })
  }

  const simulateUploadAndSave = (uploadingFile: UploadingFile) => {
    const interval = setInterval(() => {
      setUploadingFiles((prev) =>
        prev.map((file) => {
          if (file.id === uploadingFile.id) {
            const newProgress = Math.min(file.progress + Math.random() * 30, 100)
            const status = newProgress === 100 ? "completed" : "uploading"
            return { ...file, progress: newProgress, status }
          }
          return file
        }),
      )
    }, 500)

    setTimeout(() => {
      clearInterval(interval)

      // Create a mock URL for the file (in a real app, this would be uploaded to cloud storage)
      const fileUrl = URL.createObjectURL(uploadingFile.file)

      // Add asset to client in data store
      const success = dataStore.addAssetToClient(clientId, {
        name: uploadingFile.file.name,
        type: uploadingFile.file.type,
        size: uploadingFile.file.size,
        url: fileUrl,
      })

      setUploadingFiles((prev) =>
        prev.map((file) =>
          file.id === uploadingFile.id ? { ...file, progress: 100, status: success ? "completed" : "error" } : file,
        ),
      )

      if (success && onUploadComplete) {
        onUploadComplete()
      }
    }, 3000)
  }

  const removeFile = (fileId: string) => {
    setUploadingFiles((prev) => prev.filter((file) => file.id !== fileId))
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Upload Assets</h3>
        <p className="text-muted-foreground mb-4">Drag and drop files here, or click to select files</p>
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.zip,.rar"
        />
        <Button asChild>
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            Choose Files
          </label>
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Supported formats: PDF, DOC, DOCX, JPG, PNG, GIF, ZIP, RAR (Max 10MB each)
        </p>
      </div>

      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Uploading Files</h4>
          {uploadingFiles.map((file) => (
            <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <FileText className="h-8 w-8 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                {file.status === "uploading" && (
                  <div className="mt-2">
                    <Progress value={file.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{Math.round(file.progress)}% uploaded</p>
                  </div>
                )}
                {file.status === "error" && <p className="text-xs text-red-500 mt-1">Upload failed</p>}
              </div>
              <div className="flex items-center gap-2">
                {file.status === "completed" && <CheckCircle className="h-5 w-5 text-green-500" />}
                <Button variant="ghost" size="icon" onClick={() => removeFile(file.id)} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
