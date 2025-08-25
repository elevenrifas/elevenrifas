"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  value?: string
  onChange: (value: string) => void
  className?: string
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido')
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB')
      return
    }

    setIsUploading(true)

    try {
      // Crear FormData para enviar la imagen
      const formData = new FormData()
      formData.append('image', file)

      // Enviar imagen al servidor
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Error al subir la imagen')
      }

      const data = await response.json()
      
      // Actualizar el valor y preview
      onChange(data.imageUrl)
      setPreview(data.imageUrl)
      
    } catch (error) {
      console.error('Error al subir imagen:', error)
      alert('Error al subir la imagen. Por favor intenta de nuevo.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    onChange('')
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const files = event.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        // Simular selección de archivo
        const input = fileInputRef.current
        if (input) {
          input.files = files
          handleFileSelect({ target: { files } } as any)
        }
      }
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Input de archivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        id="image-upload"
      />

      {/* Área de subida */}
      {!preview ? (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="space-y-2">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="text-sm text-gray-600">
              <label htmlFor="image-upload" className="cursor-pointer">
                <span className="font-medium text-primary hover:text-primary/80">
                  Haz clic para subir
                </span>{' '}
                o arrastra y suelta
              </label>
            </div>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF hasta 5MB
            </p>
          </div>
        </div>
      ) : (
        /* Preview de la imagen */
        <div className="relative">
          <div className="relative w-full h-48 rounded-lg overflow-hidden border">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>
          
          {/* Botón para remover */}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Botón de subida manual */}
      {!preview && (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
              Subiendo...
            </>
          ) : (
            <>
              <ImageIcon className="h-4 w-4 mr-2" />
              Seleccionar Imagen
            </>
          )}
        </Button>
      )}
    </div>
  )
}
