import { useMemo } from 'react';
import { Invoice } from '@/lib/api/invoices';

export const useInvoiceFormatter = () => {
    const formatInvoiceId = useMemo(() => {
        return (invoice: Invoice | { id: number, createdAt?: Date | string }) => {
            const date = invoice.createdAt ? new Date(invoice.createdAt) : new Date();
            const year = date.getFullYear();
            return `INV-${year}-${String(invoice.id).padStart(4, '0')}`;
        };
    }, []);

    return { formatInvoiceId };
};
