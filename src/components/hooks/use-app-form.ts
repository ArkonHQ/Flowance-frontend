'use client'

import { useCallback, useState } from "react"

export function useAppForm<T>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues)

  const setFieldValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues((prev) => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const resetForm = useCallback(() => {
    setValues(initialValues)
  }, [initialValues])

  return {
    values,
    setFieldValue,
    setValues,
    resetForm,
  }
}
