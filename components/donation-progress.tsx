"use client";

import { useEffect, useState } from "react";
import { DONATION_PROGRESS_REFRESH } from "@/components/matched-gift-form";

type CharityProgress = { total: number; goal: number };
type Progress = {
  charities: { alzheimers: CharityProgress; michaelJFox: CharityProgress } | null;
  status: string;
  updatedAt: string | null;
};
const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: Number.isInteger(value) ? 0 : 2 }).format(value);
const shortMoney = (value: number) => value >= 1000 ? `$${Number((value / 1000).toFixed(1))}k` : money(value);
const GOAL = 2500;
// Ease-out fill: early gifts move the bar further, and it slows as it nears the
// goal. The percentage label always shows the real figure.
const fillWidth = (total: number, goal: number) => Math.min(1, Math.max(0, total / goal)) ** 0.7 * 100;
const percent = (total: number, goal: number) => {
  const value = total / goal * 100;
  return value > 0 && value < 1 ? "<1%" : `${Math.floor(value)}%`;
};
const BARS = [
  { key: "alzheimers", name: "Alzheimer’s Association", className: "alzheimers" },
  { key: "michaelJFox", name: "Michael J. Fox Foundation", className: "michael-j-fox" },
] as const;

export function DonationProgress() {
  const [progress, setProgress] = useState<Progress | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const refresh = async () => {
      try {
        const response = await fetch("/api/donation-progress", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Unavailable");
        const data: Progress = await response.json();
        setProgress(previous => data.charities === null && previous?.charities ? { ...previous, status: "stale" } : data);
      } catch {
        if (!controller.signal.aborted) setProgress(previous => previous ? { ...previous, status: "stale" } : { charities: null, status: "unavailable", updatedAt: null });
      }
    };
    void refresh();
    const interval = window.setInterval(refresh, 300000);
    window.addEventListener(DONATION_PROGRESS_REFRESH, refresh);
    return () => { controller.abort(); window.clearInterval(interval); window.removeEventListener(DONATION_PROGRESS_REFRESH, refresh); };
  }, []);
  return <div className="donation-progress shell" aria-label="Community fundraising progress">
    {BARS.map(bar => {
      const charity = progress?.charities?.[bar.key];
      const total = charity?.total;
      const goal = charity?.goal ?? GOAL;
      const percentage = total == null ? 0 : fillWidth(total, goal);
      return <div className={`donation-progress-track ${bar.className}`} key={bar.key}>
        <div className="donation-progress-fill" style={{ width: `${percentage}%` }} role={total != null ? "progressbar" : undefined} aria-label={`Funds raised for the ${bar.name} toward a ${money(goal)} goal`} aria-valuenow={total != null ? Math.min(total, goal) : undefined} aria-valuemin={0} aria-valuemax={goal} aria-valuetext={total != null ? `${money(total)} raised of ${money(goal)} (${percent(total, goal)})` : undefined}/>
        <div className="donation-progress-heading" aria-live="polite">
          <span>{total != null ? <><strong>{money(total)}</strong> {bar.name}</> : progress ? `${bar.name} total temporarily unavailable` : "Loading fundraising progress…"}</span>
          <span className="donation-progress-goal">{total != null && <><strong>{percent(total, goal)}</strong> of </>}<strong>{shortMoney(goal)}</strong> goal</span>
        </div>
      </div>;
    })}
    {progress?.status === "stale" && <p>Showing the last available totals.</p>}
  </div>;
}
