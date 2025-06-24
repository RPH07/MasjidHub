import React, { useState, useEffect, useRef } from 'react'
import { getTimeUrgencyClass } from '../../utils'

const CountdownTimer = ({ 
  sisaDetik, 
  onTimeUp, 
  size = 'medium',
  showLabel = true,
  autoUpdate = true,
  className = ''
}) => {
  const [timeLeft, setTimeLeft] = useState(sisaDetik || 0)
  const [isActive, setIsActive] = useState(true)
  const intervalRef = useRef(null)
  const onTimeUpRef = useRef(onTimeUp)

  // Update ref when onTimeUp changes
  useEffect(() => {
    onTimeUpRef.current = onTimeUp
  }, [onTimeUp])

  // Initialize timeLeft when sisaDetik prop changes
  useEffect(() => {
    setTimeLeft(sisaDetik || 0)
    setIsActive((sisaDetik || 0) > 0)
  }, [sisaDetik])

  // Countdown logic
  useEffect(() => {
    if (!autoUpdate || !isActive || timeLeft <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        const newTime = prevTime - 1

        // Time's up!
        if (newTime <= 0) {
          setIsActive(false)
          if (onTimeUpRef.current) {
            onTimeUpRef.current()
          }
          return 0
        }

        return newTime
      })
    }, 1000)

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [autoUpdate, isActive, timeLeft])

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'text-xs',
          time: 'text-sm font-semibold',
          label: 'text-xs'
        }
      case 'large':
        return {
          container: 'text-lg',
          time: 'text-2xl font-bold',
          label: 'text-sm'
        }
      case 'medium':
      default:
        return {
          container: 'text-sm',
          time: 'text-lg font-semibold',
          label: 'text-xs'
        }
    }
  }

  // Get display format based on time left
  const getDisplayFormat = () => {
    if (timeLeft <= 0) {
      return {
        display: 'Berakhir',
        parts: null,
        urgencyClass: 'text-gray-500'
      }
    }

    const hari = Math.floor(timeLeft / (24 * 3600))
    const jam = Math.floor((timeLeft % (24 * 3600)) / 3600)
    const menit = Math.floor((timeLeft % 3600) / 60)
    const detik = timeLeft % 60

    const urgencyClass = getTimeUrgencyClass(timeLeft)

    // Format berbeda berdasarkan sisa waktu
    if (hari > 0) {
      return {
        display: `${hari}h ${jam}j ${menit}m`,
        parts: [
          { value: hari, unit: 'hari' },
          { value: jam, unit: 'jam' },
          { value: menit, unit: 'menit' }
        ],
        urgencyClass
      }
    } else if (jam > 0) {
      return {
        display: `${jam}j ${menit}m ${detik}s`,
        parts: [
          { value: jam, unit: 'jam' },
          { value: menit, unit: 'menit' },
          { value: detik, unit: 'detik' }
        ],
        urgencyClass
      }
    } else if (menit > 0) {
      return {
        display: `${menit}m ${detik}s`,
        parts: [
          { value: menit, unit: 'menit' },
          { value: detik, unit: 'detik' }
        ],
        urgencyClass
      }
    } else {
      return {
        display: `${detik}s`,
        parts: [
          { value: detik, unit: 'detik' }
        ],
        urgencyClass: 'text-red-600 animate-pulse'
      }
    }
  }

  const sizeClasses = getSizeClasses()
  const { display, parts, urgencyClass } = getDisplayFormat()

  // Simple format (default)
  const SimpleFormat = () => (
    <div className={`inline-flex items-center space-x-1 ${sizeClasses.container} ${className}`}>
      {showLabel && (
        <span className={`${sizeClasses.label} text-gray-600`}>
          ⏰
        </span>
      )}
      <span className={`${sizeClasses.time} ${urgencyClass}`}>
        {display}
      </span>
    </div>
  )

  // Detailed format with parts
  const DetailedFormat = () => (
    <div className={`inline-flex items-center space-x-2 ${sizeClasses.container} ${className}`}>
      {showLabel && (
        <span className={`${sizeClasses.label} text-gray-600`}>
          ⏰ Sisa:
        </span>
      )}
      <div className="flex items-center space-x-1">
        {parts?.map((part, index) => (
          <React.Fragment key={part.unit}>
            {index > 0 && <span className="text-gray-400">:</span>}
            <div className="text-center">
              <div className={`${sizeClasses.time} ${urgencyClass} leading-none`}>
                {part.value.toString().padStart(2, '0')}
              </div>
              <div className={`${sizeClasses.label} text-gray-500 leading-none`}>
                {part.unit[0]}
              </div>
            </div>
          </React.Fragment>
        )) || (
          <span className={`${sizeClasses.time} ${urgencyClass}`}>
            {display}
          </span>
        )}
      </div>
    </div>
  )

  // Render based on size and preference
  return size === 'large' ? <DetailedFormat /> : <SimpleFormat />
}

// Preset variants untuk kemudahan
export const CountdownTimerSmall = (props) => (
  <CountdownTimer {...props} size="small" />
)

export const CountdownTimerLarge = (props) => (
  <CountdownTimer {...props} size="large" />
)

// Badge variant untuk card
export const CountdownBadge = ({ sisaDetik, onTimeUp, className = '' }) => {
  const urgencyClass = getTimeUrgencyClass(sisaDetik || 0)
  
  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${urgencyClass} bg-white/90 backdrop-blur-sm ${className}`}>
      <CountdownTimer 
        sisaDetik={sisaDetik}
        onTimeUp={onTimeUp}
        size="small"
        showLabel={false}
      />
    </div>
  )
}

// Progress bar variant
export const CountdownProgress = ({ 
  sisaDetik, 
  durasiTotalDetik,
  onTimeUp,
  className = ''
}) => {
  const percentage = durasiTotalDetik > 0 
    ? Math.max(0, Math.min(100, ((sisaDetik || 0) / durasiTotalDetik) * 100))
    : 0

  const getProgressColor = () => {
    if (percentage > 50) return 'bg-green-500'
    if (percentage > 25) return 'bg-yellow-500'
    if (percentage > 10) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <CountdownTimer 
          sisaDetik={sisaDetik}
          onTimeUp={onTimeUp}
          size="small"
          showLabel={true}
        />
        <span className="text-xs text-gray-500">
          {percentage.toFixed(1)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor()}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

export default CountdownTimer