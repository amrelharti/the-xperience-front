"use client"

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image as ImageIcon, FileText } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onFileSelect: (file: File | null) => void
  accept?: {
    [key: string]: string[]
  }
  maxSize?: number
  className?: string
  placeholder?: string
  currentFile?: File | null
  currentUrl?: string
}

export function FileUpload({
  onFileSelect,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'text/plain': ['.txt']
  },
  maxSize = 2 * 1024 * 1024, // 2MB for database compatibility
  className,
  placeholder = "Drag and drop a file here, or click to select",
  currentFile = null,
  currentUrl = ""
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setError(null)
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setPreview(null)
      }
      
      onFileSelect(file)
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    onDropRejected: (fileRejections) => {
      const error = fileRejections[0]?.errors[0]
      if (error?.code === 'file-too-large') {
        setError(`File is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`)
      } else if (error?.code === 'file-invalid-type') {
        setError('Invalid file type. Please select a valid file.')
      } else {
        setError('File upload failed. Please try again.')
      }
    }
  })

  const handleRemove = () => {
    setPreview(null)
    onFileSelect(null)
    setError(null)
  }

  const getFileIcon = () => {
    if (preview && preview.startsWith('data:image/')) {
      return <ImageIcon className="h-8 w-8 text-blue-500" />
    }
    return <FileText className="h-8 w-8 text-gray-500" />
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
          error && "border-red-500 bg-red-50"
        )}
      >
        <input {...getInputProps()} />
        
        {preview ? (
          <div className="space-y-2">
            {preview.startsWith('data:image/') ? (
              <img
                src={preview}
                alt="Preview"
                className="mx-auto h-24 w-24 object-cover rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center space-y-2">
                {getFileIcon()}
                <span className="text-sm text-gray-600">File selected</span>
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleRemove()
              }}
              className="mt-2"
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-600">{placeholder}</p>
            <p className="text-xs text-gray-500">
              Max size: {maxSize / (1024 * 1024)}MB
            </p>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <p className="text-xs text-muted-foreground mt-1">
        Max file size: 2MB (for database compatibility)
      </p>
    </div>
  )
}
