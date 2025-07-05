"use client";

import React, {
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  className?: string;
  onDrag?: (direction: "left" | "right") => void;
}

export interface SwipeableCardRef {
  triggerSwipe: (direction: "left" | "right" | "up" | "down") => void;
}

const SWIPE_THRESHOLD = 80;

const SwipeableCard = forwardRef<SwipeableCardRef, SwipeableCardProps>(
  (
    {
      children,
      onSwipeLeft,
      onSwipeRight,
      onSwipeUp,
      onSwipeDown,
      className = "",
      onDrag,
    },
    ref
  ) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const pointerStart = useRef({ x: 0, y: 0 });
    const [isAnimating, setIsAnimating] = useState(false);

    // Drag start
    const handlePointerDown = (e: React.PointerEvent) => {
      if (isAnimating) return;
      cardRef.current?.setPointerCapture(e.pointerId);
      pointerStart.current = { x: e.clientX, y: e.clientY };
      if (cardRef.current) {
        cardRef.current.style.transition = "none";
      }
    };

    // Drag move
    const handlePointerMove = (e: React.PointerEvent) => {
      if (isAnimating || e.pressure === 0) return;
      const dx = e.clientX - pointerStart.current.x;
      const dy = e.clientY - pointerStart.current.y;
      if (cardRef.current) {
        const rotation = dx * 0.08;
        cardRef.current.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(${rotation}deg) scale(1.02)`;
        cardRef.current.style.opacity = `${Math.max(
          0.7,
          1 - Math.abs(dx) / 400
        )}`;
      }
      // Optionally, call onDrag for direction feedback (unchanged logic)
      if (onDrag && Math.abs(dx) > Math.abs(dy)) {
        onDrag(dx > 0 ? "right" : "left");
      }
    };

    // Drag end
    const handlePointerUp = (e: React.PointerEvent) => {
      if (isAnimating) return;
      cardRef.current?.releasePointerCapture(e.pointerId);
      const dx = e.clientX - pointerStart.current.x;
      const dy = e.clientY - pointerStart.current.y;
      let swiped = false;
      let direction: "left" | "right" | "up" | "down" | null = null;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
        direction = dx > 0 ? "right" : "left";
        swiped = true;
      } else if (Math.abs(dy) > SWIPE_THRESHOLD) {
        direction = dy > 0 ? "down" : "up";
        swiped = true;
      }
      if (swiped && direction) {
        setIsAnimating(true);
        let x = 0,
          y = 0,
          rotation = 0;
        const multiplier = 400;
        switch (direction) {
          case "left":
            x = -multiplier;
            rotation = -15;
            break;
          case "right":
            x = multiplier;
            rotation = 15;
            break;
          case "up":
            y = -multiplier;
            break;
          case "down":
            y = multiplier;
            break;
        }
        if (cardRef.current) {
          cardRef.current.style.transition =
            "transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.4s";
          cardRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg) scale(0.95)`;
          cardRef.current.style.opacity = "0";
        }
        setTimeout(() => {
          setIsAnimating(false);
          if (cardRef.current) {
            cardRef.current.style.transition = "none";
            cardRef.current.style.transform =
              "translate3d(0px, 0px, 0) rotate(0deg) scale(1)";
            cardRef.current.style.opacity = "1";
          }
          switch (direction) {
            case "left":
              onSwipeLeft?.();
              break;
            case "right":
              onSwipeRight?.();
              break;
            case "up":
              onSwipeUp?.();
              break;
            case "down":
              onSwipeDown?.();
              break;
          }
        }, 400);
      } else {
        // Snap back
        if (cardRef.current) {
          cardRef.current.style.transition =
            "transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.3s";
          cardRef.current.style.transform =
            "translate3d(0px, 0px, 0) rotate(0deg) scale(1)";
          cardRef.current.style.opacity = "1";
        }
      }
    };

    // Expose triggerSwipe to parent
    useImperativeHandle(ref, () => ({
      triggerSwipe: (direction) => {
        if (isAnimating) return;
        setIsAnimating(true);
        let x = 0,
          y = 0,
          rotation = 0;
        const multiplier = 400;
        switch (direction) {
          case "left":
            x = -multiplier;
            rotation = -15;
            break;
          case "right":
            x = multiplier;
            rotation = 15;
            break;
          case "up":
            y = -multiplier;
            break;
          case "down":
            y = multiplier;
            break;
        }
        if (cardRef.current) {
          cardRef.current.style.transition =
            "transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.4s";
          cardRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg) scale(0.95)`;
          cardRef.current.style.opacity = "0";
        }
        setTimeout(() => {
          setIsAnimating(false);
          if (cardRef.current) {
            cardRef.current.style.transition = "none";
            cardRef.current.style.transform =
              "translate3d(0px, 0px, 0) rotate(0deg) scale(1)";
            cardRef.current.style.opacity = "1";
          }
          switch (direction) {
            case "left":
              onSwipeLeft?.();
              break;
            case "right":
              onSwipeRight?.();
              break;
            case "up":
              onSwipeUp?.();
              break;
            case "down":
              onSwipeDown?.();
              break;
          }
        }, 400);
      },
    }));

    return (
      <div
        ref={cardRef}
        className={`relative select-none ${className}`}
        style={{
          touchAction: "none",
          willChange: "transform",
          backfaceVisibility: "hidden",
          perspective: "1000px",
          transformStyle: "preserve-3d",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {children}
      </div>
    );
  }
);

SwipeableCard.displayName = "SwipeableCard";

export default SwipeableCard;
