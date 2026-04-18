import { useLayoutEffect, useRef, useState } from "react";

const MAX_MARQUEE_COPIES = 24;

/**
 * מגדיל את מספר העותקים של מסלול מרקיי עד שהרוחב הכולל ≥ ~פעמיים מרוחב ה-viewport,
 * כדי שלא יופיע שטח ריק ליד הכרטיסים. למרקיי CSS עם translate(-50%) חייב מספר עותקים זוגי.
 */
export function useMarqueeLoopCopies(itemCount: number, forceEven: boolean) {
  const clipRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [copies, setCopies] = useState(2);

  useLayoutEffect(() => {
    setCopies(2);
  }, [itemCount]);

  useLayoutEffect(() => {
    if (itemCount === 0) return;
    const clip = clipRef.current;
    const track = trackRef.current;
    if (!clip || !track) return;
    const cw = clip.clientWidth;
    const sw = track.scrollWidth;
    if (cw < 8 || sw < 8) return;
    const per = sw / copies;
    if (per < 1) return;
    const targetScroll = Math.max(2 * cw + 48, cw + 100);
    if (sw < targetScroll) {
      let needed = Math.min(MAX_MARQUEE_COPIES, Math.max(2, Math.ceil(targetScroll / per)));
      if (forceEven && needed % 2 !== 0) needed += 1;
      if (needed > copies) setCopies(needed);
    }
  }, [itemCount, copies, forceEven]);

  return { clipRef, trackRef, copies };
}
