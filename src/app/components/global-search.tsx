'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Users, FolderKanban, CheckSquare, ArrowUpRight, Loader2 } from 'lucide-react';
import { getAllClients, Client } from '@/lib/api/clients';
import { getAllProjects, Project } from '@/lib/api/projects';
import { getAllTasks, Task } from '@/lib/api/tasks';

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

const fetchData = useCallback(async () => {

    setLoading(true);
    setError(null);

    try {

      const [c, p, t] = await Promise.all([
        getAllClients(),
        getAllProjects(),
        getAllTasks(),

      ]);

      setClients(c);
      setProjects(p);
      setTasks(t.tasks);

    } catch (err: any) {

      setError(err.message || 'Failed to load search data');

    } finally {

      setLoading(false);

    }
  }, []);

  // Fetch when dialog opens
  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, fetchData]);

  // Map projectId → title for tasks
  const projectMap = useMemo(() => {

    const map = new Map<number, string>();
    projects.forEach((p) => map.set(p.id, p.title));
    return map;
    
  }, [projects]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div className="bg-card/80 backdrop-blur-xl border border-border/40 shadow-2xl rounded-xl overflow-hidden">
        <CommandInput placeholder="Search clients, projects, tasks..." />
        <CommandList className="max-h-80 overflow-y-auto p-2">
          {loading && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading…
            </div>
          )}
          {error && (
            <div className="py-8 text-center text-sm text-destructive">
              {error}{' '}
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  // re-fetch
                }}
                className="underline"
              >
                Retry
              </button>
            </div>
          )}
          {!loading && !error && (
            <>
              <CommandEmpty>No results found.</CommandEmpty>

              {/* Clients */}
              {clients.length > 0 && (
                <CommandGroup heading="Clients">
                  {clients.map((client) => (
                    <CommandItem
                      key={`client-${client.id}`}
                      value={`${client.name} ${client.company ?? ''} ${client.email ?? ''}`}
                      onSelect={() => {
                        router.push(`/clients/${client.id}`);
                        onOpenChange(false);
                      }}
                    >
                      <Users className="h-4 w-4 text-muted-foreground mr-2" />
                      <span className="flex-1 truncate">{client.name}</span>
                      {client.company && (
                        <span className="text-xs text-muted-foreground ml-auto mr-1">
                          {client.company}
                        </span>
                      )}
                      <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Projects */}
              {projects.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading="Projects">
                    {projects.map((project) => {
                      const clientName = project.client?.name ?? '';
                      return (
                        <CommandItem
                          key={`project-${project.id}`}
                          value={`${project.title} ${clientName} ${project.status}`}
                          onSelect={() => {
                            router.push(`/projects/${project.id}`);
                            onOpenChange(false);
                          }}
                        >
                          <FolderKanban className="h-4 w-4 text-muted-foreground mr-2" />
                          <span className="flex-1 truncate">{project.title}</span>
                          {clientName && (
                            <span className="text-xs text-muted-foreground ml-auto mr-1">
                              {clientName}
                            </span>
                          )}
                          <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </>
              )}

              {/* Tasks */}
              {tasks.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading="Tasks">
                    {tasks.map((task) => (
                      <CommandItem
                        key={`task-${task.id}`}
                        value={`${task.title} ${task.status} ${task.priority}`}
                        onSelect={() => {
                          router.push(`/tasks/${task.id}`);
                          onOpenChange(false);
                        }}
                      >
                        <CheckSquare className="h-4 w-4 text-muted-foreground mr-2" />
                        <span className="flex-1 truncate">{task.title}</span>
                        <span className="text-xs text-muted-foreground ml-auto mr-1 capitalize">
                          {task.status.replace('_', ' ')} · {task.priority}
                        </span>
                        <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </>
          )}
        </CommandList>
      </div>
    </CommandDialog>
  );
}