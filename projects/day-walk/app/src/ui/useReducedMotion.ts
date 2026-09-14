import { useEffect, useState } from "react";

export function useReducedMotion(setting: "system" | "reduce" | "full") {
  const [systemReduced, setSystemReduced] = useState(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSystemReduced(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return setting === "reduce" || (setting === "system" && systemReduced);
}
