'use client'

import React, { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Button } from './button'
import { Input } from './input'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HexColorPicker } from 'react-colorful'

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  disabled?: boolean
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#64748b',
]

export const ColorPicker = ({ color, onChange, disabled }: ColorPickerProps) => {
  const [tab, setTab] = useState<'preset' | 'custom'>('preset')
  const [isOpen, setIsOpen] = useState(false)

  const [recentColors, setRecentColors] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recentCustomColors')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })

  return (
    <Popover open={isOpen} onOpenChange={(o) => {
      setIsOpen(o)
      if (!o && tab === 'custom') {
        setRecentColors(prev => {
          const newRecent = [color, ...prev.filter(x => x.toLowerCase() !== color.toLowerCase())].slice(0, 6)
          localStorage.setItem('recentCustomColors', JSON.stringify(newRecent))
          return newRecent
        })
      }
    }}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-8 h-8 p-0 shrink-0 overflow-hidden shadow-sm transition-transform hover:scale-105", 
            disabled && "opacity-50 cursor-not-allowed hover:scale-100"
          )}
          style={{ backgroundColor: color }}
          disabled={disabled}
        >
          <span className="sr-only">Pick a color</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4 shadow-xl rounded-2xl border-muted/60" align="start">
        <style dangerouslySetInnerHTML={{__html: `
          .custom-color-picker-wrapper .react-colorful {
            width: 100%;
            height: 180px;
          }
          .custom-color-picker-wrapper .react-colorful__pointer {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          }
          .custom-color-picker-wrapper .react-colorful__hue {
            height: 16px;
            border-radius: 8px;
            margin-top: 12px;
          }
          .custom-color-picker-wrapper .react-colorful__hue-pointer {
            width: 20px;
            height: 20px;
          }
        `}} />

        <div className="flex bg-muted/50 p-1 rounded-lg mb-4">
          <button
            type="button"
            className={cn(
              "flex-1 text-xs py-1.5 rounded-md transition-all font-medium",
              tab === 'preset' ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setTab('preset')}
          >
            Presets
          </button>
          <button
            type="button"
            className={cn(
              "flex-1 text-xs py-1.5 rounded-md transition-all font-medium",
              tab === 'custom' ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setTab('custom')}
          >
            Custom
          </button>
        </div>

        {tab === 'preset' ? (
          <div className="grid grid-cols-6 gap-2 mb-4">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={cn(
                  "w-8 h-8 rounded-full border border-black/5 flex items-center justify-center transition-all hover:scale-110 shadow-sm",
                  color.toLowerCase() === c.toLowerCase() && "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110"
                )}
                style={{ backgroundColor: c }}
                onClick={() => onChange(c)}
              >
                {color.toLowerCase() === c.toLowerCase() && (
                  <Check className="h-4 w-4 text-white drop-shadow-md" />
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="mb-4 flex flex-col items-center w-full">
            <div className="custom-color-picker-wrapper w-full mb-3">
              <HexColorPicker color={color} onChange={onChange} />
            </div>
            {recentColors.length > 0 && (
              <div className="w-full">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1.5 ml-1">Recent</p>
                <div className="flex gap-2 flex-wrap">
                  {recentColors.map(c => (
                    <button
                      key={c}
                      type="button"
                      className={cn(
                        "w-6 h-6 rounded-full border border-black/10 flex items-center justify-center transition-all hover:scale-110 shadow-sm",
                        color.toLowerCase() === c.toLowerCase() && "ring-1 ring-primary ring-offset-1 scale-110"
                      )}
                      style={{ backgroundColor: c }}
                      onClick={() => onChange(c)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* HEX Input Field */}
        <div className="pt-3 border-t flex gap-2 items-center">
          <div className="w-8 h-8 rounded-md shadow-inner border border-black/10 shrink-0" style={{ backgroundColor: color }} />
          <Input
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 uppercase font-mono text-xs w-full bg-muted/50 focus-visible:ring-1"
            placeholder="#000000"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
