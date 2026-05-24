'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteProject } from '@/lib/api/projects';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';

interface Props {
  taskId: number
  taskName: string;
  redirectAfterDelete?: boolean;
  children?: React.ReactNode;
}

export default function DeleteButton({
  taskId,
  taskName,
  redirectAfterDelete = true,
  children,
}: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteProject(taskId);
      toast.success(`${taskName} deleted`, {
        description: 'The project and all associated data have been removed.',
        icon: <Trash2 className="h-4 w-4 text-white" />,
      });
      if (redirectAfterDelete) {
        router.push('/projects');
      } else {
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="destructive" className="gap-2 w-full">
            <Trash2 className="h-4 w-4" />
            Delete Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-xl border-border/40 shadow-2xl p-0 gap-0 overflow-hidden">
        {/* Decorative top bar */}
        <div className="h-1.5 bg-linear-to-r from-red-500 to-rose-500" />

        <div className="p-6 space-y-5">
          <DialogHeader className="space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 ring-4 ring-destructive/20">
              <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>
            <DialogTitle className="text-center text-xl">
              Delete <span className="text-destructive">{taskName}</span>?
            </DialogTitle>
            <DialogDescription className="text-center text-sm leading-relaxed">
              This action <strong className="text-foreground">cannot be undone</strong>. It will
              permanently remove this project and all associated data.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2.5 sm:justify-center">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
              className="min-w-24"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="min-w-32 gap-2 relative"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete Project
                </>
              )}
              {/* Subtle pulse ring when idle */}
              {!loading && (
                <span className="absolute inset-0 rounded-md ring-2 ring-destructive/30 animate-pulse pointer-events-none" />
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}