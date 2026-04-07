"use client"

import { useEffect, useMemo, useState } from "react"

export interface UsePaginationResult<T> {
  page: number
  pageSize: number
  pageCount: number
  total: number
  items: T[]
  goToPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  setPageSize: (size: number) => void
}

export function usePagination<T>(sourceItems: T[], initialPageSize = 10): UsePaginationResult<T> {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const total = sourceItems.length

  const pageCount = useMemo(() => {
    if (total === 0) return 1
    return Math.max(1, Math.ceil(total / pageSize))
  }, [total, pageSize])

  // Asegurar que la página actual nunca se salga de rango
  useEffect(() => {
    setPage((prev) => {
      if (prev < 1) return 1
      if (prev > pageCount) return pageCount
      return prev
    })
  }, [pageCount])

  // Resetear a la primera página cuando cambie el conjunto de elementos o el tamaño de página
  useEffect(() => {
    setPage(1)
  }, [total, pageSize])

  const items = useMemo(() => {
    if (total === 0) return []
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return sourceItems.slice(start, end)
  }, [sourceItems, page, pageSize, total])

  const goToPage = (target: number) => {
    if (pageCount === 0) return
    const clamped = Math.min(Math.max(1, target), pageCount)
    setPage(clamped)
  }

  const nextPage = () => {
    if (page < pageCount) setPage(page + 1)
  }

  const prevPage = () => {
    if (page > 1) setPage(page - 1)
  }

  return {
    page,
    pageSize,
    pageCount,
    total,
    items,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
  }
}
