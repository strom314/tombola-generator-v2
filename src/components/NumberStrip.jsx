import { useEffect, useRef, useState } from 'react'
import './NumberStrip.css'

const TOTAL_NUMBERS_BEFORE = 60
const TOTAL_NUMBERS_AFTER = 24
const wrapNumber = (value) => ((value - 1 + 100) % 100) + 1

function NumberStrip({ targetNumber, duration = 2400, onComplete }) {
  const containerRef = useRef(null)
  const trackRef = useRef(null)
  const completionRef = useRef(null)
  const [numbers, setNumbers] = useState([])
  const [targetIndex, setTargetIndex] = useState(null)

  useEffect(() => {
    if (!targetNumber) {
      setNumbers([])
      setTargetIndex(null)
      return
    }

    const nextNumbers = []

    for (let i = TOTAL_NUMBERS_BEFORE; i > 0; i -= 1) {
      nextNumbers.push(wrapNumber(targetNumber - i))
    }

    nextNumbers.push(targetNumber)

    for (let i = 1; i <= TOTAL_NUMBERS_AFTER; i += 1) {
      nextNumbers.push(wrapNumber(targetNumber + i))
    }

    setNumbers(nextNumbers)
    setTargetIndex(TOTAL_NUMBERS_BEFORE)
  }, [targetNumber])

  useEffect(() => {
    if (!targetNumber || numbers.length === 0 || targetIndex === null) {
      return undefined
    }

    const container = containerRef.current
    const track = trackRef.current

    if (!container || !track || !track.children.length) {
      return undefined
    }

    const firstItem = track.children[0]
    const itemWidth = firstItem.offsetWidth
    const computedStyle = window.getComputedStyle(track)
    const gap = parseFloat(computedStyle.columnGap || computedStyle.gap || '0')
    const totalItemWidth = itemWidth + gap
    const centerOffset = container.offsetWidth / 2 - itemWidth / 2
    const endOffset = -(targetIndex * totalItemWidth) + centerOffset
    const extraCycles = 18 + Math.floor(Math.random() * 12)
    const startOffset = endOffset + totalItemWidth * extraCycles

    track.style.transition = 'none'
    track.style.transform = `translateX(${startOffset}px)`
    track.getBoundingClientRect()

    const animationFrame = requestAnimationFrame(() => {
      track.style.transition = `transform ${duration}ms cubic-bezier(0.19, 1, 0.22, 1)`
      track.style.transform = `translateX(${endOffset}px)`
    })

    if (completionRef.current) {
      clearTimeout(completionRef.current)
    }

    completionRef.current = setTimeout(() => {
      if (onComplete) {
        onComplete()
      }
    }, duration + 120)

    return () => {
      cancelAnimationFrame(animationFrame)
      if (completionRef.current) {
        clearTimeout(completionRef.current)
        completionRef.current = null
      }
    }
  }, [numbers, targetIndex, targetNumber, duration, onComplete])

  if (!targetNumber || numbers.length === 0) {
    return null
  }

  return (
    <div className="number-strip" ref={containerRef}>
      <div className="number-strip-track" ref={trackRef}>
        {numbers.map((num, index) => (
          <div
            key={`${num}-${index}`}
            className={`number-strip-item ${index === targetIndex ? 'active' : ''}`}
          >
            {String(num).padStart(2, '0')}
          </div>
        ))}
      </div>
    </div>
  )
}

export default NumberStrip
