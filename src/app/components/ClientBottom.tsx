'use client'

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"


interface FooterProps {
    currentPage: number
    totalPages: number
    totalItems: number
    pageSize: number
    onPageChange: (page: number) => void
}

export const PaginationFooter = ({ currentPage, totalPages, totalItems, pageSize, onPageChange }: FooterProps) => {
    // Calculate the range of items to display
    const setItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
    const endItem = Math.min(currentPage * pageSize, totalItems)

    // Generate page numbers to display (max 5 visile)
    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = []

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
            pages.push(1)
            
            if (currentPage > 3) pages.push('ellipsis')
                const start = Math.max(2, currentPage - 1)
                const end = Math.min (totalPages - 1, currentPage + 1)
                for (let i = start; i <= end; i++) pages.push(i)
                if (currentPage < totalPages - 2) pages.push('ellipsis')
                pages.push(totalPages)
        }
        return pages
    }

    if (totalPages === 0 ) return null

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-900">

            {/* Left: Showing info */}
            <p className="font-medium text-gray-600">
                Showing {setItem} to {endItem} of {totalItems} clients
            </p>

            {/* Right: page buttons */}
            <div className="flex items-center gap-1">
                
                {/* previous buttons */}
                <Button 
                    variant='ghost'
                    size="icon"
                    className="h-8 w-8 rounded-lg hover:bg-gray-100"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    >
                        <ChevronLeft className='h-4 w-4'/>
                    </Button>

                    {/* Page numbers */}
                    {getPageNumbers().map((page,idx) => page === 'ellipsis' ? (
                        <span 
                            key={`ellipsis-${idx}`}
                            className="h-8 w-8 flex items-center justify-center text-gray-400"
                            >...</span>
                    ) : (
                        <Button 
                            key={page}
                            variant={'ghost'}
                            size={'icon'}
                            className={cn(
                                ' h-8 w-8 rounded-lg text-sm font-medium',
                                page === currentPage
                                ? 'bg-indigo-50 text-indigo-600 border-indigo-800 hover:bg-indigo-100'
                                : 'text-gray-600 hover:bg-gray-400'
                            )}
                            onClick={() => onPageChange(page)}
                            >
                                {page}
                            </Button>
                    )    
                )}

                {/* Next buttons */}
                <Button 
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg hover:bg-gray-100"
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    >
                        <ChevronRight className='h-4 w-4'/>
                </Button>
            </div>
        </div>
    )
}