'use client'

import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

interface LoadingOverlayProps {
  message: string
  subMessage?: string
}

export const LoadingOverlay = ({message, subMessage}: LoadingOverlayProps) => {
  
  return(
    <motion.div
      initial={{opacity:0}}
      animate={{opacity: 1}}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/90  backdrop-blur-md"
    >

      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-lg font-semibold tracking-wide animate-pulse mt-4">
        {message}
      </p>
      {subMessage && (
        <p className="text-xs text-muted-foreground mt-1">
          {subMessage}
        </p>
      )}

    </motion.div>
  )
}