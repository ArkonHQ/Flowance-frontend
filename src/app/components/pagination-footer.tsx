'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMemo, useCallback } from 'react'

const generatePageNumbers = (currentPage: number, totalPages: number): (number | 'ellipsis')[] => {

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages: (number | 'ellipsis')[] = []

  if (currentPage > 3) pages.push('ellipsis')

  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  for (let i = start; i <= end; i++) pages.push(i)

  if (currentPage < totalPages - 2) pages.push('ellipsis')


  pages.push(totalPages)

  return pages
}


interface PaginationFooterProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onChangePage: (page: number) => void
  label?: string
}



export const PaginationFooter = ({ currentPage, totalPages, totalItems, pageSize, onChangePage, label = 'items' }: PaginationFooterProps) => {

  // page numbers (memoized) 
  const pageNumbers = useMemo(() => generatePageNumbers(currentPage, totalPages),
    [currentPage, totalPages])

  //--------------- Display range
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  //-------------- Handlers
  const handlePrev = useCallback(() => {
    onChangePage(currentPage - 1)
  }, [currentPage, onChangePage])

  const handleNext = useCallback(() => {
    onChangePage(currentPage + 1)
  }, [currentPage, onChangePage])

  const handlePageClick = useCallback(
    (page: number) => {
      onChangePage(page)
    }, [onChangePage]
  )

  // Don't render if no pages 
  return (
    <nav
      className='flex flex-col sm:flex-row items-center justify-between gap-4 text-sm'
      aria-label='Pagination'
    >
      {/* Left: Showing info */}
      <p className='font-medium text-muted-foreground'>
        Showing {startItem} to {endItem} of {totalItems} {label}
      </p>

      {/* Right: page buttons */}
      <div className='flex items-center gap-1'>
        {/* Previous */}
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8 rounded-lg hover:bg-accent hover:text-accent-foreground'
          disabled={currentPage === 1}
          onClick={handlePrev}
        >
          <ChevronLeft className='h-4 w-4' />
        </Button>

        {/* Page numbers */}
        {pageNumbers.map((page, idx) =>
          page === 'ellipsis' ? (
            <span
              key={`ellipsi-${idx}`}
              className='h-8 w-8 flex items-center justify-center text-muted-foreground/50 select-none'
            >
              …
            </span>
          ) : (
            <Button
              key={page}
              variant='ghost'
              size='icon'
              className={cn('h-8 w-8 rounded-lg text-sm font-medium border border-transparent',
                page === currentPage
                  ? 'bg-accent text-accent-foreground border-accent hover:bg-accent/80 hover:text-accent-foreground transition-colors'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
              onClick={() => handlePageClick(page)}
            >
              {page}
            </Button>
          )
        )}

        {/* Next */}
        <Button 
          variant='ghost'
          size='icon'
          className='h-8 w-8 rounded-lg hover:bg-accent hover:text-accent-foreground'
          disabled={currentPage === totalPages}
          onClick={handleNext}
          aria-label='Next page'
        >
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>
    </nav>
  )
}