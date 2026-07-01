'use client'

import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase-client"
import { useCallback, useMemo, useState } from "react"
import { toast } from "sonner"
import { FileUploadDropzone, FileUploadItem, FileUploadList, FileUploadTrigger, FileUpload as UploadFiles } from "@/components/ui/file-upload"
import { Upload } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import React from "react"
import { useSession } from "@/lib/auth"



const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5501/api'


export const FileUpload = ({projectId}: {projectId: number}) => {

  const [file, setFile] = useState<File | null>(null)
  const [uploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const { data: session } = useSession()
  const user = session?.user


  const handleUpload = async () => {
    if (!file || !user) return

    setIsUploading(true)
    setProgress(0)

    try {
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', String(projectId))

      const xhr = new XMLHttpRequest()
      xhr.open('POST', `${API_BASE}/projects/attachments/upload`)
      xhr.withCredentials = true // Ensures cookies are sent for authentication
      
      // Listen for progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100)
          setProgress(percentComplete)
        }
      }

      await new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.response)
          } else {
            reject(new Error('Upload failed'))
          }
        }
        xhr.onerror = () => reject(new Error('Network error'))
        xhr.send(formData)
      })
      
      toast.success('File uploaded successfully!')
    } catch (error) {
      console.log('Upload error:', error)
      toast.error('Failed to upload file')
    } finally {
      setIsUploading(false)
      setProgress(0)
      setFile(null)
    }
  }


  const saveFilesToProject = async (projectId: number, filePath: string, publicUrl: string) => {
    await fetch (`${API_BASE}/projects/attachments/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        projectId,
        filePath,
        publicUrl
      })
    })
  }

  const onFileReject = useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    });
  }, []);


  return (
    <UploadFiles
      maxFiles={1}
      maxSize={20 * 1024 * 1024}
      onUpload={handleUpload}
      disabled={uploading}
      progress={progress}
      value={file ? [file] : []}
      onValueChange={(files) => setFile(files[0] || null)}
      onFileReject={onFileReject}
      className="w-full max-w-md"
    >

    <FileUploadDropzone>
      <div className="flex flex-col items-center gap-1 text-center">
        <div className="flex items-center justify-center rounded-full border p-2.5">
          <Upload className="w-4 h-4 text-muted-foreground" />
        </div>
        <p className="font-medium text-sm">Drag & drop files here</p>
        <p className="text-xs text-muted-foreground">or click to browse (up to 20MB)</p>
        {/* Display upload progress and file name */}
        
        {uploading && (
          <div className="mt-2 w-full">
            <Progress value={progress} className="w-full" />
            <p className="text-xs text-muted-foreground">{progress}%</p>
            <p className="text-xs text-muted-foreground">{file?.name}</p>
          </div>
        )}

        {!uploading && file && (
          <div className="mt-2 w-full">
            <p className="text-xs text-muted-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground">{file.size} bytes</p>
          </div>
        )}
      </div>
      <FileUploadTrigger asChild>
        <Button 
          variant={'outline'}
          size={'sm'}
          className="mt-2 w-fit"
          >
            Browse files
          </Button>
      </FileUploadTrigger>
    </FileUploadDropzone>
    <FileUploadDropzone>
      <FileUploadList>
        {file && (
          <FileUploadItem
            key={file.name}
            value={file}
          />
        )}
      </FileUploadList>
    </FileUploadDropzone>
    </UploadFiles>
  )
} 