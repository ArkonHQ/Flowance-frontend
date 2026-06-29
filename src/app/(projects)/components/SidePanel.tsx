'use client'

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Project, updateProject } from "@/lib/api/projects";
import { ExternalLink, X, Lightbulb, Rocket, TrendingUp, Target, CheckCircle, PauseCircle, Sparkles, XCircle, Flame, Circle, CircleDashed, Calendar, Clock, User, UserPlus, UserPlus2Icon, Trash2, Archive, Loader2 } from "lucide-react";
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






interface SidePanelProps {
    open: boolean;
    onClose: () => void;
    project?: Project;
    onDelete?: (id: number) => void
    onEdit?: (project: Project) => void
    clientName?: string
    timeTrackedThisWeek?: number
    totalPaid?: number
    onArchive?: (id: number, isArchived: boolean) => void
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


export const SidePanel: React.FC<SidePanelProps> = ({ open, onClose, project, onDelete, onEdit, clientName, timeTrackedThisWeek, totalPaid, onArchive }) => {


    const isLargeScreen = useMediaQuery('(min-width: 1024px)')
    const [activeTab, setActiveTab] = useState('overview')
    const [isExtended, setIsExtended] = useState<boolean>(false)
    const [archive, setArchive] = useState<boolean>(false)
    const [isArchiving, setIsArchiving] = useState<boolean>(false)



    // Handle Archive
    const handleArchive = async () => {
        if (!project) return
        const newState = !project.isArchived
        setIsArchiving(true)
        try {
            await updateProject(project.id, {isArchived: newState})
            onArchive?.(project.id, newState)
            toast.success(newState ? `"${project.title}" archived` : `"${project.title}" unarchived`)
            onClose()
        } catch (err) {
            console.error('Error archiving project:', err)
            toast.error('Failed to archive project')
        }finally{
            setIsArchiving(false)
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

    const projectBudget = project?.budget || 0;


    const paymentPercentage = projectBudget > 0
        ? Math.min(Math.round(((totalPaid || 0) / Number(projectBudget)) * 100), 100)
        : 0;


    const paymentColor = paymentPercentage >= 100
        ? '#22c55e'
        : paymentPercentage >= 50
            ? '#eab308'
            : '#ef4444'

    return (
        <Sheet open={open} onOpenChange={onClose} modal={!isLargeScreen}>
            <SheetContent
                className={cn('w-full !max-w-none !w-[100vw] sm:!w-fit sm:min-w-[450px] sm:!max-w-[600px] overflow-y-auto rounded-lg border-2 border-card shadow-lg p-0')}
                side="right"
                onPointerDownOutside={(e) => {
                    if (isLargeScreen) {
                        e.stopPropagation()
                    }
                }}
                onInteractOutside={(e) => {
                    if (isLargeScreen) {
                        e.stopPropagation()
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
                <div className="flex w-full overflow-x-auto border-b border-border px-4 mt-6">
                    <div className="flex gap-6 text-sm font-medium text-muted-foreground whitespace-nowrap">
                        {['overview', 'details', 'tasks', 'members', 'files', 'activity'].map(tab => (
                            <button
                                key={tab}
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
                                        {paymentPercentage}% paid (${(totalPaid || 0).toLocaleString()})
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
                        <div className="flex flex-row justify-between item-center mt-4 p-4">
                            <Button 
                                variant={'outline'}
                                size='sm'
                                className= 'flex item-center gap-2 p-6 rounded-lg'
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
                                        onChange={() => setArchive(true)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete Project
                                    </Button>
                            </DeleteButton>
                            </div>
                    </>
                    )}
                    {activeTab === 'details' && (
                        <div className="space-y-4 animate-in fade-in-50">
                            <h3 className="text-lg font-semibold">Details</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm bg-card/30 p-4 rounded-lg border border-border/40">
                                <div><span className="text-muted-foreground block mb-1">Budget</span> <span className="font-medium">{project?.budget ? `$${project.budget.toLocaleString()}` : 'N/A'}</span></div>
                                <div><span className="text-muted-foreground block mb-1">Deadline</span> <span className="font-medium">{project?.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A'}</span></div>
                                <div><span className="text-muted-foreground block mb-1">Time Tracked</span> <span className="font-medium">{project?.totalTimeTracked ? `${(project.totalTimeTracked / 60).toFixed(1)} hrs` : '0 hrs'}</span></div>
                                <div><span className="text-muted-foreground block mb-1">Created At</span> <span className="font-medium">{project?.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}</span></div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'tasks' && (
                        <div className="space-y-4 animate-in fade-in-50">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Tasks</h3>
                                <Button size="sm">Add Task</Button>
                            </div>
                            <div className="text-sm text-muted-foreground italic bg-muted/30 p-8 rounded-lg text-center border border-dashed border-border/50">
                                No tasks populated yet.
                            </div>
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
                        <div className="space-y-4 animate-in fade-in-50">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Files</h3>
                                <Button size="sm" variant="outline">Upload</Button>
                            </div>
                            <div className="text-sm text-muted-foreground italic bg-muted/30 p-8 rounded-lg text-center border border-dashed border-border/50">
                                No files uploaded yet.
                            </div>
                        </div>
                    )}
                    {activeTab === 'activity' && (
                        <div className="space-y-4 animate-in fade-in-50">
                            <h3 className="text-lg font-semibold">Recent Activity</h3>
                            <div className="text-sm text-muted-foreground italic bg-muted/30 p-8 rounded-lg text-center border border-dashed border-border/50">
                                No recent activity to show.
                            </div>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}