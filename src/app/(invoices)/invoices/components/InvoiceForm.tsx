'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2, CheckCircle2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { handleCreateInvoice } from '../new/action';

interface InvoiceFormProps {
  clients: { id: number; name: string }[];
  projects: { id: number; title: string }[];
}

export const InvoiceForm = ({ clients, projects }: InvoiceFormProps) => {
  const [state, formAction, isPending] = useActionState(handleCreateInvoice, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.push('/invoices');
    }
  }, [state?.success, router]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="rounded-full gap-2 font-bold px-4 shadow-sm hover:shadow-md transition-all">
          <Plus className="h-4 w-4" />
          <span>Create Invoice</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-card/80 backdrop-blur-xl border-border/40 shadow-2xl p-0 gap-0 overflow-hidden rounded-xl">
        <DialogHeader className="space-y-3 p-6">
          <DialogTitle className="text-2xl font-semibold">New Invoice</DialogTitle>
          <DialogDescription>Create a new invoice by filling the fields below.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="p-6 space-y-6">
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Client</label>
            <Select name="clientId" required>
              <SelectTrigger className="bg-card/70">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Project</label>
            <Select name="projectId" required>
              <SelectTrigger className="bg-card/70">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Amount</label>
            <Input name="amount" type="number" placeholder="0.00" required className="bg-card/70" />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select name="status" required>
              <SelectTrigger className="bg-card/70">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="partially_paid">Partially Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Due Date</label>
            <Input name="dueDate" type="date" required className="bg-card/70" />
          </div>

          <DialogFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => router.back()} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isPending ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
