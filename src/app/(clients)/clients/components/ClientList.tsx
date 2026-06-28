'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ClientCard } from '@/app/(clients)/clients/components/ClientCard';
import { PlusIcon, Users, Search } from 'lucide-react';
import type { Client, ClientInsight } from '@/lib/api/clients';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ExportIcon } from '@/components/icons/mi-export';
import { SearchIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SortDescIcon } from 'lucide-react';
import { QuickOverview } from './QuickOverview'
import InsightsWidget from './InsightsWidget';
import { PaginationFooter } from '@/app/components/pagination-footer';


const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface ClientPageProps {
  initialClients: Client[];
  insightMap: Map<number, ClientInsight>;
  statusFilter?: string;
}

const ClientPage = ({ initialClients, insightMap, statusFilter }: ClientPageProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // 1. Apply status filter from URL
  let statusFilteredClients = initialClients;
  if (statusFilter && statusFilter !== 'all') {
    statusFilteredClients = initialClients.filter(client => {
      const insight = insightMap.get(Number(client.id));
      const rawStatus = client.status || 'inactive';
      const currentStatus = rawStatus.replace('_', '-').toLowerCase();
      return currentStatus === statusFilter.toLowerCase();
    });
  }

  // 2. Apply search filter
  const filteredClients = statusFilteredClients.filter(
    (client: Client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 3. Apply pagination to the ALREADY filtered list
  const totalPages = Math.ceil(filteredClients.length / pageSize);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  // --- Aggregate Stats for Dashboard ---
  const allInsights = Array.from(insightMap.values());
  
  const totalClients = initialClients.length;
  const activeClients = initialClients.filter(c => {
    const rawStatus = c.status || 'inactive';
    const status = rawStatus.replace('_', '-').toLowerCase();
    return status === 'active';
  }).length;
  
  const totalRevenue = allInsights.reduce((sum, i) => sum + (i.totalEarned || 0), 0);
  const pendingPayments = allInsights.reduce((sum, i) => sum + (i.unpaidAmount || 0), 0);
  const totalProjectsCount = allInsights.reduce((sum, i) => sum + (i.totalProjects || 0), 0);
  const avgProjectValue = totalProjectsCount > 0 ? Math.round(totalRevenue / totalProjectsCount) : 0;



  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // If no clients at all
  if (initialClients.length === 0) {
    return (
      <motion.div variants={itemVariants} className="flex flex-col items-center justify-center py-20">
        <div className="rounded-full bg-muted/60 p-6 mb-6 backdrop-blur-sm">
          <Users className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-semibold mb-2">No clients yet</h3>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          You haven’t added any clients. Start building your client list and track projects effortlessly.
        </p>
        <Link href="/clients/new">
          <Button className="gap-2">
            <PlusIcon className="h-4 w-4" />
            Add your first client
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen w-full'> {/* Removed py-20 to allow widgets to sit higher */}
 
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container mx-auto py-8 px-4 md:px-6 space-y-6 pb-28"
    >
          <QuickOverview
            totalClients={totalClients}
            activeClients={activeClients}
            totalRevenue={totalRevenue}
            pendingPayments={pendingPayments}
            avgProjectValue={avgProjectValue}
          />

      {/* Header – unchanged */}
      <div className='flex items-end justify-between mb-6'>
        <div className='flex flex-col gap-2'>
          <h2 className='text-2xl font-bold'>All clients</h2>
          <nav className='flex gap-20 mt-8 text-sm font-medium text-gray-500 ml-8'>
            <Link href="/clients" className={!statusFilter ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' : 'hover:text-indigo-600'}>All</Link>
            <Link href="/clients?status=active" className={statusFilter === 'active' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' : 'hover:text-indigo-600'}>Active</Link>
            <Link href="/clients?status=at-risk" className={statusFilter === 'at-risk' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' : 'hover:text-indigo-600'}>At Risk</Link>
            <Link href="/clients?status=inactive" className={statusFilter === 'inactive' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' : 'hover:text-indigo-600'}>Inactive</Link>
            <Link href="/clients?status=vip" className={statusFilter === 'vip' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' : 'hover:text-indigo-600'}>VIP</Link>
            <Link href="/clients?status=internal" className={statusFilter === 'internal' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' : 'hover:text-indigo-600'}>Internal</Link>
          </nav>
        </div>
        <div className='flex items-center gap-3'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400'/>
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-64 text-sm text-gray-900 placeholder:text-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all duration-200"
            />
          </div>
          <div className='ml-16 flex items-center gap-3'>
            <button className='flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium hover:bg-gray-200 hover:text-indigo-600 transition-all duration-200'>
              <SortDescIcon className='h-4 w-4'/> Sort
            </button>
            <button className='flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium hover:bg-gray-200 hover:text-indigo-600 transition-all duration-200'>
              <ExportIcon className='h-4 w-4'/> Export
            </button>
          </div>
        </div>
      </div>

      {/* Spans header */}
      <div className='grid grid-cols-12 gap-4 py-2 px-5 text-xs font-normal text-gray-500 tracking-wider sticky top-0 bg-background/95 backdrop-blur-sm z-10'>
        <div className='col-span-4'>Client</div>
        <div className='col-span-2'>Status</div>
        <div className='col-span-2'>Total Projects</div>
        <div className='col-span-2'>Total Revenue</div>
        <div className='col-span-1'>Last Activity</div>
        <div className='col-span-1'></div>
      </div>

      {/* Client grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-3"
      >
        {paginatedClients.map((client: Client) => (
          <motion.div key={client.id} variants={itemVariants}>
            <ClientCard
              client={client}
              insight={insightMap.get(Number(client.id))}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* No search results */}
      {filteredClients.length === 0 && searchTerm !== '' && (
        <motion.div variants={itemVariants} className="text-center py-16 space-y-3">
          <SearchIcon className="mx-auto h-8 w-8 text-muted-foreground/60" />
          <p className="text-lg font-medium">No clients match your search</p>
          <Button variant="link" onClick={() => setSearchTerm('')}>
            Clear search
          </Button>
        </motion.div>
      )}

      {/* Pagination footer */}
      {filteredClients.length > 0 && (
        <div className='fixed bottom-0 left-0 right-0 bg-background/80 dark:bg-card/80 backdrop-blur-md border-t border-border px-6 py-4 z-20 lg:left-[16rem] group-data-[state=collapsed]/sidebar-wrapper:lg:left-[3rem] transition-[left] duration-200 ease-linear'>
          <div className="max-w-7xl mx-auto w-full">
            <PaginationFooter
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredClients.length}
              pageSize={pageSize}
              onChangePage={handlePageChange}
              label='Clients'
            />
          </div>
        </div>
      )}
    </motion.div>
    </div>
  );
};

export default ClientPage;