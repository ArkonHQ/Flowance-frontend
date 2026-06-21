'use client'

import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"


interface FormModalProps {
  isOpen: boolean
  onClose: () => void
  children?: React.ReactNode
  maxWidth?: string
  showTopBorder?: boolean
  className?: string
}


const modalTransition = {
  duration: 0.3,
  ease: [0.16, 1, 0.3, 1] as const
}

export const FormModal = ({
  isOpen, 
  onClose,
  children,
  maxWidth = 'max-w-4xl',
  showTopBorder = false,
  className,
}: FormModalProps) => {
  
  
  return(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{opacity:0}}
            animate={{opacity:1}}
            exit={{opacity:0}}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div 
            initial={{opacity:0, scale:0.95, y: 10}}
            animate= {{opacity:1, scale:1 , y:0}}
            exit={{ opacity: 0, scale:0.95, y:10 }}
            transition={modalTransition}
            className={cn(
              'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2',
              'rounded-2xl border border-border/30 bg-card/90 shadow-2xl backdrop-blur-xl',
              'max-h-[90vh] flex flex-col overflow-hidden',
              maxWidth,
              className
            )}
            >
                {children}
            </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}