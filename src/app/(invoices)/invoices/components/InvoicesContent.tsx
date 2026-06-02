'use client'

import { Invoice } from '@/lib/api/invoices'
import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { InvoicesRow } from './InvoicesRow'
import { InvoiceForm } from './InvoiceForm'
import { PaginationFooter } from '@/app/components/pagination-footer'
import { QuickOverview } from './QuickOverview'

interface Props  {
  initialInvoices: Invoice []
  clients: { id: number; name: string }[]
  projects: { id: number; title: string }[]
}

export const InvoicesContent = ({ initialInvoices, clients, projects }: Props) => {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const pageSize = 7
  const [currentPage, setCurrentPage] = useState(1)

  const clientMap = useMemo(() => 
    new Map(clients.map(c => [c.id, c.name])),
    [clients]
  )

  const projectMap = useMemo(() => 
    new Map(projects.map(p => [p.id, p.title])),
    [projects]
  )

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const clientName = clientMap.get(invoice.clientId)?.toLowerCase() || ''
      const projectName = projectMap.get(invoice.projectId)?.toLowerCase() || ''
      const query = searchQuery.toLowerCase()
      return clientName.includes(query) || projectName.includes(query) || `#${invoice.id}`.includes(query)
    })
  }, [invoices, searchQuery, clientMap, projectMap])

  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const totalPages = Math.ceil(filteredInvoices.length / pageSize)

  const handleOnChange = (page: number) => {
    setCurrentPage(page)
    setSelectedIds(new Set())
  }

  const handleToggle = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSelectAll = (checked: boolean) => {
    const next = new Set(selectedIds)
    paginatedInvoices.forEach(i => {
      if (checked) next.add(i.id)
      else next.delete(i.id)
    })
    setSelectedIds(next)
  }

  const isAllSelected = paginatedInvoices.length > 0 && paginatedInvoices.every(i => selectedIds.has(i.id))

  const statsSummary = useMemo(() => {
    return {
      totalRevenue: invoices.reduce((sum, inv) => sum + Number(inv.amount), 0),
      paidCount: invoices.filter(i => i.status === 'paid').length,
      pendingCount: invoices.filter(i => i.status === 'sent' || i.status === 'partially_paid' || i.status === 'draft').length,
      overdueCount: invoices.filter(i => i.status === 'overdue').length,
      totalInvoices: invoices.length
    }
  }, [invoices])

  return (
    <div className="max-w-7xl mx-auto w-full px-4 py-8 pb-28">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Invoices</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
              {invoices.length} total
            </span>
          </div>

          
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search invoices..." 
                className="pl-9 bg-card/40 backdrop-blur-sm border-border/40"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <InvoiceForm clients={clients} projects={projects} />
          </div>
        </div>

        <QuickOverview 
          totalInvoices={statsSummary.totalInvoices}
          paidInvoices={statsSummary.paidCount}
          unpaidInvoices={statsSummary.pendingCount}
          totalRevenue={statsSummary.totalRevenue}
          totalOverdue={statsSummary.overdueCount}
          totalInvoicesTrend={statsSummary.totalInvoices}
          paidInvoicesTrend={statsSummary.paidCount}
          unpaidInvoicesTrend={statsSummary.pendingCount}
          totalRevenueTrend={statsSummary.totalRevenue}
          totalOverdueTrend={statsSummary.overdueCount}
        />

        <div className='flex flex-col gap-4 w-full'>
          {/* Table Header */}
          <div className='grid grid-cols-15 gap-4 py-4 px-5 text-[11px] font-bold text-muted-foreground tracking-widest uppercase sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b border-border/40'>
            <div className='col-span-1 flex justify-center items-center'>
              <Checkbox 
                checked={isAllSelected}
                onCheckedChange={(checked) => handleSelectAll(!!checked)}
                aria-label="Select all invoices on current page"
              />
            </div>
            <div className='col-span-1 flex justify-center'>ID</div>
            <div className='col-span-2 text-left'>Client</div>
            <div className='col-span-2 text-left'>Project</div>
            <div className='col-span-2 flex justify-center'>Date</div>
            <div className='col-span-2 flex justify-center'>Due Date</div>
            <div className='col-span-2 flex justify-center'>Amount</div>
            <div className='col-span-2 flex justify-center'>Status</div>
            <div className='col-span-1'></div>
          </div>

          {/* Rows */}
          <div className='flex flex-col gap-3 px-1'>
            {paginatedInvoices.map((invoice) => {
              return (
                <InvoicesRow 
                  key={invoice.id} 
                  invoice={invoice} 
                  clientName={clientMap.get(invoice.clientId) || `Client ${invoice.clientId}`}
                  projectName={projectMap.get(invoice.projectId) || `Project ${invoice.projectId}`}
                  isSelected={selectedIds.has(invoice.id)}
                  onToggle={handleToggle}
                  onDelete={(id) => setInvoices(prev => prev.filter(inv => inv.id !== id))} 
                />
              );
            })}

            <PaginationFooter 
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredInvoices.length}
              pageSize={pageSize}
              onChangePage={handleOnChange}
              label='Invoices'
            />
          </div>
        </div>
      </div>
    </div>
  )
}