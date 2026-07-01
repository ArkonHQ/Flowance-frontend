'use client'

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Project, updateProject } from "@/lib/api/projects";
import { Invoice } from "@/lib/api/invoices";
import { ExternalLink, X, Lightbulb, Rocket, TrendingUp, Target, CheckCircle, PauseCircle, Sparkles, XCircle, Flame, CircleDashed, Calendar, Clock, UserPlus2Icon, Trash2, Archive, Loader2, Edit2, Type, AlignLeft, Wallet, Tag as TagIcon, Activity, User, PlusIcon, MoreHorizontal, Star, ChevronDown, ChevronRight, Zap, Download, FileText } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { ProjectIcon } from "@/components/ui/project-icon";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { PROJECT_PROGRESS_MESSAGES } from "@/lib/constants/project-messages";
import DeleteButton from "./DeleteProject";
import { toast } from "sonner";
import { Task, deleteTask } from "@/lib/api/tasks";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EditTaskForm } from "@/app/(tasks)/components/EditTaskForm";
import { TaskForm } from "@/app/(tasks)/components/TaskForm";
import { createPortal } from "react-dom";
import { MissionProgress } from "@/app/(tasks)/components/MissionProgress";
import { FileUpload } from "@/app/components/FileUpload";
import { useInvoiceFormatter } from "@/hooks/useInvoiceFormatter";






interface SidePanelProps {
    open: boolean;
    onClose: () => void;
    project: Project;
    onDelete?: (id: number) => void
    onEdit?: (project: Project) => void
    clientName?: string
    timeTrackedThisWeek?: number
    totalPaid?: number
    onArchive?: (id: number, isArchived: boolean) => void
    fetchTasks?: (projectId: number) => Promise<Task[]>
    projectInvoices?: Invoice[]
}


const getStatusColor = (status: string) => {
    const getColor: Record<string, string> = {
        active: 'badge-status-active',
        done: 'badge-status-done',
        cancelled: 'badge-status-cancelled',
        on_hold: 'badge-status-on_hold',
        completed: 'badge-status-completed'
    }
    return getColor[status] || getColor.active
}

const displayStatus = (status: string) => {
    const display: Record<string, string> = {
        active: 'Active',
        done: 'Done',
        cancelled: 'Cancelled',
        on_hold: 'On Hold',
        completed: 'Completed'
    }
    return display[status] || display.active
}

const clientStatusColor = (status: string) => {
    const colors: Record<string, string> = {
        active: "text-green-500",
        inactive: "text-gray-500",
        atRisk: "text-rose-500",
        vip: "text-indigo-500",
        internal: "text-blue-500",
    }
    return colors[status] || colors.inactive;
};

const clientBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
        active: "bg-green-500 text-green-100",
        inactive: "bg-gray-500 text-gray-100",
        atRisk: "bg-rose-500 text-rose-100",
        vip: "bg-indigo-500 text-indigo-100",
        internal: "bg-blue-500 text-blue-100",
    }
    return colors[status] || colors.inactive;
}

const clientDisplayStatus = (status: string) => {
    const statusDisplay: Record<string, string> = {
        active: 'Active',
        inactive: 'Inactive',
        atRisk: 'At Risk',
        vip: 'VIP',
        internal: 'Internal',
    }
    return statusDisplay[status] || statusDisplay.inactive;
};

const getProjectStatusMessage = (project: Project) => {
    const status = project.status || 'planning';
    const progress = project.progress || 0;
    const index = (project.id || 0) % 5;

    let message = "";
    let Icon = Lightbulb;
    let colorClass = "text-slate-500 bg-slate-500/10 border-slate-500/20";

    if (status === 'planning') {
        message = PROJECT_PROGRESS_MESSAGES.planning[index];
        Icon = Lightbulb;
        colorClass = "text-slate-500 bg-slate-500/10 border-slate-500/20";
    } else if (status === 'on_hold') {
        message = PROJECT_PROGRESS_MESSAGES.onHold[index];
        Icon = PauseCircle;
        colorClass = "text-amber-500 bg-amber-500/10 border-amber-500/20";
    } else if (status === 'completed') {
        message = PROJECT_PROGRESS_MESSAGES.completed[index];
        Icon = Sparkles;
        colorClass = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    } else if (status === 'cancelled') {
        message = PROJECT_PROGRESS_MESSAGES.cancelled[index];
        Icon = XCircle;
        colorClass = "text-rose-500 bg-rose-500/10 border-rose-500/20";
    } else {
        const activeMessages = PROJECT_PROGRESS_MESSAGES.active;
        if (progress === 0) {
            message = activeMessages["0"][index];
            Icon = Rocket;
            colorClass = "text-blue-500 bg-blue-500/10 border-blue-500/20";
        } else if (progress >= 1 && progress <= 9) {
            message = activeMessages["1-9"][index];
            Icon = Rocket;
            colorClass = "text-blue-500 bg-blue-500/10 border-blue-500/20";
        } else if (progress >= 10 && progress <= 24) {
            message = activeMessages["10-24"][index];
            Icon = TrendingUp;
            colorClass = "text-indigo-500 bg-indigo-500/10 border-indigo-500/20";
        } else if (progress >= 25 && progress <= 39) {
            message = activeMessages["25-39"][index];
            Icon = TrendingUp;
            colorClass = "text-indigo-500 bg-indigo-500/10 border-indigo-500/20";
        } else if (progress >= 40 && progress <= 49) {
            message = activeMessages["40-49"][index];
            Icon = TrendingUp;
            colorClass = "text-indigo-500 bg-indigo-500/10 border-indigo-500/20";
        } else if (progress === 50) {
            message = activeMessages["50"][index];
            Icon = Target;
            colorClass = "text-purple-500 bg-purple-500/10 border-purple-500/20";
        } else if (progress >= 51 && progress <= 64) {
            message = activeMessages["51-64"][index];
            Icon = Target;
            colorClass = "text-purple-500 bg-purple-500/10 border-purple-500/20";
        } else if (progress >= 65 && progress <= 74) {
            message = activeMessages["65-74"][index];
            Icon = Target;
            colorClass = "text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500/20";
        } else if (progress >= 75 && progress <= 89) {
            message = activeMessages["75-89"][index];
            Icon = Flame;
            colorClass = "text-orange-500 bg-orange-500/10 border-orange-500/20";
        } else if (progress >= 90 && progress <= 99) {
            message = activeMessages["90-99"][index];
            Icon = Flame;
            colorClass = "text-orange-500 bg-orange-500/10 border-orange-500/20";
        } else {
            message = activeMessages["100"][index];
            Icon = CheckCircle;
            colorClass = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
        }
    }

    return { message, Icon, colorClass };
}


