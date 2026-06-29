"use client"

import { useState, useEffect, useCallback } from "react"
import {
  X, Zap, Play, Pause, Square, MoreHorizontal,
  Pencil, ExternalLink, Trash2, Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Task } from "@/lib/api/tasks"
import { MissionProgress } from "./MissionProgress"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useTimerStore } from "@/store/timerStore"
import { getTodaySeconds } from "@/lib/utils/todayHours"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import DeleteButton from "./DeleteTasks"
import Link from "next/link"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5501/api"

const getStatusColor = (status: string) => {
  const map: Record<string, string> = {
    todo: "badge-status-todo",
    in_progress: "badge-status-in_progress",
    done: "badge-status-done",
    cancelled: "badge-status-cancelled",
    delayed: "badge-status-delayed",
    overdue: "badge-status-overdue",
  }
  return map[status] || map.delayed
}

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    todo: "To Do", in_progress: "In Progress", done: "Done",
    cancelled: "Cancelled", delayed: "Delayed", overdue: "Overdue",
  }
  return map[status] || "Unknown"
}

// Format convert seconds to h, m and s 
const formatDuration = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds))
  if (s === 0) return "0m"
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}

interface FocusedTaskProps {
  task: Task
  onClose: () => void
  onEdit?: (task: Task) => void
  onDelete?: (id: number) => void
  onOpenPanel?: (taskId: number, taskTitle: string, project: any) => void
  onTimeLogged?: () => void
}

