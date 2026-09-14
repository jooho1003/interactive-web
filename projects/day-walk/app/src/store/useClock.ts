import { useEffect, useState } from "react";
import type { DayBounds } from "../schema/index.js";
import { logicalNow, phaseOf } from "../domain/time.js";

function initialNow() {
  const value = new URLSearchParams(window.location.search).get("now");
  const parsed = value ? new Date(value) : null;
  const start = parsed && !Number.isNaN(parsed.valueOf()) ? parsed : new Date();
  const real = Date.now();
  return () => new Date(start.valueOf() + Date.now() - real);
}
const seededNow = typeof window === "undefined" ? () => new Date() : initialNow();

export function useClock(bounds: DayBounds) {
  const [now, setNow] = useState(seededNow);
  useEffect(() => {
    const tick = () => setNow(seededNow());
    const timer = window.setInterval(tick, 30000);
    const visible = () => { if (document.visibilityState === "visible") tick(); };
    document.addEventListener("visibilitychange", visible);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", visible); };
  }, []);
  const logical = logicalNow(now, bounds);
  return { now, ...logical, phase: phaseOf(logical.minute, bounds) };
}
