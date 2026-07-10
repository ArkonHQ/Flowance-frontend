'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase-client'
import { toast } from 'sonner'
import { Camera, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface AvatarUploadProps {
  currentImage?: string | null
  fallback: string
  onUpload: (url: string) => void | Promise<void>
  size?: 'sm' | 'md' | 'lg' | 'xl'
  bucket?: string
  folder?: string
  className?: string
  disabled?: boolean
}

const sizeMap = {
  sm: 'h-10 w-10',
  md: 'h-16 w-16',
  lg: 'h-20 w-20',
  xl: 'h-28 w-28',
}

const iconSizeMap = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-4 w-4',
  xl: 'h-5 w-5',
}

export function AvatarUpload({
  currentImage,
  fallback,
  onUpload,
  size = 'lg',
  bucket = 'avatars',
  folder = 'uploads',
  className,
  disabled = false,
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    if (disabled || uploading) return
    inputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB')
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    setUploading(true)

    try {
      const ext = file.name.split('.').pop()
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { upsert: true, contentType: file.type })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
      if (!data?.publicUrl) throw new Error('Failed to get public URL')

      await onUpload(data.publicUrl)
      toast.success('Image updated successfully')
    } catch (err: any) {
      toast.error(err.message || 'Upload failed')
      setPreview(null)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const displayImage = preview || currentImage

  return (
    <div
      className={cn('relative group cursor-pointer select-none', sizeMap[size], className)}
      onClick={handleClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label="Upload image"
    >
      <Avatar className={cn(
        'ring-2 ring-border/30 ring-offset-2 ring-offset-background',
        'transition-all group-hover:ring-primary/60 group-hover:shadow-lg',
        sizeMap[size]
      )}>
        <AvatarImage src={displayImage || undefined} alt="Avatar" className="object-cover" />
        <AvatarFallback className="bg-primary/10 text-primary font-bold">
          {fallback}
        </AvatarFallback>
      </Avatar>

      <div className={cn(
        'absolute inset-0 rounded-full flex items-center justify-center',
        'bg-black/0 group-hover:bg-black/50 transition-all duration-200',
        uploading && 'bg-black/50'
      )}>
        {uploading ? (
          <Loader2 className={cn('text-white animate-spin', iconSizeMap[size])} />
        ) : (
          <Camera className={cn('text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md', iconSizeMap[size])} />
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || uploading}
      />
    </div>
  )
}
