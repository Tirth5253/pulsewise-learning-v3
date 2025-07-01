"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from "react"

interface SwipeableCardProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  className?: string
}

export interface SwipeableCardRef {
  triggerSwipe: (direction: "left" | "right" | "up" | "down") => void
}

const SwipeableCard = forwardRef<SwipeableCardRef, SwipeableCardProps>(
  ({ children, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, className = "" }, ref) => {
    const cardRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [startPos, setStartPos] = useState({ x: 0, y: 0 })
    const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 })
    const [velocity, setVelocity] = useState({ x: 0, y: 0 })
    const [isAnimatingOut, setIsAnimatingOut] = useState(false)
    const lastMoveTime = useRef(Date.now())

    const SWIPE_THRESHOLD = 100
    const VELOCITY_THRESHOLD = 0.5

    const updateCardPosition = useCallback(
      (x: number, y: number) => {
        if (cardRef.current && !isAnimatingOut) {
          const rotation = x * 0.06 // Reduced for smoother feel
          const opacity = Math.max(0.7, 1 - Math.abs(x) / 500) // Smoother opacity curve
          cardRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`
          cardRef.current.style.opacity = `${opacity}`
        }
      },
      [isAnimatingOut],
    )

    const resetCard = useCallback(() => {
      if (cardRef.current && !isAnimatingOut) {
        cardRef.current.style.transition = "transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.2s ease-out"
        cardRef.current.style.transform = "translate3d(0px, 0px, 0) rotate(0deg)"
        cardRef.current.style.opacity = "1"

        setTimeout(() => {
          if (cardRef.current) {
            cardRef.current.style.transition = ""
          }
        }, 200)
      }
    }, [isAnimatingOut])

    const removeCard = useCallback(
      (direction: "left" | "right" | "up" | "down") => {
        if (cardRef.current && !isAnimatingOut) {
          setIsAnimatingOut(true)

          const multiplier = 500
          let x = 0,
            y = 0

          switch (direction) {
            case "left":
              x = -multiplier
              break
            case "right":
              x = multiplier
              break
            case "up":
              y = -multiplier
              break
            case "down":
              y = multiplier
              break
          }

          // Ultra smooth exit animation
          cardRef.current.style.transition = "transform 0.35s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.35s ease-out"
          cardRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${x * 0.06}deg)`
          cardRef.current.style.opacity = "0"

          // Perfectly timed callback for seamless card appearance
          setTimeout(() => {
            // Call the appropriate callback
            switch (direction) {
              case "left":
                onSwipeLeft?.()
                break
              case "right":
                onSwipeRight?.()
                break
              case "up":
                onSwipeUp?.()
                break
              case "down":
                onSwipeDown?.()
                break
            }

            // Instant reset for next card
            setTimeout(() => {
              if (cardRef.current) {
                cardRef.current.style.transform = "translate3d(0px, 0px, 0) rotate(0deg)"
                cardRef.current.style.opacity = "1"
                cardRef.current.style.transition = ""
              }
              setIsAnimatingOut(false)
            }, 15) // Slightly longer for perfect timing
          }, 350) // Match the transition duration
        }
      },
      [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, isAnimatingOut],
    )

    // Expose triggerSwipe method via ref
    useImperativeHandle(ref, () => ({
      triggerSwipe: removeCard,
    }))

    const handleStart = useCallback(
      (clientX: number, clientY: number) => {
        if (isAnimatingOut) return

        setIsDragging(true)
        setStartPos({ x: clientX, y: clientY })
        setCurrentPos({ x: 0, y: 0 })
        lastMoveTime.current = Date.now()

        if (cardRef.current) {
          cardRef.current.style.transition = ""
        }
      },
      [isAnimatingOut],
    )

    const handleMove = useCallback(
      (clientX: number, clientY: number) => {
        if (!isDragging || isAnimatingOut) return

        const now = Date.now()
        const deltaTime = now - lastMoveTime.current

        if (deltaTime > 0) {
          const newX = clientX - startPos.x
          const newY = clientY - startPos.y

          const velocityX = (newX - currentPos.x) / deltaTime
          const velocityY = (newY - currentPos.y) / deltaTime

          setVelocity({ x: velocityX, y: velocityY })
          setCurrentPos({ x: newX, y: newY })

          updateCardPosition(newX, newY)
          lastMoveTime.current = now
        }
      },
      [isDragging, startPos, currentPos, updateCardPosition, isAnimatingOut],
    )

    const handleEnd = useCallback(() => {
      if (!isDragging || isAnimatingOut) return

      setIsDragging(false)

      const absX = Math.abs(currentPos.x)
      const absY = Math.abs(currentPos.y)
      const absVelX = Math.abs(velocity.x)
      const absVelY = Math.abs(velocity.y)

      // Check if swipe threshold or velocity threshold is met
      if (absX > SWIPE_THRESHOLD || absVelX > VELOCITY_THRESHOLD) {
        if (currentPos.x > 0) {
          removeCard("right")
        } else {
          removeCard("left")
        }
      } else if (absY > SWIPE_THRESHOLD || absVelY > VELOCITY_THRESHOLD) {
        if (currentPos.y > 0) {
          removeCard("down")
        } else {
          removeCard("up")
        }
      } else {
        resetCard()
      }
    }, [isDragging, currentPos, velocity, removeCard, resetCard, isAnimatingOut])

    // Mouse events
    const handleMouseDown = useCallback(
      (e: React.MouseEvent) => {
        if (isAnimatingOut) return
        e.preventDefault()
        handleStart(e.clientX, e.clientY)
      },
      [handleStart, isAnimatingOut],
    )

    const handleMouseMove = useCallback(
      (e: MouseEvent) => {
        e.preventDefault()
        handleMove(e.clientX, e.clientY)
      },
      [handleMove],
    )

    const handleMouseUp = useCallback(
      (e: MouseEvent) => {
        e.preventDefault()
        handleEnd()
      },
      [handleEnd],
    )

    // Touch events
    const handleTouchStart = useCallback(
      (e: React.TouchEvent) => {
        if (isAnimatingOut) return
        const touch = e.touches[0]
        handleStart(touch.clientX, touch.clientY)
      },
      [handleStart, isAnimatingOut],
    )

    const handleTouchMove = useCallback(
      (e: TouchEvent) => {
        e.preventDefault()
        const touch = e.touches[0]
        handleMove(touch.clientX, touch.clientY)
      },
      [handleMove],
    )

    const handleTouchEnd = useCallback(
      (e: TouchEvent) => {
        e.preventDefault()
        handleEnd()
      },
      [handleEnd],
    )

    useEffect(() => {
      if (isDragging && !isAnimatingOut) {
        document.addEventListener("mousemove", handleMouseMove, { passive: false })
        document.addEventListener("mouseup", handleMouseUp, { passive: false })
        document.addEventListener("touchmove", handleTouchMove, { passive: false })
        document.addEventListener("touchend", handleTouchEnd, { passive: false })
      }

      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        document.removeEventListener("touchmove", handleTouchMove)
        document.removeEventListener("touchend", handleTouchEnd)
      }
    }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd, isAnimatingOut])

    return (
      <div
        ref={cardRef}
        className={`cursor-grab active:cursor-grabbing select-none ${className}`}
        style={{
          willChange: "transform, opacity",
          touchAction: "none",
          backfaceVisibility: "hidden",
          perspective: "1000px",
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {children}
      </div>
    )
  },
)

SwipeableCard.displayName = "SwipeableCard"

export default SwipeableCard
