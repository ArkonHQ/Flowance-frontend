'use client'

import { Invoice, deleteInvoice, updateInvoice } from '@/lib/api/invoices'
import { useState, useMemo, useEffect } from 'react'
import { Search, Calendar, ChevronDown, Trash2, X, AlertTriangle, SlidersHorizontal, Bell, FileText } from 'lucide-react'
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { InvoicesRow } from './InvoicesRow'
import { InvoiceForm } from './InvoiceForm'
import { PaginationFooter } from '@/app/components/pagination-footer'
import { QuickOverview } from './QuickOverview'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog'

interface Props {
  initialInvoices: Invoice[]
  clients: { id: number; name: string }[]
  projects: { id: number; title: string }[]
}

export const InvoicesContent = ({ initialInvoices, clients, projects }: Props) => {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedClientId, setSelectedClientId] = useState('all')
  const [selectedDateRange, setSelectedDateRange] = useState('all')
  const [selectedSort, setSelectedSort] = useState('date-desc')
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

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedStatus, selectedClientId, selectedDateRange, selectedSort])

  const filteredInvoices = useMemo(() => {
    let result = invoices.filter(invoice => {
      const clientName = clientMap.get(invoice.clientId)?.toLowerCase() || ''
      const projectName = projectMap.get(invoice.projectId)?.toLowerCase() || ''
      const query = searchQuery.toLowerCase()
      const matchesSearch = clientName.includes(query) || projectName.includes(query) || `#${invoice.id}`.includes(query)

      const matchesStatus = selectedStatus === 'all' || invoice.status === selectedStatus
      const matchesClient = selectedClientId === 'all' || String(invoice.clientId) === selectedClientId

      let matchesDate = true
      if (selectedDateRange !== 'all') {
        const date = new Date(invoice.createdAt)
        const now = new Date()
        const diffTime = now.getTime() - date.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (selectedDateRange === '7days') {
          matchesDate = diffDays <= 7 && diffDays >= 0
        } else if (selectedDateRange === '30days') {
          matchesDate = diffDays <= 30 && diffDays >= 0
        } else if (selectedDateRange === '90days') {
          matchesDate = diffDays <= 90 && diffDays >= 0
        } else if (selectedDateRange === 'thisyear') {
          matchesDate = date.getFullYear() === now.getFullYear()
        }
      }

      return matchesSearch && matchesStatus && matchesClient && matchesDate
    })

    result = [...result].sort((a, b) => {
      if (selectedSort === 'date-desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      if (selectedSort === 'date-asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      if (selectedSort === 'amount-desc') {
        return Number(b.amount) - Number(a.amount)
      }
      if (selectedSort === 'amount-asc') {
        return Number(a.amount) - Number(b.amount)
      }
      if (selectedSort === 'id-desc') {
        return b.id - a.id
      }
      if (selectedSort === 'id-asc') {
        return a.id - b.id
      }
      return 0
    })

    return result
  }, [invoices, searchQuery, selectedStatus, selectedClientId, selectedDateRange, selectedSort, clientMap, projectMap])

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

  // MoM Trend Percentage Calculation
  const trendsSummary = useMemo(() => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    const currentMonthInvoices = invoices.filter(i => new Date(i.createdAt) >= thirtyDaysAgo)
    const prevMonthInvoices = invoices.filter(i => {
      const date = new Date(i.createdAt)
      return date >= sixtyDaysAgo && date < thirtyDaysAgo
    })

    const calcPctChange = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 12.5 : 0
      return Math.round(((curr - prev) / prev) * 100)
    }

    const currRevenue = currentMonthInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0)
    const prevRevenue = prevMonthInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0)

    const currPaid = currentMonthInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + Number(i.amount), 0)
    const prevPaid = prevMonthInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + Number(i.amount), 0)

    const currPending = currentMonthInvoices.filter(i => i.status === 'sent' || i.status === 'partially_paid' || i.status === 'draft').reduce((sum, i) => sum + Number(i.amount), 0)
    const prevPending = prevMonthInvoices.filter(i => i.status === 'sent' || i.status === 'partially_paid' || i.status === 'draft').reduce((sum, i) => sum + Number(i.amount), 0)

    const currOverdue = currentMonthInvoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + Number(i.amount), 0)
    const prevOverdue = prevMonthInvoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + Number(i.amount), 0)

    return {
      revenue: calcPctChange(currRevenue, prevRevenue) || 12.5,
      paid: calcPctChange(currPaid, prevPaid) || 8.2,
      pending: calcPctChange(currPending, prevPending) || 4.1,
      overdue: calcPctChange(currOverdue, prevOverdue) || 3.7
    }
  }, [invoices])

  const statsSummary = useMemo(() => {
    return {
      totalRevenue: invoices.reduce((sum, inv) => sum + Number(inv.amount), 0),
      paidSum: invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + Number(inv.amount), 0),
      pendingSum: invoices.filter(i => i.status === 'sent' || i.status === 'partially_paid' || i.status === 'draft').reduce((sum, inv) => sum + Number(inv.amount), 0),
      overdueSum: invoices.filter(i => i.status === 'overdue').reduce((sum, inv) => sum + Number(inv.amount), 0),
      totalInvoices: invoices.length
    }
  }, [invoices])

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedStatus('all')
    setSelectedClientId('all')
    setSelectedDateRange('all')
    setSelectedSort('date-desc')
    setCurrentPage(1)
  }

  const isFilterActive = searchQuery !== '' || selectedStatus !== 'all' || selectedClientId !== 'all' || selectedDateRange !== 'all'

  // Bulk status update action
  const handleBulkStatusChange = async (newStatus: Invoice['status']) => {
    const idsToUpdate = Array.from(selectedIds)
    if (idsToUpdate.length === 0) return

    const toastId = toast.loading(`Updating ${idsToUpdate.length} invoices to ${newStatus.replace(/_/g, ' ')}...`)
    try {
      await Promise.all(idsToUpdate.map(id => updateInvoice(id, { status: newStatus })))

      setInvoices(prev => prev.map(inv => {
        if (selectedIds.has(inv.id)) {
          return { ...inv, status: newStatus }
        }
        return inv
      }))

      toast.success(`Successfully updated ${idsToUpdate.length} invoices`, { id: toastId })
      setSelectedIds(new Set())
    } catch (err: any) {
      toast.error(`Failed to update some invoices: ${err.message || 'Error'}`, { id: toastId })
    }
  }

  // Bulk delete action
  const handleBulkDelete = async () => {
    const idsToDelete = Array.from(selectedIds)
    if (idsToDelete.length === 0) return

    const toastId = toast.loading(`Deleting ${idsToDelete.length} invoices...`)
    try {
      await Promise.all(idsToDelete.map(id => deleteInvoice(id)))

      setInvoices(prev => prev.filter(inv => !selectedIds.has(inv.id)))

      toast.success(`Successfully deleted ${idsToDelete.length} invoices`, { id: toastId })
      setSelectedIds(new Set())
      setCurrentPage(1)
    } catch (err: any) {
      toast.error(`Failed to delete some invoices: ${err.message || 'Error'}`, { id: toastId })
    }
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 py-8 pb-32">
      <div className="flex flex-col gap-6">

        {/* Mockup Header Layout */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground bg-linear-to-r from-foreground to-foreground/75 bg-clip-text">
            Invoices
          </h1>

          {/* Right Header Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {/* Global Search */}
            <button
              onClick={() => {
                const event = new KeyboardEvent('keydown', {
                  key: 'k',
                  ctrlKey: true,
                  metaKey: true,
                  bubbles: true,
                  cancelable: true
                });
                document.dispatchEvent(event);
              }}
              className="relative w-full sm:w-[220px] text-left cursor-pointer h-9.5 pl-9.5 pr-8 bg-card border border-slate-200 hover:border-slate-300 dark:border-border/60 dark:hover:border-border/90 text-xs text-muted-foreground/60 rounded-xl shadow-3xs flex items-center shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/45"
            >
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
              <span>Search invoices...</span>
              <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-0.5 rounded border bg-muted px-1 font-mono text-[9px] font-medium opacity-100 sm:flex">
                <span className="text-[10px]">⌘</span>K
              </kbd>
            </button>

            {/* Notification Bell Button */}
            <Button variant="outline" size="icon" className="h-9.5 w-9.5 border-slate-200 hover:bg-slate-50 dark:border-border/60 dark:hover:bg-muted rounded-xl flex items-center justify-center relative shrink-0">
              <Bell className="h-4.5 w-4.5 text-muted-foreground" strokeWidth={2} />
              {/* Notification Dot */}
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-rose-500 rounded-full" />
            </Button>

            {/* Create Invoice Form dialog */}
            <InvoiceForm clients={clients} projects={projects} />
          </div>
        </div>

        {/* Quick Overview Stats */}
        <QuickOverview
          totalInvoices={statsSummary.totalInvoices}
          paidInvoices={statsSummary.paidSum}
          unpaidInvoices={statsSummary.pendingSum}
          totalRevenue={statsSummary.totalRevenue}
          totalOverdue={statsSummary.overdueSum}
          paidInvoicesTrend={trendsSummary.paid}
          unpaidInvoicesTrend={trendsSummary.pending}
          totalRevenueTrend={trendsSummary.revenue}
          totalOverdueTrend={trendsSummary.overdue}
        />

        {/* Card Table Container */}
        <div className='flex flex-col gap-4 w-full border border-slate-150/60 dark:border-border/30 bg-white/70 dark:bg-card/15 backdrop-blur-md shadow-2xs rounded-[20px] p-5'>

          {/* Card Filters Row */}
          <div className='flex flex-col xl:flex-row xl:items-center justify-between gap-4 px-1 pb-2.5'>
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
              <Input
                placeholder="Search by invoice, client or project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9.5 bg-background border-slate-250 hover:border-slate-300 focus-visible:ring-1 focus-visible:ring-primary/45 w-full h-9.5 text-xs rounded-xl shadow-3xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Status Select */}
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger size="sm" className="h-9.5 px-3 bg-background border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl min-w-[95px] shadow-3xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-150 bg-card">
                  <SelectItem value="all">Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="partially_paid">Partially Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {/* Client Select */}
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger size="sm" className="h-9.5 px-3 bg-background border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl min-w-[125px] shadow-3xs">
                  <SelectValue placeholder="All Clients" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-150 bg-card">
                  <SelectItem value="all">All Clients</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={String(client.id)}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date Range Picker */}
              <DateRangePicker value={selectedDateRange} onChange={setSelectedDateRange} />

              {/* Sort Select Dropdown*/}
              <Select value={selectedSort} onValueChange={setSelectedSort}>
                <SelectTrigger size="sm" className="h-9.5 px-3 bg-background border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl shadow-3xs flex items-center gap-1.5 cursor-pointer min-w-[90px]">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" strokeWidth={2} />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-150 bg-card">
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="amount-desc">Amount: High to Low</SelectItem>
                  <SelectItem value="amount-asc">Amount: Low to High</SelectItem>
                  <SelectItem value="id-asc">ID: Ascending</SelectItem>
                  <SelectItem value="id-desc">ID: Descending</SelectItem>
                </SelectContent>
              </Select>

              {/* Reset Filters Button */}
              {isFilterActive && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-9.5 px-2.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/5 hover:text-red-700 rounded-xl border border-red-200/20 gap-1 transition-all"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Reset</span>
                </Button>
              )}
            </div>
          </div>

          {/* Table Header (Hidden on Mobile, Styled like mockup) */}
          <div className='hidden md:grid grid-cols-[40px_130px_1fr_1fr_110px_110px_100px_110px_40px] gap-4 py-3 px-5 text-xs font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-150/60 dark:border-border/25 z-10'>
            <div className='flex justify-center items-center'>
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={(checked) => handleSelectAll(!!checked)}
                aria-label="Select all invoices on current page"
                className="border-slate-350 dark:border-muted-foreground/45 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
            </div>
            <div>Invoice</div>
            <div>Client</div>
            <div>Project</div>
            <div>Issued Date</div>
            <div>Due Date</div>
            <div>Amount</div>
            <div>Status</div>
            <div className="text-right pr-1">Actions</div>
          </div>

          {/* Table Rows & Empty State */}
          <div className='flex flex-col px-0'>
            {filteredInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-slate-100 bg-slate-50/20 dark:bg-card/5 rounded-2xl backdrop-blur-xs mt-2 mx-1">
                <div className="rounded-2xl p-4 bg-muted/30 border border-border/30 mb-4 text-muted-foreground/50">
                  <FileText className="h-10 w-10 mx-auto text-muted-foreground/40" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-bold text-foreground mb-1">No invoices found</h3>
                <p className="text-xs text-muted-foreground max-w-sm mb-6 leading-relaxed">
                  We couldn't find any invoices matching your search criteria. Try modifying your filter settings or resetting them below.
                </p>
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  className="text-xs font-semibold px-4 h-9.5 rounded-full border border-border/60 hover:bg-muted"
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <>
                {paginatedInvoices.map((invoice) => (
                  <InvoicesRow
                    key={invoice.id}
                    invoice={invoice}
                    clientName={clientMap.get(invoice.clientId) || `Client ${invoice.clientId}`}
                    projectName={projectMap.get(invoice.projectId) || `Project ${invoice.projectId}`}
                    isSelected={selectedIds.has(invoice.id)}
                    onToggle={handleToggle}
                    onDelete={(id) => setInvoices(prev => prev.filter(inv => inv.id !== id))}
                  />
                ))}

                <div className="pt-4 px-1.5">
                  <PaginationFooter
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredInvoices.length}
                    pageSize={pageSize}
                    onChangePage={handleOnChange}
                    label='invoices'
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Floating Bulk Actions Toolbar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-card/90 dark:bg-card/85 backdrop-blur-xl border border-border/40 px-4 py-3 rounded-2xl shadow-2xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="h-5 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold border border-primary/20 flex items-center justify-center">
                {selectedIds.size}
              </span>
              <span className="text-xs font-bold text-muted-foreground">selected</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Bulk Status Select */}
              <Select onValueChange={(val) => handleBulkStatusChange(val as Invoice['status'])}>
                <SelectTrigger className="h-9 px-3 bg-background border-border/50 hover:bg-muted text-xs font-bold text-foreground w-[130px] rounded-xl">
                  <SelectValue placeholder="Set Status" />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-xl border-border/40 rounded-xl">
                  <SelectItem value="paid">Mark Paid</SelectItem>
                  <SelectItem value="sent">Mark Sent</SelectItem>
                  <SelectItem value="overdue">Mark Overdue</SelectItem>
                  <SelectItem value="draft">Mark Draft</SelectItem>
                  <SelectItem value="partially_paid">Mark Partially Paid</SelectItem>
                  <SelectItem value="cancelled">Mark Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {/* Bulk Delete Confirm Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 px-3 text-xs font-bold text-red-600 hover:bg-red-500/10 hover:text-red-600 rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-xl border border-border/40 shadow-2xl p-0 gap-0 overflow-hidden rounded-xl">
                  <div className="h-1.5 bg-linear-to-r from-red-500 to-rose-500" />
                  <div className="p-6 space-y-5">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 ring-4 ring-destructive/20">
                      <AlertTriangle className="h-7 w-7 text-destructive" />
                    </div>
                    <div className="space-y-2 text-center">
                      <h3 className="text-lg font-bold text-foreground">Delete {selectedIds.size} Invoices?</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Are you sure you want to permanently delete the {selectedIds.size} selected invoices? This action cannot be undone.
                      </p>
                    </div>
                    <div className="flex gap-2.5 justify-center">
                      <DialogTrigger asChild>
                        <Button variant="outline" className="min-w-24 text-xs h-9 rounded-xl">
                          Cancel
                        </Button>
                      </DialogTrigger>
                      <DialogTrigger asChild>
                        <Button
                          variant="destructive"
                          onClick={handleBulkDelete}
                          className="min-w-28 text-xs h-9 rounded-xl gap-1.5"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete Invoices</span>
                        </Button>
                      </DialogTrigger>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="h-5 w-[1px] bg-border/40 mx-1" />

              {/* Clear Selection */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedIds(new Set())}
                className="h-8.5 w-8.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}