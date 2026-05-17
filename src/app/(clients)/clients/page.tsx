'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ClientCard } from './components/ClientCard';
import { PlusIcon, SearchIcon, Users, AlertCircle } from 'lucide-react';
import { getAllClients } from '@/lib/api/clients';
import type { Client } from '@/lib/api/clients';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const ClientPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getAllClients()
      .then(setClients)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className="container mx-auto py-20 text-center space-y-4">
        <div className="rounded-full bg-destructive/10 p-4 mx-auto w-fit">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-destructive font-medium">Something went wrong: {error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container mx-auto py-8 px-4 md:px-6 space-y-6"
    >
      {/* Header */}
        <div className='flex items-end justify-between mb-6'>
          
        {/* Left side */}

        <div className='flex flex-col gap-2'>
          <h2 className='text-2xl font-bold'>All clients</h2>
          <nav className='flex gap-20 text-sm font-medium text-gray-500 ml-8'>
            <Link href={"/clients"} className='text-indigo-600 border-b-2 border-indigo-600 pb-1'>All</Link>
            <Link href={"/clients?status=active"} className='hover:text-indigo-600'>Active</Link>
            <Link href={"/clients?status=at-risk"} className='hover:text-indigo-600'>At Risk</Link>
            <Link href={"/clients?status=inactive"} className='hover:text-indigo-600'>Inactive</Link>
          </nav>
        </div>
        {/* Right side */}
        <div className='flex items-center gap-3'>
          <div className='relative'>
            <i data-lucide='search' className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400'></i>
            <input
              type="text"
              placeholder="Search clients..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-64 text-sm text-gray-900 placeholder:text-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all duration-200"
            />
          </div>
          <div className='ml-16 flex items-center gap-3'>
          <button className='flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors duration-200'>
            <i data-lucide='filter' className='h-4 w-4 text-gray-400'></i>
            Filters
          </button>
          <button className='flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors duration-200'>
            <i data-lucide='download' className='h-4 w-4 text-gray-400'></i>
            Export
          </button>
        </div>
        </div>

      </div>

      {/* Loading skeleton */}
      {loading && <ClientsLoadingSkeleton />}

      {/* Empty state */}
      {!loading && clients.length === 0 && (
        <motion.div variants={itemVariants} className="flex flex-col items-center justify-center py-20">
          <div className="rounded-full bg-muted/60 p-6 mb-6 backdrop-blur-sm">
            <Users className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">No clients yet</h3>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            You haven’t added any clients. Start building your client list and
            track projects effortlessly.
          </p>
          <Link href="/clients/new">
            <Button className="gap-2">
              <PlusIcon className="h-4 w-4" />
              Add your first client
            </Button>
          </Link>
        </motion.div>
      )}

      {/* Client grid */}
      {!loading && filteredClients.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredClients.map((client) => (
            <motion.div key={client.id} variants={itemVariants}>
              <ClientCard client={client} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* No search results */}
      {!loading && clients.length > 0 && filteredClients.length === 0 && (
        <motion.div variants={itemVariants} className="text-center py-16 space-y-3">
          <SearchIcon className="mx-auto h-8 w-8 text-muted-foreground/60" />
          <p className="text-lg font-medium">No clients match your search</p>
          <Button variant="link" onClick={() => setSearchTerm('')}>
            Clear search
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

// ─── Loading Skeleton ─────────────────────────
const ClientsLoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <Card key={i} className="relative border border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden pl-4">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-muted" />
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <div className="flex justify-between pt-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default ClientPage;