import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'al-col-widths';

const DEFAULT_LEFT = 220;
const DEFAULT_RIGHT = 340;
const MIN_LEFT = 140;
const MAX_LEFT = 380;
const MIN_RIGHT = 280;
const MAX_RIGHT = 480;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function loadWidths(): { left: number; right: number } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (typeof parsed.left === 'number' && typeof parsed.right === 'number') {
        return {
          left: clamp(parsed.left, MIN_LEFT, MAX_LEFT),
          right: clamp(parsed.right, MIN_RIGHT, MAX_RIGHT),
        };
      }
    }
  } catch {
    // ignore
  }
  return { left: DEFAULT_LEFT, right: DEFAULT_RIGHT };
}

function saveWidths(left: number, right: number) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ left, right }));
  } catch {
    // ignore
  }
}

export function useResizableColumns() {
  const initial = loadWidths();
  const [leftWidth, setLeftWidth] = useState(initial.left);
  const [rightWidth, setRightWidth] = useState(initial.right);

  // Use refs for drag state to avoid closure stale values during mousemove
  const draggingRef = useRef<'left' | 'right' | null>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  // RAF handle for smooth visual updates during drag
  const rafRef = useRef<number | null>(null);
  const pendingLeftRef = useRef(leftWidth);
  const pendingRightRef = useRef(rightWidth);

  const commitUpdate = useCallback(() => {
    setLeftWidth(pendingLeftRef.current);
    setRightWidth(pendingRightRef.current);
    rafRef.current = null;
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggingRef.current) return;
    const delta = e.clientX - startXRef.current;

    if (draggingRef.current === 'left') {
      pendingLeftRef.current = clamp(startWidthRef.current + delta, MIN_LEFT, MAX_LEFT);
    } else {
      // Right handle: dragging right → makes right column narrower
      pendingRightRef.current = clamp(startWidthRef.current - delta, MIN_RIGHT, MAX_RIGHT);
    }

    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(commitUpdate);
    }
  }, [commitUpdate]);

  const handleMouseUp = useCallback(() => {
    if (!draggingRef.current) return;
    saveWidths(pendingLeftRef.current, pendingRightRef.current);
    draggingRef.current = null;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const startLeftDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = 'left';
    startXRef.current = e.clientX;
    startWidthRef.current = leftWidth;
    pendingLeftRef.current = leftWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [leftWidth, handleMouseMove, handleMouseUp]);

  const startRightDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = 'right';
    startXRef.current = e.clientX;
    startWidthRef.current = rightWidth;
    pendingRightRef.current = rightWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [rightWidth, handleMouseMove, handleMouseUp]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return { leftWidth, rightWidth, startLeftDrag, startRightDrag };
}