const getStatusTaskColor = (status: string) => {
    const statusColors: Record<string, string> = {
        todo: "badge-status-todo",
        in_progress: "badge-status-in_progress",
        done: "badge-status-done",
        cancelled: "badge-status-cancelled",
        delayed: "badge-status-delayed",
        overdue: "badge-status-overdue",
    }

    return statusColors[status] || statusColors.delayed
}
const displayTaskStatus = (status: string) => {
    const statusDisplay: Record<string, string> = {
        todo: 'To Do',
        in_progress: 'In Progress',
        done: 'Done',
        cancelled: 'Cancelled',
        overdue: 'Overdue',
        delayed: 'Delayed'
    }
    return statusDisplay[status] || statusDisplay.todo
}

export const SidePanel: React.FC<SidePanelProps> = ({ open, onClose, project, onDelete, onEdit, clientName, timeTrackedThisWeek, totalPaid, onArchive, fetchTasks, projectInvoices }) => {

    const { formatInvoiceId } = useInvoiceFormatter();

    const isLargeScreen = useMediaQuery('(min-width: 1536px)')
    const [isExtended, setIsExtended] = useState<boolean>(false)
    const [archive, setArchive] = useState<boolean>(false)
    const [isArchiving, setIsArchiving] = useState<boolean>(false)
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})


    const [focusedTaskId, setFocusedTaskId] = useState<number | null>(() => {
        if (typeof window === 'undefined') return null
        try {
            const saved = localStorage.getItem('fcc_focused_task_id')
            return saved ? parseInt(saved, 10) : null
        } catch {
            return null
        }
    })

    // Task fetching state
    const [fetchedTasks, setFetchedTasks] = useState<Task[]>([])
    const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(false)


    // Save opening tab in side panel

    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window === 'undefined') return 'overview'
        const saved = localStorage.getItem('fcc_active_tab')
        return saved || 'overview'
    })

    useEffect(() => {
        if (activeTab) {
            localStorage.setItem('fcc_active_tab', activeTab)
        } else {
            localStorage.removeItem('fcc_active_tab')
        }
    }, [activeTab])

    // Save the focused task id
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                if (focusedTaskId) {
                    localStorage.setItem('fcc_focused_task_id', focusedTaskId.toString())
                } else {
                    localStorage.removeItem('fcc_focused_task_id')
                }
            } catch {
                // ignore
            }
        }
    }, [focusedTaskId])


    // Handle Archive
    const handleArchive = async () => {
        if (!project) return
        const newState = !project.isArchived
        setIsArchiving(true)
        try {
            await updateProject(project.id, { isArchived: newState })
            onArchive?.(project.id, newState)
            toast.success(newState ? `"${project.title}" archived` : `"${project.title}" unarchived`)
            onClose()
        } catch (err) {
            console.error('Error archiving project:', err)
            toast.error('Failed to archive project')
        } finally {
            setIsArchiving(false)
        }
    }

    const [isDeletingFile, setIsDeletingFile] = useState(false);

    const isImage = (path?: string | null) => {
        if (!path) return false;
        const lower = path.toLowerCase();
        return lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.gif') || lower.endsWith('.webp') || lower.endsWith('.pdf');
    }

    const handleDeleteAttachment = async () => {
        if (!project) return;
        setIsDeletingFile(true);
        try {
            const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5501/api';
            const res = await fetch(`${API_BASE}/projects/attachments/${project.id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to delete');
            toast.success('Attachment deleted successfully! Please refresh to see changes.');
            // Optimistically clear it in the UI (if you're mutating local state or have a refresh function, call it here) =====
            project.attachmentUrl = null;
            project.attachmentPath = null;
            project.attachmentUploadedAt = '';
            project.attachmentUploadedBy = null;
            project.attachmentDeletedAt = new Date().toISOString();
        } catch (error) {
            toast.error('Failed to delete attachment');
        } finally {
            setIsDeletingFile(false);
        }
    }

    useEffect(() => {
        if (open && isLargeScreen) {
            document.body.classList.add('panel-open')
        } else {
            document.body.classList.remove('panel-open')
        }

        return () => {
            document.body.classList.remove('panel-open')
        }
    }, [open, isLargeScreen])


    // Fetch tasks when switching to the 'tasks' or 'activity' tab
    useEffect(() => {
        if ((activeTab === 'tasks' || activeTab === 'activity') && fetchTasks && project?.id) {
            // Only fetch if project.tasks isn't already populated by the parent
            if (!project.tasks || project.tasks.length === 0) {
                setIsLoadingTasks(true)
                fetchTasks(project.id)
                    .then(data => setFetchedTasks(data))
                    .catch(err => console.error("Failed to load tasks", err))
                    .finally(() => setIsLoadingTasks(false))
            }
        }
    }, [activeTab, fetchTasks, project?.id, project?.tasks])

    // Using the progress and taskCount to accurately calculate the numbers
    const totalTasks = project?.taskCount || 0;
    const completedTasks = project?.tasks
        ? project.tasks.filter(t => t.status === 'done').length
        : Math.round(((project?.progress || 0) / 100) * totalTasks);

    const remainingTasks = totalTasks - completedTasks;


    const formatDate = (date?: Date | string) => {
        if (!date) return 'N/A'
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    // Format duration 
    const formatDuration = (minutes?: number) => {
        if (!minutes || minutes <= 0) return '0h'

        const hours = Math.floor(minutes / 60)
        const remainingMinutes = Math.round(minutes % 60)

        const parts: string[] = []

        if (hours > 0) parts.push(`${hours}h `)
        if (remainingMinutes > 0) parts.push(`${remainingMinutes}m`)

        return parts.length > 0 ? parts.join('') : '0h'
    }


    // Remaining days 
    const remainingDays = (deadline?: string | Date) => {
        if (!deadline) return 'No deadline'
        const deadlineDate = new Date(deadline);
        const today = new Date();
        const diffTime = deadlineDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? `${diffDays} days left` : 'Overdue';
    }

    const remainingDaysColor = (days: string) => {
        if (days.includes('Overdue')) {
            return 'text-red-500'
        }
        if (days.includes('Due today')) {
            return 'text-amber-500'
        }
        return 'text-green-500'
    }

    // Use invoices to calculate the true budget and paid amounts if they exist
    const projectBudget = (projectInvoices && projectInvoices.length > 0)
        ? projectInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0)
        : (project?.budget || 0);
        
    const calculatedTotalPaid = (projectInvoices && projectInvoices.length > 0)
        ? projectInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + Number(inv.amount), 0)
        : (totalPaid || 0);

    const remainingBudget = Number(projectBudget) - calculatedTotalPaid;

    const paymentPercentage = projectBudget > 0
        ? Math.min(Math.round((calculatedTotalPaid / Number(projectBudget)) * 100), 100)
        : 0;

    const paymentColor = paymentPercentage >= 100
        ? '#22c55e'
        : paymentPercentage >= 50
            ? '#eab308'
            : '#ef4444'

    const remainingBudgetLabel = remainingBudget >= 0
        ? `$${remainingBudget.toLocaleString()}`
        : `-$${Math.abs(remainingBudget).toLocaleString()}`;

    return (
        <>
            <Sheet open={open} onOpenChange={onClose} modal={!isLargeScreen}>
                <SheetContent
                    className={cn('w-full !max-w-none !w-[100vw] sm:!w-fit sm:min-w-[450px] sm:!max-w-[600px] overflow-y-auto rounded-lg border-2 border-card shadow-lg p-0')}
                    side="right"
                    style={{ bottom: 0, height: 'calc(100vh)', position: 'fixed' }}
                    onPointerDownOutside={(e) => {
                        if (isLargeScreen) {
                            e.preventDefault()
                        }
                    }}
                    onInteractOutside={(e) => {
                        if (isLargeScreen) {
                            e.preventDefault()
                        }
                    }}
                >
                    <SheetHeader className="px-6 pt-6">
                        {project && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ProjectIcon project={project} className="w-15 h-15" iconClassName="h-10 w-10" />
                                    <div className="flex flex-col items-start gap-0.5">
                                        <span className="text-lg font-semibold tracking-wide">{project.title}</span>
                                        <span className="text-xs text-muted-foreground truncate">{project.description}</span>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className={cn(getStatusColor(project.status), 'rounded-full border px-2 py-0.5 text-sm font-bold tracking-wider')}>
                                        {displayStatus(project.status)}
                                    </div>
                                </div>
                                {/* Client Info */}
                            </div>
                        )}
                        {project && (
                            <div className="bg-card/20 border rounded-md border-border/40 mt-6 flex items-center justify-start p-4 gap-2">
                                <div
                                    style={{
                                        backgroundColor: `${project?.tags?.[0]?.color || '#6b7280'}33`,
                                        color: project?.tags?.[0]?.color || '#9ca3af'
                                    }}
                                    className="text-lg font-semibold rounded-full p-1 w-10 h-10 flex items-center justify-center"
                                >
                                    {(() => {
                                        const client = project?.client?.name ?? clientName ?? 'N/A'
                                        if (client === 'N/A') return 'N/A';
                                        const words = client.trim().split(/\s+/);
                                        return words.length >= 2
                                            ? (words[0][0] + words[1][0]).toUpperCase()
                                            : client.substring(0, 2).toUpperCase();
                                    })()}
                                </div>
                                <div className="flex items-center justify-between flex-1">
                                    <div className="flex flex-col items-start gap-0.5">
                                        <span className="text-md tracking-wide font-semibold ">
                                            {project.client?.name ?? clientName ?? 'N/A'}
                                        </span>
                                        <div className="flex justify-center items-center">
                                            <div className={cn(`rounded-full h-2 w-2 mr-1 ${clientBadgeColor(project?.client?.status)}`)}>
                                            </div>
                                            <span className={cn(`text-sm ${clientStatusColor(project?.client?.status || 'inactive')}`)}>
                                                {clientDisplayStatus(project?.client?.status || 'inactive')}
                                            </span>
                                        </div>
                                    </div>
                                    <Link href={`clients/${project.clientId}`}>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-border/40 hover:border-border/50 hover:text-foreground p-4"
                                            onClick={(e: React.MouseEvent) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                        >
                                            <ExternalLink className="h-4 w-4" /> View Client
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </SheetHeader>
                    <div className="w-full border-b border-border px-4 mt-6">
                        <div className="flex flex-wrap gap-4 sm:gap-6 text-sm font-medium text-muted-foreground">
                            {['overview', 'details', 'tasks', 'invoices', 'members', 'files', 'activity'].map(tab => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setActiveTab(tab)}
                                    className={cn(
                                        "pb-2 capitalize transition-colors outline-none",
                                        activeTab === tab ? "border-b-2 border-primary text-primary font-semibold" : "hover:text-foreground border-b-2 border-transparent"
                                    )}
                                >
                                    {tab === 'tasks' ? `Tasks (${project?.taskCount || 0})` : tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Overview Tab */}
                    <div className="p-6">
                        {activeTab === 'overview' && (
                            <>
                                <div className="flex flex-col border border-border/40 rounded-lg overflow-hidden animate-in fade-in-50 antialiased font-sans">
                                    <div className="grid grid-cols-3 border-b border-border/40">
                                        <div className="col-span-2 p-5 text-sm flex flex-col justify-center">
                                            <span className="text-muted-foreground block mb-2 text-xs font-medium tracking-wider">Progress</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="font-bold tracking-wider text-3xl">
                                                    {project?.progress ? `${project.progress}%` : '0%'}
                                                </span>
                                            </div>
                                            <Progress value={project?.progress} className="h-2.5 bg-border/50 my-4" indicatorColor={project?.tags?.[0]?.color} />

                                            {project && (
                                                <div className={cn("mt-2 flex items-start gap-3 p-3 rounded-md border", getProjectStatusMessage(project).colorClass)}>
                                                    <div className="mt-0.5">
                                                        {(() => {
                                                            const { Icon } = getProjectStatusMessage(project);
                                                            return <Icon className="w-4 h-4" />
                                                        })()}
                                                    </div>
                                                    <span className="text-sm font-medium leading-tight">
                                                        {getProjectStatusMessage(project).message}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-span-1 border-l border-border/40 p-5 bg-muted/5 flex flex-col justify-center gap-4">
                                            <div className="flex flex-col pb-4 border-b border-border/40">
                                                <span className="text-xs text-muted-foreground font-medium">Total Tasks</span>
                                                <span className="text-2xl font-bold mt-1">{project?.taskCount}</span>
                                            </div>
                                            <div className="flex justify-between items-center pb-4 border-b border-border/40">
                                                <span className="text-xs text-muted-foreground font-medium">Completed</span>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-sm font-bold">{completedTasks}</span>
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center pb-1">
                                                <span className="text-xs text-muted-foreground font-medium">Remaining</span>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-sm font-bold">{remainingTasks}</span>
                                                    <CircleDashed className="h-4 w-4 text-amber-500" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 border-b border-border/40">
                                        <div className="flex flex-col p-5">
                                            <span className="text-xs text-muted-foreground font-medium tracking-wider">Due Date</span>
                                            <span className="text-sm font-bold mt-2">{formatDate(project?.deadline)}</span>
                                            <span className={cn("text-xs font-semibold mt-1", remainingDaysColor(remainingDays(project?.deadline)))}>
                                                {remainingDays(project?.deadline)}
                                            </span>
                                        </div>
                                        <div className="flex flex-col border-l border-border/40 p-5">
                                            <span className="text-xs text-muted-foreground font-medium tracking-wider">Time Tracked</span>
                                            <span className="text-sm font-bold mt-2">{formatDuration(project?.totalTimeTracked)}</span>
                                            {timeTrackedThisWeek !== undefined && project?.totalTimeTracked ? (
                                                <span className="text-[10px] uppercase font-bold mt-2 text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded w-fit">
                                                    +{Math.round((timeTrackedThisWeek / project.totalTimeTracked) * 100)}% this week
                                                </span>
                                            ) : (
                                                <span className="text-[10px] uppercase font-bold mt-2 text-muted-foreground bg-muted-foreground/10 px-2 py-1 rounded w-fit">No time yet</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col border-l border-border/40 p-5 bg-muted/5">
                                            <span className="text-xs text-muted-foreground font-medium tracking-wider">Budget</span>
                                            <span className="text-sm font-bold mt-2">${Number(projectBudget).toLocaleString()}</span>
                                            <Progress value={paymentPercentage} className="mt-2.5 h-1.5" indicatorColor={paymentColor} />
                                            <span className={cn(
                                                "text-[10px] uppercase font-bold mt-2 px-2 py-1 rounded w-fit",
                                                paymentPercentage >= 100
                                                    ? 'text-green-600 bg-green-500/10'
                                                    : paymentPercentage >= 50
                                                        ? 'text-yellow-600 bg-yellow-500/10'
                                                        : 'text-red-600 bg-red-500/10'
                                            )}>
                                                {paymentPercentage}% paid (${calculatedTotalPaid.toLocaleString()})
                                            </span>
                                            <span className="text-[10px] uppercase font-bold mt-2 px-2 py-1 rounded w-fit text-slate-700 bg-slate-200/70 dark:text-slate-200 dark:bg-slate-800">
                                                Remaining: {remainingBudgetLabel}
                                            </span>
                                        </div>

                                        <div className="flex flex-col border-t border-border/40 p-5">
                                            <span className="text-xs tracking-wide text-muted-foreground font-medium ">Created</span>
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-sm font-bold">{formatDate(project?.createdAt)}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col col-span-2 border-t border-l border-border/40 p-5 bg-muted/5">
                                            <span className="text-xs tracking-wide text-muted-foreground font-medium">Last Updated</span>
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="p-1.5 rounded-md bg-orange-500/10 text-orange-500">
                                                    <Clock className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-sm font-bold">{formatDate(project?.updatedAt)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col border-b border-border/40">
                                        <div className="px-5 py-3 border-b border-border/40 bg-muted/5">
                                            <span className="text-sm tracking-wider font-semibold text-foreground">Description</span>
                                        </div>
                                        <div className="p-5">
                                            <p className={cn('text-sm text-foreground/85 leading-relaxed antialiased', isExtended ? '' : 'line-clamp-4')}>{project?.description || 'No description provided.'}</p>
                                            {project?.description && project.description.length > 150 && (
                                                <button
                                                    onClick={() => setIsExtended(!isExtended)}
                                                    className="text-primary hover:text-primary/80 font-semibold text-xs mt-3 transition-colors"
                                                >
                                                    {isExtended ? 'Show less' : 'Read more'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-row items-center justify-between p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs tracking-wider font-semibold text-foreground">Members</span>
                                                <span className="text-sm font-medium text-foreground/80">-</span>
                                            </div>
                                        </div>
                                        <Button
                                            variant={'outline'}
                                            size="sm"
                                            className="flex p-4 items-center gap-2 font-medium"
                                        >
                                            <UserPlus2Icon className="h-4 w-4" /> Manage Members
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Details tab */}
                        {activeTab === 'details' && (
                            <div className="space-y-6 animate-in fade-in-50">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex flex-col">
                                        <h3 className="text-lg font-bold tracking-tight text-foreground">Project Details</h3>
                                        <p className="text-xs text-muted-foreground">Comprehensive view of all project parameters</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-2 font-medium border-primary/20 hover:border-primary hover:bg-primary/10 transition-all duration-300"
                                        onClick={() => onEdit?.(project)}
                                    >
                                        <Edit2 className="h-4 w-4 text-primary" />
                                        <span className="text-primary">Edit Project</span>
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* General Info Card */}
                                    <div className="col-span-1 md:col-span-2 space-y-4 p-5 bg-linear-to-br from-card to-card/50  rounded-xl border border-border/50">
                                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">General Information</h4>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="group flex flex-col gap-1 p-3 rounded-lg hover:bg-muted/20 transition-colors">
                                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                                    <Type className="w-4 h-4" />
                                                    <span className="text-xs font-semibold">Title</span>
                                                </div>
                                                <span className="text-sm font-medium text-foreground">{project?.title || 'N/A'}</span>
                                            </div>
                                            <div className="group flex flex-col gap-1 p-3 rounded-lg hover:bg-muted/20 transition-colors">
                                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                                    <AlignLeft className="w-4 h-4" />
                                                    <span className="text-xs font-semibold">Description</span>
                                                </div>
                                                <span className="text-sm font-medium text-foreground leading-relaxed">{project?.description || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Meta Card */}
                                    <div className="space-y-4 bg-linear-to-br from-card to-card/50 p-5 rounded-xl border border-border/50 shadow-sm">
                                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Classification</h4>

                                        <div className="group flex flex-col gap-1 p-3 rounded-lg hover:bg-muted/20 transition-colors">
                                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                                <User className="w-4 h-4" />
                                                <span className="text-xs font-semibold">Client</span>
                                            </div>
                                            <span className="text-sm font-medium text-foreground">{project?.client?.name ?? clientName ?? 'N/A'}</span>
                                        </div>

                                        <div className="group flex flex-col gap-1 p-3 rounded-lg hover:bg-muted/20 transition-colors">
                                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                                <Activity className="w-4 h-4" />
                                                <span className="text-xs font-semibold">Status</span>
                                            </div>
                                            <div className="flex items-center">
                                                <div className={cn(getStatusColor(project?.status || 'active'), 'rounded-full border px-2 py-0.5 text-xs font-bold tracking-wider')}>
                                                    {displayStatus(project?.status || 'active')}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="group flex flex-col gap-1 p-3 rounded-lg hover:bg-muted/20 transition-colors">
                                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                                <TagIcon className="w-4 h-4" />
                                                <span className="text-xs font-semibold">Tags</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {project?.tags?.length ? project.tags.map(t => (
                                                    <span key={t.id} className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: `${t.color}20`, color: t.color }}>
                                                        {t.name}
                                                    </span>
                                                )) : <span className="text-sm text-muted-foreground">None</span>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Financials & Time Card */}
                                    <div className="space-y-4 bg-linear-to-br from-card to-card/50 p-5 rounded-xl border border-border/50 shadow-sm">
                                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Timeline & Budget</h4>

                                        <div className="group flex flex-col gap-1 p-3 rounded-lg hover:bg-muted/20 transition-colors">
                                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                                <Wallet className="w-4 h-4" />
                                                <span className="text-xs font-semibold">Budget</span>
                                            </div>
                                            <span className="text-sm font-medium text-foreground">{projectBudget ? `$${projectBudget.toLocaleString()}` : 'N/A'}</span>
                                        </div>

                                        <div className="group flex flex-col gap-1 p-3 rounded-lg hover:bg-muted/20 transition-colors">
                                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                                <Calendar className="w-4 h-4" />
                                                <span className="text-xs font-semibold">Deadline</span>
                                            </div>
                                            <span className="text-sm font-medium text-foreground">{project?.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A'}</span>
                                        </div>

                                        <div className="group flex flex-col gap-1 p-3 rounded-lg hover:bg-muted/20 transition-colors">
                                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                                <Clock className="w-4 h-4" />
                                                <span className="text-xs font-semibold">Time Tracked</span>
                                            </div>
                                            <span className="text-sm font-medium text-foreground">{project?.totalTimeTracked ? `${(project.totalTimeTracked / 60).toFixed(1)} hrs` : '0 hrs'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}



                        {/* Task tab ----------------------------------------------------------------------------*/}
                        {activeTab === 'tasks' && (
                            <div className="space-y-4 animate-in fade-in-50">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Tasks</h3>
                                    <Button size="sm" onClick={() => setIsAddTaskOpen(true)}>
                                        <PlusIcon className="h-4 w-4" />
                                        Add Task
                                    </Button>
                                </div>

                                {isLoadingTasks ? (
                                    <div className="flex justify-center items-center p-8 bg-muted/30 rounded-lg border border-dashed border-border/50">
                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                    </div>
                                ) : (
                                    (() => {
                                        const displayTasks = project?.tasks?.length ? project.tasks : fetchedTasks;
                                        if (displayTasks.length === 0) {
                                            return (
                                                <div className="text-sm text-muted-foreground italic bg-muted/30 p-8 rounded-lg text-center border border-dashed border-border/50">
                                                    No tasks populated yet.
                                                </div>
                                            )
                                        }

                                        const focusedTask = focusedTaskId ? displayTasks.find(t => t.id === focusedTaskId) : null;
                                        const todoTasks = displayTasks.filter(t => t.status === 'todo');
                                        const inProgressTasks = displayTasks.filter(t => t.status === 'in_progress');
                                        const doneTasks = displayTasks.filter(t => t.status === 'done');
                                        const otherTasks = displayTasks.filter(t => !['todo', 'in_progress', 'done'].includes(t.status));

                                        const toggleGroup = (key: string) => {
                                            setCollapsedGroups(prev => ({ ...prev, [key]: !prev[key] }))
                                        }

                                        const missionPct = (task: Task) => {
                                            const total = task.missions?.length || 0;
                                            if (total === 0) return 0;
                                            const completed = task.missions.filter(m => m.completed).length;
                                            return Math.round((completed / total) * 100);
                                        }

                                        const renderTaskCard = (task: Task) => {
                                            const missions = task.missions || [];
                                            const missionTotal = missions.length;
                                            const completedMissions = missions.filter(m => m.completed).length;
                                            const pct = missionTotal > 0 ? Math.round((completedMissions / missionTotal) * 100) : 0;
                                            const isFocused = focusedTaskId === task.id;

                                            return (
                                                <div
                                                    key={task.id}
                                                    className={cn(
                                                        "group relative flex flex-col gap-2.5 p-3.5 rounded-xl border transition-all duration-200",
                                                        isFocused
                                                            ? "bg-primary/5 border-primary/30 shadow-sm"
                                                            : "bg-card/40 border-border/40 hover:border-border/70 hover:shadow-xs"
                                                    )}
                                                >
                                                    {/* Top row: title + actions */}
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0 flex flex-col gap-1">
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setFocusedTaskId(prev => prev === task.id ? null : task.id);
                                                                    }}
                                                                    className="shrink-0 p-0.5 hover:scale-110 transition-transform"
                                                                    title={isFocused ? 'Unfocus' : 'Set as focus'}
                                                                >
                                                                    <Star className={cn(
                                                                        "h-3.5 w-3.5 transition-colors",
                                                                        isFocused
                                                                            ? "fill-amber-400 text-amber-400"
                                                                            : "text-muted-foreground/40 group-hover:text-muted-foreground/70"
                                                                    )} />
                                                                </button>
                                                                <Link
                                                                    href={`/tasks`}
                                                                    onClick={() => {
                                                                        localStorage.setItem('fcc_selected_task', JSON.stringify({
                                                                            id: task.id,
                                                                            title: task.title,
                                                                            projectTitle: project?.title || null,
                                                                            project: project
                                                                        }))
                                                                        localStorage.setItem('fcc_side_panel_open', JSON.stringify(true))
                                                                    }}
                                                                    className="text-sm font-semibold text-foreground hover:text-primary transition-colors truncate"
                                                                >
                                                                    {task.title}
                                                                </Link>
                                                            </div>
                                                            {task.summary && (
                                                                <p className="text-xs text-muted-foreground/70 line-clamp-1 pl-6">{task.summary}</p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {formatDuration(task.totalHours ? task.totalHours * 60 : 0)}
                                                            </span>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-7 w-7 text-muted-foreground/50 hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    >
                                                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem
                                                                        className="cursor-pointer flex items-center"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setTaskToEdit(task);
                                                                            setIsEditModalOpen(true);
                                                                        }}
                                                                    >
                                                                        <Edit2 className="mr-2 h-4 w-4" />
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        className="text-destructive focus:text-destructive cursor-pointer"
                                                                        onClick={async (e) => {
                                                                            e.stopPropagation();
                                                                            try {
                                                                                await deleteTask(task.id);
                                                                                toast.success("Task deleted");
                                                                                if (focusedTaskId === task.id) setFocusedTaskId(null);
                                                                                if (fetchTasks && project?.id) {
                                                                                    fetchTasks(project.id).then(setFetchedTasks);
                                                                                }
                                                                            } catch (err) {
                                                                                toast.error("Failed to delete task");
                                                                            }
                                                                        }}
                                                                    >
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>

                                                    {/* Mission progress bar — only if there's a mission */}
                                                    {missionTotal > 0 && (
                                                        <div className="pl-6 space-y-1.5">
                                                            <div className="flex items-center justify-between text-[10px]">
                                                                <span className="font-medium text-muted-foreground/70">
                                                                    {completedMissions}/{missionTotal} missions
                                                                </span>
                                                                <span className={cn(
                                                                    "font-bold",
                                                                    pct === 100 ? "text-emerald-500" : pct >= 50 ? "text-primary/80" : "text-muted-foreground/60"
                                                                )}>
                                                                    {pct}%
                                                                </span>
                                                            </div>
                                                            <Progress
                                                                value={pct}
                                                                className="h-1.5 bg-border/40"
                                                                indicatorColor={
                                                                    project?.tags?.[0]?.color
                                                                }
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        }

                                        const renderGroup = (label: string, icon: React.ReactNode, tasks: Task[], groupKey: string, accentColor: string) => {
                                            if (tasks.length === 0) return null;
                                            const isCollapsed = collapsedGroups[groupKey] || false;
                                            return (
                                                <div key={groupKey}>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleGroup(groupKey)}
                                                        className="flex items-center gap-2 w-full text-left py-2 px-1 group/header hover:bg-muted/30 rounded-lg transition-colors"
                                                    >
                                                        {isCollapsed
                                                            ? <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                                                            : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/50" />
                                                        }
                                                        {icon}
                                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
                                                            {label}
                                                        </span>
                                                        <span className={cn(
                                                            "ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                                                            accentColor
                                                        )}>
                                                            {tasks.length}
                                                        </span>
                                                    </button>
                                                    {!isCollapsed && (
                                                        <div className="space-y-2 mt-1 ml-1">
                                                            {tasks.map(renderTaskCard)}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        }

                                        return (
                                            <div className="space-y-4">
                                                {/* Focused Task Card */}
                                                {focusedTask && (
                                                    <div className={cn(
                                                        "rounded-xl border bg-card/50 backdrop-blur-sm transition-all",
                                                        "border-border/50 shadow-sm overflow-hidden"
                                                    )}>
                                                        {/* Top accent line */}
                                                        <div className="h-[2px] w-full bg-linear-to-r from-transparent via-primary/30 to-transparent" />
                                                        <div className="px-4 py-3.5 flex flex-col gap-3">
                                                            {/* Label */}
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Zap className="h-3.5 w-3.5 fill-amber-400 text-amber-300" />
                                                                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                                                                        Current Focus
                                                                    </span>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => setFocusedTaskId(null)}
                                                                    className="h-6 w-6 rounded-full text-muted-foreground hover:text-foreground"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </Button>
                                                            </div>

                                                            {/* Body */}
                                                            <div className="flex items-center gap-4">
                                                                {/* Task info */}
                                                                <div className="flex-1 min-w-0 space-y-1.5">
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <Link
                                                                            href={`/tasks`}
                                                                            onClick={() => {
                                                                                localStorage.setItem('fcc_selected_task', JSON.stringify({
                                                                                    id: focusedTask.id,
                                                                                    title: focusedTask.title,
                                                                                    projectTitle: project?.title || null,
                                                                                    project: project
                                                                                }))
                                                                                localStorage.setItem('fcc_side_panel_open', JSON.stringify(true))
                                                                            }}
                                                                        >
                                                                            <h4 className="text-sm font-bold leading-tight hover:text-primary transition-colors">
                                                                                {focusedTask.title}
                                                                            </h4>
                                                                        </Link>
                                                                        <div className={cn(
                                                                            "inline-flex items-center border px-2 py-0.5 text-[10px] font-semibold rounded-full shrink-0",
                                                                            getStatusTaskColor(focusedTask.status)
                                                                        )}>
                                                                            <span className="w-1 h-1 rounded-full bg-current opacity-75 mr-1" />
                                                                            {displayTaskStatus(focusedTask.status)}
                                                                        </div>
                                                                    </div>
                                                                    {focusedTask.summary && (
                                                                        <p className="text-xs text-muted-foreground/70 line-clamp-1">{focusedTask.summary}</p>
                                                                    )}
                                                                </div>

                                                                {/* Circular mission progress */}
                                                                {(focusedTask.missions?.length || 0) > 0 && (
                                                                    <div className="flex items-center gap-2 shrink-0">
                                                                        <MissionProgress
                                                                            size={42}
                                                                            completed={focusedTask.missions.filter(m => m.completed).length}
                                                                            total={focusedTask.missions.length}
                                                                            animate={false}
                                                                        />
                                                                        <div>
                                                                            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                                                                                Missions
                                                                            </p>
                                                                            <p className="text-xs font-bold">
                                                                                {focusedTask.missions.filter(m => m.completed).length}
                                                                                <span className="text-muted-foreground font-normal">/{focusedTask.missions.length}</span>
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Status Groups */}
                                                <div className="space-y-3">
                                                    {renderGroup(
                                                        'In Progress',
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />,
                                                        inProgressTasks,
                                                        'in_progress',
                                                        'bg-blue-500/15 text-blue-500'
                                                    )}
                                                    {renderGroup(
                                                        'To Do',
                                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />,
                                                        todoTasks,
                                                        'todo',
                                                        'bg-slate-500/15 text-slate-500'
                                                    )}
                                                    {renderGroup(
                                                        'Completed',
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />,
                                                        doneTasks,
                                                        'done',
                                                        'bg-emerald-500/15 text-emerald-500'
                                                    )}
                                                    {renderGroup(
                                                        'Other',
                                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />,
                                                        otherTasks,
                                                        'other',
                                                        'bg-amber-500/15 text-amber-500'
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })()
                                )}
                            </div>
                        )}
                        {/* Invoices tab ----------------------------------------------------------------------------*/}
                        {activeTab === 'invoices' && (
                            <div className="space-y-4 animate-in fade-in-50">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Invoices</h3>
                                </div>
                                {(!projectInvoices || projectInvoices.length === 0) ? (
                                    <div className="text-sm text-muted-foreground italic bg-muted/30 p-8 rounded-lg text-center border border-dashed border-border/50">
                                        No invoices created for this project yet.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {projectInvoices.map(invoice => (
                                            <div key={invoice.id} className="group flex flex-col gap-2 p-4 rounded-xl border bg-card/40 hover:bg-card hover:shadow-xs transition-all">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-sm">{formatInvoiceId(invoice)}</span>
                                                    <span className={cn(
                                                        "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full",
                                                        invoice.status === 'paid' ? 'bg-green-500/15 text-green-600' :
                                                        invoice.status === 'overdue' ? 'bg-red-500/15 text-red-600' :
                                                        invoice.status === 'sent' ? 'bg-blue-500/15 text-blue-600' :
                                                        invoice.status === 'partially_paid' ? 'bg-amber-500/15 text-amber-600' :
                                                        'bg-slate-500/15 text-slate-600'
                                                    )}>
                                                        {invoice.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-lg font-bold">${Number(invoice.amount).toLocaleString()}</span>
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        Due: {new Date(invoice.dueDate).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                {invoice.paidAt && (
                                                    <div className="text-[10px] text-muted-foreground mt-1">
                                                        Paid on: {new Date(invoice.paidAt).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'members' && (
                            <div className="space-y-4 animate-in fade-in-50">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Members</h3>
                                    <Button size="sm" variant="outline">Invite</Button>
                                </div>
                                <div className="text-sm text-muted-foreground italic bg-muted/30 p-8 rounded-lg text-center border border-dashed border-border/50">
                                    No members assigned.
                                </div>
                            </div>
                        )}
                        {activeTab === 'files' && (
                            <div className="space-y-6 animate-in fade-in-50">
                                <FileUpload projectId={project?.id} />

                                {project?.attachmentUrl && (
                                    <div className="mt-6 flex flex-col gap-2">
                                        <h4 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Attached File</h4>
                                        {isImage(project.attachmentPath) ? (
                                            <div className="border border-border/50 rounded-xl overflow-hidden shadow-sm relative group bg-muted/20 w-full h-64">
                                                <img src={project.attachmentUrl} alt="Project Attachment" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
                                                    <Button variant="secondary" size="sm" className="font-semibold" asChild>
                                                        <a href={project.attachmentUrl} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink className="h-4 w-4 mr-2" /> Open Full Size
                                                        </a>
                                                    </Button>

                                                    <Button variant="destructive" size="sm" onClick={handleDeleteAttachment} disabled={isDeletingFile}>
                                                        {isDeletingFile ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-center gap-4 overflow-hidden">
                                                    <div className="p-3 bg-primary/10 rounded-lg text-primary shrink-0">
                                                        <FileText className="h-6 w-6" />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-sm font-semibold text-foreground truncate">
                                                            {project.attachmentPath?.split('/').pop()?.split('-').slice(1).join('-') || 'Project Document'}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground truncate">Securely stored in Supabase</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0 ml-4">
                                                    <Button variant="outline" size="sm" className="h-9 font-medium" asChild>
                                                        <a href={project.attachmentUrl} target="_blank" rel="noopener noreferrer">
                                                            <Download className="h-4 w-4 mr-2" />
                                                            Download
                                                        </a>
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        className="h-9 w-9"
                                                        onClick={handleDeleteAttachment}
                                                        disabled={isDeletingFile}
                                                    >
                                                        {isDeletingFile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'activity' && (() => {
                            // ── BUILD EVENTS FROM AVAILABLE DATA ─────────────────────────────────
                            // We read fields that ALREADY EXIST on the project object + its tasks.
                            // No extra API call. We gather every meaningful timestamp and shape it
                            // into a flat events array, sort newest-first, then render as one
                            // continuous timeline with a linear vertical connector line.
                            type AE = {
                                id: string
                                date: Date
                                label: string
                                sublabel?: string
                                actor?: string | null
                                icon: React.ReactNode
                                dot: string   // tailwind bg + text classes for the icon bubble
                                line: string  // tailwind linear class for the connector line
                            }
                            const events: AE[] = []

                            // 1. Project created — always present (project.createdAt)
                            events.push({
                                id: 'project_created',
                                date: new Date(project.createdAt),
                                label: 'Project created',
                                sublabel: project.title,
                                icon: <Rocket className="h-3.5 w-3.5" />,
                                dot: 'bg-blue-500/15 text-blue-500',
                                line: 'from-blue-500/40',
                            })

                            // 2. Project details updated (project.updatedAt)
                            const pUpdated = new Date(project.updatedAt)
                            const pCreated = new Date(project.createdAt)
                            if (pUpdated.getTime() - pCreated.getTime() > 60_000) {
                                events.push({
                                    id: 'project_updated',
                                    date: pUpdated,
                                    label: 'Project details updated',
                                    sublabel: project.title,
                                    icon: <Edit2 className="h-3.5 w-3.5" />,
                                    dot: 'bg-purple-500/15 text-purple-500',
                                    line: 'from-purple-500/40',
                                })
                            }

                            // 3. File uploaded (project.attachmentUploadedAt + attachmentUploadedBy)
                            if (project.attachmentUploadedAt) {
                                events.push({
                                    id: 'file_uploaded',
                                    date: new Date(project.attachmentUploadedAt),
                                    label: 'File attached to project',
                                    sublabel: project.attachmentPath
                                        ? project.attachmentPath.split('/').pop()?.split('-').slice(1).join('-') || 'Attachment'
                                        : 'Attachment',
                                    actor: project.attachmentUploadedBy,
                                    icon: <FileText className="h-3.5 w-3.5" />,
                                    dot: 'bg-primary/15 text-primary',
                                    line: 'from-primary/40',
                                })
                            }

                            // 4. Task events - derived from project.tasks (or fetchedTasks)
                            const allTasks = project.tasks?.length ? project.tasks : fetchedTasks
                            allTasks.forEach(task => {
                                // Task added: task.createdAt
                                if (task.createdAt) {
                                    events.push({
                                        id: `task_added_${task.id}`,
                                        date: new Date(task.createdAt),
                                        label: 'Task added',
                                        sublabel: `"${task.title}"`,
                                        icon: <PlusIcon className="h-3.5 w-3.5" />,
                                        dot: 'bg-green-500/15 text-green-500',
                                        line: 'from-green-500/40',
                                    })
                                }
                                // Task completed: task.completedAt (only when status === 'done')
                                if (task.status === 'done' && task.completedAt) {
                                    events.push({
                                        id: `task_done_${task.id}`,
                                        date: new Date(task.completedAt as string),
                                        label: 'Task completed',
                                        sublabel: `"${task.title}"`,
                                        icon: <CheckCircle className="h-3.5 w-3.5" />,
                                        dot: 'bg-emerald-500/15 text-emerald-500',
                                        line: 'from-emerald-500/40',
                                    })
                                }
                                // Task updated: task.updatedAt (only if > 1 min after creation)
                                if (task.updatedAt && task.createdAt) {
                                    const tU = new Date(task.updatedAt)
                                    const tC = new Date(task.createdAt)
                                    if (tU.getTime() - tC.getTime() > 60_000) {
                                        events.push({
                                            id: `task_updated_${task.id}`,
                                            date: tU,
                                            label: 'Task updated',
                                            sublabel: `"${task.title}"`,
                                            icon: <Edit2 className="h-3.5 w-3.5" />,
                                            dot: 'bg-orange-500/15 text-orange-500',
                                            line: 'from-orange-500/40',
                                        })
                                    }
                                }
                                // Task cancelled: status === 'cancelled'
                                if (task.status === 'cancelled') {
                                    events.push({
                                        id: `task_cancelled_${task.id}`,
                                        date: task.updatedAt ? new Date(task.updatedAt) : new Date(task.createdAt),
                                        label: 'Task cancelled',
                                        sublabel: `"${task.title}"`,
                                        icon: <XCircle className="h-3.5 w-3.5" />,
                                        dot: 'bg-red-500/15 text-red-500',
                                        line: 'from-red-500/40',
                                    })
                                }
                            })

                            // 5. Invoice events
                            if (projectInvoices) {
                                projectInvoices.forEach(inv => {
                                    if (inv.createdAt) {
                                        events.push({
                                            id: `invoice_created_${inv.id}`,
                                            date: new Date(inv.createdAt),
                                            label: 'Invoice Generated',
                                            sublabel: `${formatInvoiceId(inv)} - $${Number(inv.amount).toLocaleString()} (${inv.status.replace('_', ' ')})`,
                                            icon: <Wallet className="h-3.5 w-3.5" />,
                                            dot: 'bg-blue-500/15 text-blue-500',
                                            line: 'from-blue-500/40',
                                        })
                                    }
                                    if (inv.status === 'paid' && inv.paidAt) {
                                        events.push({
                                            id: `invoice_paid_${inv.id}`,
                                            date: new Date(inv.paidAt),
                                            label: 'Invoice Paid',
                                            sublabel: `${formatInvoiceId(inv)} - $${Number(inv.amount).toLocaleString()}`,
                                            icon: <CheckCircle className="h-3.5 w-3.5" />,
                                            dot: 'bg-green-500/15 text-green-500',
                                            line: 'from-green-500/40',
                                        })
                                    }
                                })
                            }

                            // Sort newest first
                            events.sort((a, b) => b.date.getTime() - a.date.getTime())

                            const fmtTs = (d: Date) =>
                                d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })

                            return (
                                <div className="animate-in fade-in-50 space-y-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold">Recent Activity</h3>
                                        <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/50 bg-muted/30 px-2 py-1 rounded-md">
                                            {events.length} event{events.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        {events.map((ev, i) => {
                                            const isLast = i === events.length - 1
                                            return (
                                                <div key={ev.id} className="flex gap-3.5">
                                                    {/* Left: icon bubble + connector line */}
                                                    <div className="flex flex-col items-center shrink-0 w-8">
                                                        <div className={cn('p-1.5 rounded-full shrink-0 ring-1 ring-inset ring-white/5', ev.dot)}>
                                                            {ev.icon}
                                                        </div>
                                                        {!isLast && (
                                                            <div className={cn('w-px flex-1 mt-1 bg-linear-to-b to-border/10', ev.line)} style={{ minHeight: 24 }} />
                                                        )}
                                                    </div>
                                                    {/* Right: content */}
                                                    <div className={cn('flex-1 min-w-0', isLast ? 'pb-1' : 'pb-5')}>
                                                        <p className="text-sm font-semibold text-foreground leading-snug">{ev.label}</p>
                                                        {ev.sublabel && (
                                                            <p className="text-xs text-muted-foreground/80 mt-0.5 truncate font-medium">{ev.sublabel}</p>
                                                        )}
                                                        <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                                                            {ev.actor && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <div className="h-4 w-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[9px] font-bold uppercase shrink-0">
                                                                        {ev.actor.trim()[0]}
                                                                    </div>
                                                                    <span className="text-[11px] text-muted-foreground font-semibold">{ev.actor}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
                                                                <Clock className="h-2.5 w-2.5" />
                                                                {fmtTs(ev.date)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })()}

                        {/* Actions */}
                        <div className="flex flex-row justify-between items-center mt-6 pt-6 border-t border-border/40">
                            <Button
                                variant={'outline'}
                                size='sm'
                                className='flex items-center gap-2 p-6 rounded-lg'
                                onClick={handleArchive}
                                disabled={isArchiving}
                            >
                                {isArchiving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
                                {isArchiving ? 'Archiving...' : project?.isArchived ? 'Unarchive Project' : 'Archive Project'}
                            </Button>
                            <DeleteButton
                                projectId={project?.id}
                                projectName={project?.title}
                                redirectAfterDelete={false}
                            >
                                <Button
                                    variant={'destructive'}
                                    size="sm"
                                    className="flex items-center gap-2 p-6 rounded-lg"
                                    onClick={() => setArchive(true)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete Project
                                </Button>
                            </DeleteButton>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
            {taskToEdit && createPortal(
                <EditTaskForm
                    task={{
                        id: taskToEdit.id,
                        title: taskToEdit.title,
                        summary: taskToEdit.summary || undefined,
                        description: taskToEdit.description || undefined,
                        status: taskToEdit.status as 'todo' | 'in_progress' | 'done' | 'cancelled' | 'delayed',
                        priority: taskToEdit.priority as 'low' | 'medium' | 'high',
                        deadline: taskToEdit.deadline,
                        tagIds: taskToEdit.tags?.map(t => t.id) || [],
                        missions: taskToEdit.missions?.map(m => ({ id: m.id, name: m.name, completed: m.completed })) || [],
                        projectId: taskToEdit.projectId,
                    }}
                    projects={project ? [project] : []}
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false)
                        setTaskToEdit(null)
                    }}
                    onTaskUpdated={() => {
                        if (fetchTasks && project?.id) {
                            fetchTasks(project.id).then(setFetchedTasks);
                        }
                    }}
                />,
                document.body
            )}
            {createPortal(
                <TaskForm
                    key={isAddTaskOpen ? project?.id : 'closed'}
                    projects={project ? [project] : []}
                    isOpen={isAddTaskOpen}
                    onClose={() => setIsAddTaskOpen(false)}
                    onTaskCreated={(newTask) => {
                        setFetchedTasks(prev => [newTask, ...prev])
                        setIsAddTaskOpen(false)
                    }}
                />,
                document.body
            )}
        </>
    )
}