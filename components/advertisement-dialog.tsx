"use client"

import type React from "react"

import { useState } from "react"
import { useCreateAdvertisement, useUpdateAdvertisement, type AdvertisementInput, type Advertisement } from "@/hooks/useAdvertisements"
import { uploadFile } from "@/lib/upload"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { FileInput } from "@/components/ui/file-input"
import { Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useEffect } from "react"

interface AdvertisementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  advertisement?: Advertisement | null
}

export function AdvertisementDialog({ open, onOpenChange, advertisement }: AdvertisementDialogProps) {
  const createAdvertisement = useCreateAdvertisement()
  const updateAdvertisement = useUpdateAdvertisement()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [enable, setEnable] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

  const isEditing = !!advertisement

  const getImageUrl = (url: string) => {
    if (!url) return null
    if (url.startsWith("http")) return url
    return `https://api.zefast.net${url.startsWith("/") ? "" : "/"}${url}`
  }

  useEffect(() => {
    if (open) {
      if (advertisement) {
        setPreviewUrl(getImageUrl(advertisement.image))
        setEnable(advertisement.enable)
      } else {
        setPreviewUrl(null)
        setEnable(true)
      }
      setSelectedFile(null)
    }
  }, [open, advertisement])

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file)
    if (file) {
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      if (!isEditing) {
        setPreviewUrl(null)
      } else {
        setPreviewUrl(advertisement?.image || null)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile && !isEditing) {
      alert("Veuillez sélectionner une image")
      return
    }

    try {
      setIsUploading(true)

      let imageUrl = advertisement?.image || ""

      if (selectedFile) {
        // Upload file first
        imageUrl = await uploadFile(selectedFile)
      }

      const formData: AdvertisementInput = {
        image: imageUrl,
        enable,
      }

      if (isEditing && advertisement) {
        updateAdvertisement.mutate(
          { id: advertisement.id, data: formData },
          {
            onSuccess: () => {
              onOpenChange(false)
            },
          }
        )
      } else {
        createAdvertisement.mutate(formData, {
          onSuccess: () => {
            onOpenChange(false)
          },
        })
      }
    } catch (error) {
      // Error is already handled by uploadFile
    } finally {
      setIsUploading(false)
    }
  }

  const handleDialogClose = (open: boolean) => {
    onOpenChange(open)
  }

  const isPending = createAdvertisement.isPending || updateAdvertisement.isPending || isUploading

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifier la Publicité" : "Créer une Publicité"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Modifiez les détails de la publicité" : "Ajoutez une nouvelle publicité avec une image"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FileInput
            label="Image *"
            accept="image/*"
            maxSize={5 * 1024 * 1024}
            onFileChange={handleFileChange}
            previewUrl={previewUrl}
            description="Formats acceptés: JPG, PNG, GIF (max 5MB)"
            disabled={isPending}
            required={!isEditing}
          />

          {isEditing && advertisement && (
            <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-border/50">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID</span>
                <p className="text-sm font-mono bg-muted p-2 rounded">{advertisement.id}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Statut Actuel</span>
                <div>
                  <Badge variant={advertisement.enable ? "default" : "secondary"}>
                    {advertisement.enable ? "Actif" : "Inactif"}
                  </Badge>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Créé le</span>
                <p className="text-sm text-foreground">
                  {advertisement.created_at ? new Date(advertisement.created_at).toLocaleString() : "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mis à jour le</span>
                <p className="text-sm text-foreground">
                  {advertisement.updated_at ? new Date(advertisement.updated_at).toLocaleString() : "N/A"}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="enable">Activer la publicité</Label>
            <Switch
              id="enable"
              checked={enable}
              onCheckedChange={setEnable}
              disabled={isPending}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDialogClose(false)}
              disabled={isPending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isPending || (!selectedFile && !isEditing)}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploading ? "Téléchargement..." : isEditing ? "Modification..." : "Création..."}
                </>
              ) : (
                isEditing ? "Modifier la Publicité" : "Créer la Publicité"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

