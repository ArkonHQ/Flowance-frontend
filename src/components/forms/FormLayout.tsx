'use client'

import { FormModal } from "./FormModal"
import { Button } from "@/components/ui/button"
import { LoadingOverlay } from "@/components/ui/loading-overlay"
import { AnimatePresence } from "framer-motion"
import { ArrowUpRight, X } from "lucide-react"

interface FormLayoutProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  isSubmitting: boolean
  loadingMessage?: string
  loadingSubMessage?: string
  title: string
  icon: React.ReactNode
  submitLabel?: string
  submittingLabel?: string
  leftColumn: React.ReactNode
  rightColumn: React.ReactNode
}

export const FormLayout = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  loadingMessage = '',
  loadingSubMessage = '',
  title,
  icon,
  submitLabel = 'Create',
  submittingLabel = 'Creating...',
  leftColumn,
  rightColumn
}: FormLayoutProps) => {
  return (
    <FormModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl">
      <AnimatePresence>
        {isSubmitting && (
          <LoadingOverlay message={loadingMessage} subMessage={loadingSubMessage} />
        )}
      </AnimatePresence>

      <div className="relative flex flex-col h-full w-full">
        {/* Premium Gradient Accent */}
        <div className="absolute left-0 right-0 top-0 h-[3px] bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 z-10" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/20 px-6 py-5 shrink-0 bg-muted/5">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
          </div>
          <Button
            type="button"
            variant={'ghost'}
            size={'icon'}
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form Body */}
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6">
              {leftColumn}
            </div>

            {/* Right Column: Parameters & Goals */}
            <div className="lg:col-span-5 space-y-6">
              {rightColumn}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-border/20 pt-6 flex items-center justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant={'outline'}
              onClick={onClose}
              className="rounded-xl border-border/40 hover:bg-muted/40 h-10 px-5 text-xs font-medium transition-all"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 h-10 px-6 text-xs flex items-center gap-1.5 transition-all"
            >
              <span>{isSubmitting ? submittingLabel : submitLabel}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </form>
      </div>
    </FormModal>
  )
}
