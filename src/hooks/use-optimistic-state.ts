import { useState, useCallback } from 'react'

export function useOptimisticState<T>(initialState: T[]) {
  const [data, setData] = useState<T[]>(initialState)
  const [loading, setLoading] = useState(false)

  const optimisticUpdate = useCallback(async <R>(
    optimisticAction: (prev: T[]) => T[],
    apiCall: () => Promise<R>,
    onError?: (prev: T[]) => T[]
  ): Promise<R | null> => {
    const originalData = data
    
    // Apply optimistic update
    setData(optimisticAction)
    setLoading(true)

    try {
      const result = await apiCall()
      setLoading(false)
      return result
    } catch (error) {
      // Revert on error
      setData(onError ? onError(originalData) : originalData)
      setLoading(false)
      throw error
    }
  }, [data])

  const optimisticDelete = useCallback((id: string | number, apiCall: () => Promise<any>) => {
    return optimisticUpdate(
      (prev) => prev.filter((item: any) => item.id !== id),
      apiCall
    )
  }, [optimisticUpdate])

  const optimisticAdd = useCallback((newItem: T, apiCall: () => Promise<any>) => {
    return optimisticUpdate(
      (prev) => [newItem, ...prev],
      apiCall
    )
  }, [optimisticUpdate])

  const optimisticEdit = useCallback((id: string | number, updatedItem: T, apiCall: () => Promise<any>) => {
    return optimisticUpdate(
      (prev) => prev.map((item: any) => item.id === id ? updatedItem : item),
      apiCall
    )
  }, [optimisticUpdate])

  return {
    data,
    setData,
    loading,
    optimisticUpdate,
    optimisticDelete,
    optimisticAdd,
    optimisticEdit
  }
}