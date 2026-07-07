'use server'

import { createInvoice } from '@/lib/api/invoices';
import type { Invoice } from '@/lib/api/invoices';
import { cookies } from 'next/headers';
import { getActiveTeamSlug } from '@/lib/utils/team';

type CreateInvoiceState = {
  error?: string;
  success?: boolean;
  invoice?: Invoice;
};

export const handleCreateInvoice = async (
  prevState: CreateInvoiceState | null,
  formData: FormData
): Promise<CreateInvoiceState> => {
  const amount = Number(formData.get('amount') as string);
  const status = (formData.get('status') as string) as Invoice['status'];
  const clientId = Number(formData.get('clientId') as string);
  const projectId = Number(formData.get('projectId') as string);
  const dueDate = formData.get('dueDate') as string;

  if (!clientId || !projectId || !dueDate) {
    return { error: 'Please fill all required fields' };
  }

  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();
    const teamSlug = await getActiveTeamSlug(cookieHeader);

    const invoice = await createInvoice({
      amount,
      status,
      clientId,
      projectId,
      paidAt: null,
      dueDate: new Date(dueDate),
    }, cookieHeader, teamSlug);
    return { success: true, invoice };
  } catch (err: any) {
    return { error: err.message || 'Create invoice failed' };
  }
};