export const FocusedTask = ({
  task, onClose, onEdit, onDelete, onOpenPanel, onTimeLogged,
}: FocusedTaskProps) => {
  const missionTotal = task.missions.length
  const completedMissions = task.missions.filter((m) => m.completed).length
  const missionPct = missionTotal > 0 ? Math.round((completedMissions / missionTotal) * 100) : 0

  /* ── Timer store ───────────────────────────────────────────────── */
  const timer = useTimerStore((s) => s.timers[task.id])
  const sessionLoaded = useTimerStore((s) => s.sessionLoaded)
  const startTimer = useTimerStore((s) => s.startTimer)
  const pauseTimer = useTimerStore((s) => s.pauseTimer)
  const resumeTimer = useTimerStore((s) => s.resumeTimer)
  const stopTimer = useTimerStore((s) => s.stopTimer)

  const timerStatus = timer?.status ?? "idle"
  const elapsedSec = timer?.elapsedSeconds ?? 0
  const pastLoggedSec = timer?.pastLoggedSeconds ?? 0
  const isActive = !!timer
  const isDone = task.status === "done" || task.status === "cancelled"

  /* ── Remote hours ──────────────────────────────────────────────── */
  const [todaySec, setTodaySec] = useState(0)
  const [totalSec, setTotalSec] = useState(0)

  // Hydrate todaySec on mount so it doesn't cause hydration mismatch
  useEffect(() => {
    setTodaySec(getTodaySeconds(task.id))
  }, [task.id])
  const [btnLoading, setBtnLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const fetchHours = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${task.id}/timer/hours`, { credentials: "include" })
      if (res.ok) {
        const d = await res.json()
        setTotalSec((Number(d.totalHours) || 0) * 3600)
      }
    } catch { /* Silent for now  */ }
  }, [task.id])

  useEffect(() => { fetchHours() }, [fetchHours])
  useEffect(() => {
    const h = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.taskId === task.id) {
        fetchHours()
        setTodaySec(getTodaySeconds(task.id))
      }
    }
    window.addEventListener("taskTimeLogged", h)
    return () => window.removeEventListener("taskTimeLogged", h)
  }, [task.id, fetchHours])

  // live "today" = persisted total + current running chunk (not yet saved)
  const liveRunningChunk = timerStatus === "running"
    ? Math.max(0, elapsedSec - pastLoggedSec)
    : 0

  const liveTodaySec = todaySec + liveRunningChunk
  const liveTotalSec = Math.max(totalSec, elapsedSec)

  // Handlers
  const wrap = (fn: () => Promise<void>, after?: () => void) => async () => {
    setBtnLoading(true)
    try {
      await fn();
      after?.()
    } catch (e) {
      console.error(e)
    } finally {
      setBtnLoading(false)
    }
  }

  const handleStart = wrap(() =>
    startTimer(task.id, task.title))

  const handlePause = wrap(() =>
    pauseTimer(task.id), () => { onTimeLogged?.() })

  const handleResume = wrap(() =>
    resumeTimer(task.id))

  const handleStop = wrap(() =>
    stopTimer(task.id), () => { onTimeLogged?.(); fetchHours() })

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault()
    onOpenPanel?.(task.id, task.title, task.project ?? null)
  }

  // Derived UI
  const runningDot = timerStatus === "running"
    ? "bg-emerald-500 animate-pulse"
    : timerStatus === "paused"
      ? "bg-amber-400"
      : "bg-muted-foreground/30"

  const primaryAction = () => {
    if (!sessionLoaded) return null
    if (isDone) return null
    if (!isActive || timerStatus === "idle")
      return (
        <Button
          onClick={handleStart}
          disabled={btnLoading}
          size="sm"
          className="gap-1.5 px-4 h-9 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          Start Timer
        </Button>
      )
    if (timerStatus === "running")
      return (
        <div className="flex items-center gap-2">
          <Button onClick={handlePause} disabled={btnLoading} size="sm"
            className="gap-1.5 px-4 h-9 rounded-lg bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-sm">
            <Pause className="h-3.5 w-3.5 fill-white" /> Pause
          </Button>
          <Button onClick={handleStop} disabled={btnLoading} size="sm" variant="destructive"
            className="h-9 px-3 rounded-lg shadow-sm">
            <Square className="h-3.5 w-3.5 fill-white" />
          </Button>
        </div>
      )
    if (timerStatus === "paused")
      return (
        <div className="flex items-center gap-2">
          <Button onClick={handleResume} disabled={btnLoading} size="sm"
            className="gap-1.5 px-4 h-9 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
            <Play className="h-3.5 w-3.5 fill-current" /> Resume Timer
          </Button>
          <Button onClick={handleStop} disabled={btnLoading} size="sm" variant="destructive"
            className="h-9 px-3 rounded-lg shadow-sm">
            <Square className="h-3.5 w-3.5 fill-white" />
          </Button>
        </div>
      )
    return null
  }

  /* ────────────────────────────────────────────────────────────────
     RENDER
  ─────────────────────────────────────────────────────────────── */
  return (
    <div className={cn(
      "w-full mb-6 rounded-xl border bg-card/50 dark:bg-card/80 backdrop-blur-sm transition-all",
      "border-border/50 shadow-sm",
    )}>
      {/* slim top accent */}
      <div className={cn(
        "h-[2px] rounded-t-xl w-full transition-all duration-500",
        timerStatus === "running" ? "bg-linear-to-r from-transparent via-emerald-400 to-transparent"
          : timerStatus === "paused" ? "bg-linear-to-r from-transparent via-amber-400/70 to-transparent"
            : "bg-linear-to-r from-transparent via-primary/25 to-transparent"
      )} />

      <div className="px-5 py-4 flex flex-col gap-0">

        {/* ── Label row ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 fill-amber-400 text-amber-300" />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
              Current Focus
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}
            className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* ── Main horizontal body ───────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-6">

          {/* 1 ─ Task identity */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <Link 
              href={`/task/${task.id}`}
              onClick={handleOpen}
              >
              <h2 className="text-lg font-bold leading-tight hover:text-primary transition-colors">{task.title}</h2>
              </Link>
              <div className={cn(
                "inline-flex items-center border px-2.5 py-0.5 text-xs font-semibold rounded-full shrink-0",
                getStatusColor(task.status)
              )}>
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75 mr-1.5" />
                {statusLabel(task.status)}
              </div>
            </div>

            {task.summary && (
              <p className="text-sm text-muted-foreground line-clamp-1">{task.summary}</p>
            )}

            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {task.tags.map((t) => (
                  <Badge key={t.id}
                    style={{ backgroundColor: `${t.color || "#6b7280"}20`, color: t.color || "#6b7280", borderColor: `${t.color || "#6b7280"}35` }}
                    className="px-2 py-0.5 text-[11px] rounded-md font-medium border shadow-none">
                    {t.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* divider */}
          <div className="hidden md:block w-px h-16 bg-muted-foreground/20" />

          {/* 2 ─ Missions Progress */}
          <div className="flex items-center gap-3 shrink-0">
            <MissionProgress size={48} completed={completedMissions} total={missionTotal} animate={timerStatus === "running"} />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-0.5">
                Missions Progress
              </p>
              <p className="text-md font-bold leading-none">
                {completedMissions}
                <span className="text-muted-foreground font-normal">/{missionTotal}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{missionPct}% Completed</p>
            </div>
          </div>

          {/* divider */}
          <div className="hidden md:block w-px h-16 bg-muted-foreground/20" />

          {/* 3 ─ Time Tracked Today */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/8 border border-primary/12 shrink-0">
              <Clock className="h-4.5 w-4.5 text-primary/70" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-0.5">
                Time Tracked Today
              </p>
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "h-1.5 w-1.5 rounded-full shrink-0",
                  runningDot,
                )} />
                <p className="text-lg font-bold tabular-nums leading-none">
                  {formatDuration(liveTodaySec)}
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Total: <span className="font-semibold text-foreground">{formatDuration(liveTotalSec)}</span>
              </p>
            </div>
          </div>

          {/* divider */}
          <div className="hidden md:block w-px h-16 bg-muted-foreground/20" />

          {/* 4 ─ Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {!sessionLoaded ? (
              <div className="h-9 w-28 rounded-lg bg-muted animate-pulse" />
            ) : (
              primaryAction()
            )}

            {/* ··· overflow menu */}
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon"
                  className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground border border-border/50"
                  aria-label="Task actions">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {onOpenPanel && (
                  <DropdownMenuItem onSelect={() => onOpenPanel(task.id, task.title, task.project ?? null)}>
                    <ExternalLink className="h-4 w-4 mr-2" /> View task details
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onSelect={onEdit}>
                    <Pencil className="h-4 w-4 mr-2" /> Edit task
                  </DropdownMenuItem>
                )}
                {(onDelete) && <DropdownMenuSeparator />}
                {onDelete && (
                  <DropdownMenuItem asChild>
                    <DeleteButton taskId={task.id} taskName={task.title} redirectAfterDelete={false}
                      onDeleted={(id) => { onDelete(id); onClose() }}>
                      <span className="flex items-center gap-2 text-destructive w-full">
                        <Trash2 className="h-4 w-4" /> Delete task
                      </span>
                    </DeleteButton>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

        </div>
      </div>
    </div>
  )
}