'use client'

import { createTag, getTags, Tag, updateTag } from "@/lib/api/tags"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Edit2, ChevronDown } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip"
import { useEffect, useState, useMemo } from "react"
import { IconRenderer } from "./icon-picker"
import { IconPickerDialog } from "./ready-icon-picker"

let globalCachedTags: Tag[] | null = null;

const DynamicIcon = ({ name, className }: { name?: string, className?: string }) => {
  if (!name) return <IconRenderer icon="TagIcon" className={className} />
  return <IconRenderer icon={name} className={className} />
}

import { Input } from "./input";
import { Button } from "./button";
import { ColorPicker } from "./color-picker";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";


interface TagSelectorProps {
  selectedTagIds: number []
  disabled?: boolean
  entityType?: string
  compact?: boolean
  iconOnly?: boolean
  noIcon?: boolean
  maxTags?: number
  existTitle: string
  onChange: (tagIds: number[]) => void
}


export const TagSelector = ({ selectedTagIds, disabled, compact, iconOnly, noIcon, maxTags, existTitle, onChange }: TagSelectorProps) => {

  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#6b7280')
  const [newTagIcon, setNewTagIcon] = useState('TagIcon')
  const [isCreating, setIsCreating] = useState(false)
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [editingTagId, setEditingTagId] = useState<number | null>(null)
  const [editColor, setEditColor] = useState('')
  const [editIcon, setEditIcon] = useState('')

  useEffect(() => {
    if (globalCachedTags) {
      setAvailableTags(globalCachedTags)
    } else {
      setLoading(true)
    }

    const fetchTags = async () =>{
      try {
        const tags = await getTags()
        globalCachedTags = tags
        setAvailableTags(tags)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchTags()
  }, [])

  const isAtMaxTags = maxTags !== undefined && selectedTagIds.length >= maxTags

  const handleAdding = (tagId: number) => {
    if (!selectedTagIds.includes(tagId)){
      if (maxTags !== undefined && maxTags === 1) {
        // Replace the current tag instead of adding
        onChange([tagId])
      } else if (!isAtMaxTags) {
        onChange([...selectedTagIds, tagId])
      }
    }
  }

  const handleRemoving = (tagId: number) => {
    onChange(selectedTagIds.filter(id => id !== tagId))
  }

  const handleCreatingTag = async () => {
    if (!newTagName.trim()) return
    
    setIsCreating(true)

    try {
      const newTag = await createTag({ 
        name: newTagName.trim(),
        color: newTagColor,
        icon: newTagIcon
      })
      setAvailableTags(prev => [...prev, newTag])
      if (maxTags !== undefined && maxTags === 1) {
        onChange([newTag.id])
      } else if (!isAtMaxTags) {
        onChange([...selectedTagIds, newTag.id])
      }
      setNewTagName('')
      setNewTagColor('#6b7280')
      setNewTagIcon('TagIcon')
    } catch (error) {

      console.error(error)
      
    }finally{
      setIsCreating(false)
    }
  }

  const handleEditInit = (tag: Tag) => {
    setEditingTagId(tag.id)
    setEditColor(tag.color || '#e5e7eb')
    setEditIcon(tag.icon || 'TagIcon')
  }

  const handleEditSave = async (tag: Tag) => {
    try {
      const updated = await updateTag(tag.id, { color: editColor, icon: editIcon })
      setAvailableTags(prev => prev.map(t => t.id === tag.id ? updated : t))
      setEditingTagId(null)
    } catch (e) {
      console.error(e)
    }
  }

  const selectedTags = useMemo(
    () => availableTags.filter(t => selectedTagIds.includes(t.id)),
    [availableTags, selectedTagIds]
  )
  

  return (
    <div className="space-y-3">
      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2">
        {iconOnly ? (
          // Icon-only mode: render just the colored icon with tooltip
          <>
            {selectedTags.map(t => (
              <TooltipProvider key={t.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative group">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-transform hover:scale-110 cursor-default"
                        style={{ color: t.color || '#6b7280', backgroundColor: `${t.color || '#6b7280'}18` }}
                      >
                        <DynamicIcon name={t.icon} className="h-4.5 w-4.5" />
                      </div>
                      {!disabled && (
                        <button
                          type="button"
                          onClick={() => handleRemoving(t.id)}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {t.name}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            {selectedTags.length === 0 && (
              <span className="text-sm text-muted-foreground">{existTitle}</span>
            )}
          </>
        ) : (
          // Default mode: full badge with icon + name or just name if noIcon is true
          <>
            {selectedTags.map(t => (
              <Badge
                key={t.id}
                style={{ backgroundColor: t.color || '#e5e7eb' }}
                className="flex items-center gap-1.5 px-2.5 py-1 text-sm text-white rounded-md font-medium"
              >
                {!noIcon && <DynamicIcon name={t.icon} className="h-5 w-5" />}
                {t.name}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemoving(t.id)}
                    className="ml-1 text-white/70 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
            {selectedTags.length === 0 && (
              <span className="text-sm text-muted-foreground">{existTitle}</span>
            )}
          </>
        )}
      </div>

      {!disabled && !(isAtMaxTags && maxTags !== 1) && (
        <div className="flex flex-wrap gap-2">
          {/* Custom Tag Dropdown */}
          <Popover open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <PopoverTrigger asChild>
              {compact ? (
                <Button type="button" variant="outline" size="icon" className="h-7 w-7 rounded-full border-dashed" disabled={isCreating}>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </Button>
              ) : (
                <Button type="button" variant="outline" className="flex-1 h-8 justify-between text-sm text-muted-foreground font-normal" disabled={isCreating}>
                  Select an existing tag...
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              )}
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0 shadow-lg rounded-xl border-muted/60" align="start">
              <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
                {availableTags.filter(t => !selectedTagIds.includes(t.id)).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">{ iconOnly ? "No icons available to select." : "No tags available to select."}</p>
                )}
                {availableTags
                  .filter(t => !selectedTagIds.includes(t.id))
                  .map(tag => (
                    <div key={tag.id}>
                      {editingTagId === tag.id ? (
                        <div className="flex flex-col gap-3 p-3 bg-muted/40 rounded-lg border border-border/50 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                          <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-md flex items-center justify-center text-white shrink-0 shadow-sm" style={{ backgroundColor: editColor }}>
                               {!noIcon && <DynamicIcon name={editIcon} className="h-5 w-5" />}
                             </div>
                             <span className="text-sm font-medium">{tag.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ColorPicker color={editColor} onChange={setEditColor} />
                            {!noIcon && <IconPickerDialog value={editIcon} onChange={setEditIcon} />}
                            <div className="flex gap-1 ml-auto">
                              <Button type="button" size="sm" variant="ghost" className="h-8 px-2" onClick={() => setEditingTagId(null)}>Cancel</Button>
                              <Button type="button" size="sm" className="h-8 px-3 shadow-sm" onClick={() => handleEditSave(tag)}>Save</Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between group rounded-lg hover:bg-muted/60 p-1 transition-colors">
                          <button
                            type="button"
                            className="flex items-center gap-2 flex-1 text-left px-2 py-1.5"
                            onClick={() => {
                              handleAdding(tag.id)
                              setIsDropdownOpen(false)
                            }}
                          >
                            <div className="w-6 h-6 rounded-md flex items-center justify-center text-white shrink-0 shadow-sm" style={{ backgroundColor: tag.color || '#e5e7eb' }}>
                               {!noIcon && <DynamicIcon name={tag.icon} className="h-4 w-4" />}
                            </div>
                            <span className="text-sm font-medium">{tag.name}</span>
                          </button>
                          <Button type="button" variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mr-1" onClick={(e) => { e.preventDefault(); handleEditInit(tag); }}>
                            <Edit2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
              <div className="p-2 border-t border-muted/60 bg-muted/20">
                <div className="flex gap-1 items-center">
                  <ColorPicker
                    color={newTagColor}
                    onChange={setNewTagColor}
                    disabled={isCreating}
                  />
                  {!noIcon && (
                    <IconPickerDialog
                      value={newTagIcon}
                      onChange={setNewTagIcon}
                      disabled={isCreating}
                    />
                  )}
                  <Input 
                    type="text"
                    placeholder="New tag..."
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleCreatingTag()
                      }
                    }}
                    className="flex-1 h-8 text-sm"
                    disabled={isCreating}
                  />
                  <Button
                    type="button"
                    size={'sm'}
                    variant={'outline'}
                    className="h-8 px-2"
                    onClick={handleCreatingTag}
                    disabled={!newTagName.trim() || isCreating}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

        </div>
      )}
    </div>
  )
}