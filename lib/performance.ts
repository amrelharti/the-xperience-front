// Performance monitoring utilities
import React from 'react'

interface PerformanceEntry {
  name: string
  startTime: number
  endTime?: number
  duration?: number
}

class PerformanceMonitor {
  private entries: Map<string, PerformanceEntry> = new Map()

  start(name: string): void {
    this.entries.set(name, {
      name,
      startTime: performance.now()
    })
  }

  end(name: string): number | undefined {
    const entry = this.entries.get(name)
    if (!entry) {
      console.warn(`Performance entry "${name}" not found`)
      return undefined
    }

    const endTime = performance.now()
    const duration = endTime - entry.startTime

    entry.endTime = endTime
    entry.duration = duration

    // Log slow operations (>1000ms)
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`)
    }

    this.entries.delete(name)
    return duration
  }

  measure<T>(name: string, fn: () => T): T {
    this.start(name)
    try {
      const result = fn()
      return result
    } finally {
      this.end(name)
    }
  }

  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.start(name)
    try {
      const result = await fn()
      return result
    } finally {
      this.end(name)
    }
  }

  getEntries(): PerformanceEntry[] {
    return Array.from(this.entries.values())
  }

  clear(): void {
    this.entries.clear()
  }
}

// Create singleton instance
export const perf = new PerformanceMonitor()

// React hook for measuring component render performance
export function usePerformanceMeasure(name: string, deps: React.DependencyList = []) {
  React.useEffect(() => {
    perf.start(name)
    return () => {
      perf.end(name)
    }
  }, deps)
}

// Utility function for measuring API calls
export async function measureApiCall<T>(
  name: string, 
  apiCall: () => Promise<T>
): Promise<T> {
  return perf.measureAsync(name, apiCall)
}

// Utility function for measuring component renders
export function measureRender<T>(
  name: string, 
  renderFn: () => T
): T {
  return perf.measure(name, renderFn)
}
