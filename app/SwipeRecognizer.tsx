import React, { useRef, useEffect, startTransition } from "react";

// Example of a Component that can recognize swipe gestures using a ScrollTimeline
// without scrolling its own content. Allowing it to be used as an inert gesture
// recognizer to drive a View Transition.

// Add type declarations for ScrollTimeline (if using a polyfill, you may need to import it)
declare const ScrollTimeline: {
  new (options: { source: Element | null; axis: string }): ScrollTimeline;
};

// Add props interface
interface SwipeRecognizerProps {
  action: () => void;
  children: React.ReactNode;
  direction?: "left" | "right" | "up" | "down";
  gesture: (
    timeline: ScrollTimeline,
    options: { range: number[] }
  ) => () => void;
}

export default function SwipeRecognizer({
  action,
  children,
  direction = "left", // Default value instead of null check
  gesture,
}: SwipeRecognizerProps) {
  const axis = direction === "left" || direction === "right" ? "x" : "y";
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeGesture = useRef<(() => void) | null>(null);

  function onScroll() {
    if (activeGesture.current !== null) {
      return;
    }
    if (typeof ScrollTimeline !== "function") {
      return;
    }
    const scrollTimeline = new ScrollTimeline({
      source: scrollRef.current,
      axis: axis,
    });
    activeGesture.current = gesture(scrollTimeline, {
      range: [0, direction === "left" || direction === "up" ? 100 : 0, 100],
    });
  }

  function onScrollEnd() {
    if (activeGesture.current !== null) {
      const cancelGesture = activeGesture.current;
      activeGesture.current = null;
      cancelGesture?.();
    }

    const scrollElement = scrollRef.current;
    if (!scrollElement) {
      throw new Error("Scroll element not found");
    }

    const halfway =
      axis === "x"
        ? (scrollElement.scrollWidth - scrollElement.clientWidth) / 2
        : (scrollElement.scrollHeight - scrollElement.clientHeight) / 2;

    const currentPosition =
      axis === "x" ? scrollElement.scrollLeft : scrollElement.scrollTop;

    const changed =
      direction === "left" || direction === "up"
        ? (currentPosition ?? 0) < halfway
        : (currentPosition ?? 0) > halfway;

    if (changed) {
      startTransition(action);
    }
  }

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) {
      throw new Error("Scroll element not found");
    }
    switch (direction) {
      case "left":
        scrollElement.scrollLeft =
          scrollElement.scrollWidth - scrollElement.clientWidth;
        break;
      case "right":
        scrollElement.scrollLeft = 0;
        break;
      case "up":
        scrollElement.scrollTop =
          scrollElement.scrollHeight - scrollElement.clientHeight;
        break;
      case "down":
        scrollElement.scrollTop = 0;
        break;
      default:
        break;
    }
  }, [direction]);

  // Update style types to use CSSProperties and remove null values
  const scrollStyle: React.CSSProperties = {
    position: "relative",
    padding: "0px",
    margin: "0px",
    border: "0px",
    width: axis === "x" ? "100%" : undefined,
    height: axis === "y" ? "100%" : undefined,
    overflow: "scroll hidden",
    touchAction: `pan-${direction}`,
    // Disable overscroll on Safari which moves the sticky content.
    // Unfortunately, this also means that we disable chaining. We should only disable
    // it if the parent is not scrollable in this axis.
    overscrollBehaviorX: axis === "x" ? "none" : "auto",
    overscrollBehaviorY: axis === "y" ? "none" : "auto",
    scrollSnapType: `${axis} mandatory`,
    scrollbarWidth: "none",
  };

  // Update all style objects similarly with proper CSSProperties types
  const overScrollStyle: React.CSSProperties = {
    position: "relative",
    padding: "0px",
    margin: "0px",
    border: "0px",
    width: axis === "x" ? "200%" : undefined,
    height: axis === "y" ? "200%" : undefined,
  };

  const snapStartStyle: React.CSSProperties = {
    position: "absolute",
    padding: "0px",
    margin: "0px",
    border: "0px",
    width: axis === "x" ? "50%" : "100%",
    height: axis === "y" ? "50%" : "100%",
    left: "0px",
    top: "0px",
    scrollSnapAlign: "center",
  };

  const snapEndStyle: React.CSSProperties = {
    position: "absolute",
    padding: "0px",
    margin: "0px",
    border: "0px",
    width: axis === "x" ? "50%" : "100%",
    height: axis === "y" ? "50%" : "100%",
    right: "0px",
    bottom: "0px",
    scrollSnapAlign: "center",
  };

  // By placing the content in a sticky box we ensure that it doesn't move when
  // we scroll. Unless done so by the View Transition.
  const stickyStyle: React.CSSProperties = {
    position: "sticky",
    padding: "0px",
    margin: "0px",
    border: "0px",
    left: "0px",
    top: "0px",
    width: axis === "x" ? "50%" : undefined,
    height: axis === "y" ? "50%" : undefined,
    overflow: "hidden",
  };

  return (
    <div
      style={scrollStyle}
      onScroll={onScroll}
      // @ts-expect-error onScrollEnd is polyfilled by React
      onScrollEnd={onScrollEnd}
      ref={scrollRef}
    >
      <div style={overScrollStyle}>
        <div style={snapStartStyle} />
        <div style={snapEndStyle} />
        <div style={stickyStyle}>{children}</div>
      </div>
    </div>
  );
}
