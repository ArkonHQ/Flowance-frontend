import { useState, useCallback, useEffect } from "react";

interface Identifiable {
    id: string | number;
}

export const useSelection = <T extends Identifiable> (allItems: T[], resetDeps: any[] =[]) => {
  
  const [selectIds, setSelectIds] = useState<Set<number>>(new Set())
  
  // Reset Selection whenever filters/search change
  useEffect(() => {
    setSelectIds(new Set())
  }, resetDeps)

  const toggleItem = useCallback((id: number) => {
    setSelectIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      }else{
        next.add(id)
      }
      return next
    })
  }, [])

  const toogleAll = useCallback(() => {
    const allIds = allItems.map(i => i.id as number)
    const allSelected = allIds.every(id => selectIds.has(id))

    setSelectIds(prev => {
      const next = new Set(prev)
      if (allSelected){ 
        allIds.forEach(id => next.delete(id))
      }else{
        allIds.forEach(id => next.add(id))
      }
      return next
    })
  }, [allItems, selectIds])

  const clearSelection = useCallback(() => {
    setSelectIds(new Set())
  }, [])
  
  return {
    selectIds,
    toggleItem,
    toogleAll,
    clearSelection
  }
}
