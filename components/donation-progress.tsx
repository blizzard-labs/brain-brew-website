"use client";

import { useEffect, useState } from "react";

type Progress = { total: number | null; goal: number; status: string; updatedAt: string | null };
const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: Number.isInteger(value) ? 0 : 2 }).format(value);

export function DonationProgress() {
  const [progress, setProgress] = useState<Progress | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const refresh = async () => {
      try {
        const response = await fetch("/api/donation-progress", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Unavailable");
        const data: Progress = await response.json();
        setProgress(previous => data.total === null && previous?.total != null ? { ...previous, status: "stale" } : data);
      } catch {
        if (!controller.signal.aborted) setProgress(previous => previous ? { ...previous, status: "stale" } : { total: null, goal: 3000, status: "unavailable", updatedAt: null });
      }
    };
    void refresh();
    const interval = window.setInterval(refresh, 300000);
    return () => { controller.abort(); window.clearInterval(interval); };
  }, []);
  const total = progress?.total;
  const goal = progress?.goal ?? 3000;
  const percentage = total == null ? 0 : Math.min(100, total / goal * 100);
  return <div className="donation-progress shell" aria-label="Community fundraising progress">
    <div className="donation-progress-track">
      <div className="donation-progress-fill" style={{ width: `${percentage}%` }} role={total != null ? "progressbar" : undefined} aria-label={`Funds raised toward our ${money(goal)} goal`} aria-valuenow={total != null ? Math.min(total, goal) : undefined} aria-valuemin={0} aria-valuemax={goal} aria-valuetext={total != null ? `${money(total)} raised of ${money(goal)}` : undefined}/>
      <div className="donation-progress-heading" aria-live="polite">
      <span>{total != null ? <strong>{money(total)}</strong> : progress ? "Fundraising total temporarily unavailable" : "Loading fundraising progress…"}</span>
      <span className="donation-progress-goal"><strong>{money(goal)}</strong> goal</span>
      </div>
    </div>
    {progress?.status === "stale" && <p>Showing the last available total.</p>}
  </div>;
}
