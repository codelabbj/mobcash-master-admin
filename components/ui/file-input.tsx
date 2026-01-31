"use client"

import * as React from "react"
import { Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import Image from "next/image"

export interface FileInputProps extends Omit<React.ComponentProps<"input">, "type" | "onChange"> {
  onFileChange?: (file: File | null) => void
  previewUrl?: string | null
  onRemove?: () => void
  accept?: string
  maxSize?: number // in bytes
  label?: string
  description?: string
  showPreview?: boolean
}

export function FileInput({
  className,
  onFileChange,
  previewUrl,
  onRemove,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  label,
  description,
  showPreview = true,
  disabled,
  ...props
}: FileInputProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [localPreviewUrl, setLocalPreviewUrl] = React.useState<string | null>(previewUrl || null)

  React.useEffect(() => {
    setLocalPreviewUrl(previewUrl || null)
  }, [previewUrl])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) {
      onFileChange?.(null)
      setLocalPreviewUrl(null)
      return
    }

    // Validate file type
    if (accept) {
      const acceptPatterns = accept.split(",").map((pattern) => pattern.trim())
      const matches = acceptPatterns.some((pattern) => {
        if (pattern === "*/*") return true
        if (pattern.endsWith("/*")) {
          const baseType = pattern.split("/")[0]
          return file.type.startsWith(`${baseType}/`)
        }
        return file.type === pattern
      })

      if (!matches) {
        alert("Type de fichier non accepté")
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        return
      }
    }

    // Validate file size
    if (maxSize && file.size > maxSize) {
      alert(`Le fichier ne doit pas dépasser ${(maxSize / 1024 / 1024).toFixed(0)}MB`)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      return
    }

    onFileChange?.(file)

    // Create preview URL for images
    if (showPreview && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLocalPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemove = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setLocalPreviewUrl(null)
    onFileChange?.(null)
    onRemove?.()
  }

  const displayPreview = showPreview && localPreviewUrl

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      <div className="space-y-4">
        {displayPreview ? (
          <div className="relative w-full h-64 border-2 border-dashed border-border rounded-lg overflow-hidden bg-muted/20">
            <img
              src={localPreviewUrl}
              alt="Preview"
              className="w-full h-full object-contain"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              "border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              Cliquez pour télécharger ou glissez-déposez un fichier
            </p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={disabled}
            className={cn(
              "cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed w-full text-sm text-foreground border border-input rounded-md px-3 py-2 bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              className
            )}
            {...props}
          />
        </div>
      </div>
    </div>
  )
}

