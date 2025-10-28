"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

interface CountdownTimerProps {
  targetDate: string
  onCountdownEnd: () => void
}

export default function CountdownTimer({
  targetDate,
  onCountdownEnd,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
  })
  const [isEnded, setIsEnded] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetTime = new Date(targetDate).getTime()
      const currentTime = new Date().getTime()
      const difference = targetTime - currentTime

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 })
        if (!isEnded) {
          setIsEnded(true)
          onCountdownEnd()
        }
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

      setTimeLeft({ days, hours, minutes })
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [targetDate, onCountdownEnd, isEnded])

  const formatNumber = (num: number) => String(num).padStart(2, "0")

  if (isEnded) {
    return (
      <div className="text-center py-10">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#0476D7] to-[#005eb8] rounded-xl mb-4 shadow-lg">
          <Clock className="h-7 w-7 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Session is Live</h3>
        <p className="text-sm text-gray-600">
          Join the session now
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2.5 text-gray-700">
        <div className="p-1.5 bg-blue-50 rounded-lg">
          <Clock className="h-4 w-4 text-[#0476D7]" />
        </div>
        <span className="text-sm font-semibold">Session starts in</span>
      </div>

      <div className="flex items-center justify-center gap-2">
        {[
          { value: timeLeft.days, label: 'Days' },
          { value: timeLeft.hours, label: 'Hours' },
          { value: timeLeft.minutes, label: 'Minutes' }
        ].map((unit, index, array) => (
          <>
            <div key={unit.label} className="group">
              <div className="relative bg-white border-2 border-[#0476D7]/10 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm hover:border-[#0476D7]/30 hover:shadow-md transition-all duration-200">
                <div className="text-center">
                  <div className="relative">
                    <div className="text-2xl sm:text-3xl font-black text-[#0476D7] tabular-nums tracking-tight">
                      {formatNumber(unit.value)}
                    </div>
                    {/* Accent line */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 sm:w-12 h-0.5 bg-[#FFBC00] rounded-full" />
                  </div>
                  <div className="mt-2 text-xs font-bold text-[#0476D7] uppercase tracking-widest">
                    {unit.label}
                  </div>
                </div>
              </div>
            </div>
            {index < array.length - 1 && (
              <div className="text-2xl text-[#0476D7]/30 font-light pb-2">:</div>
            )}
          </>
        ))}
      </div>
    </div>
  )
}
