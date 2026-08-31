"use client";

import { ArrowRight, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const stops = [
  ["Fort Mason / Marina Green", "9:45–10:45 AM", "Quiet first stop"],
  ["Pier 39 / Fisherman’s Wharf", "11:00 AM–12:30 PM", "Biggest stop"],
  ["Union Square", "2:00–3:30 PM", "Transit-friendly"],
  ["Oracle Park / South Beach", "3:45–4:30 PM", "Waterfront stop"],
  ["City Hall · Finish", "~6:45 PM", "Public finish + group photo"],
];

type WeekendDay = "one" | "two" | "three";

const dayDetails = {
  one: {
    number: "01",
    eyebrow: "Saturday · Buchanan YMCA",
    title: "Corpus Callosum 5K",
    intro:
      "Not a race—just one group moving together. The flat, marshaled 3.1-mile course represents the fibers connecting the brain’s two halves.",
    tone: "coral",
  },
  two: {
    number: "02",
    eyebrow: "Sunday · Drop in anytime",
    title: "A community day for curious minds",
    intro:
      "For the entire family! Stay for twenty minutes or the afternoon—anytime from 11 AM to 3 PM.",
    tone: "teal",
  },
  three: {
    number: "03",
    eyebrow: "Monday · World Alzheimer’s Day",
    title: "Meet the ride across the city",
    intro:
      "Two organizers trace the full brain route on e-bikes. Follow remotely or meet the team at a landmark stop.",
    tone: "purple",
  },
} as const;

function DayContent({ day }: { day: WeekendDay }) {
  if (day === "one") {
    return (
      <div className="timeline">
        <span><b>7:30</b>Check-in opens</span>
        <span><b>8:00</b>Briefing</span>
        <span><b>8:10</b>Group photo</span>
        <span><b>8:15</b>Roll out</span>
        <span><b>~9:00</b>Finish + cold brew</span>
      </div>
    );
  }

  if (day === "two") {
    return (
      <div className="station-grid">
        <div><span>01</span><h3>The Empathy Café</h3><p>Try tremor gloves and vision-distorting goggles while seated with a spotter.</p></div>
        <div><span>02</span><h3>The Memory Wall</h3><p>Honor someone you love who has been affected.</p></div>
        <div><span>03</span><h3>Build-a-Brain</h3><p>Kids create a model and learn what each region does.</p></div>
        <div><span>04</span><h3>Move Your Mind</h3><p>Light games connect movement with long-term brain health.</p></div>
      </div>
    );
  }

  return (
    <>
      <div className="stop-list">
        {stops.map((stop, index) => (
          <div key={stop[0]}>
            <b>{String(index + 1).padStart(2, "0")}</b>
            <span><strong>{stop[0]}</strong><small>{stop[2]}</small></span>
            <time>{stop[1]}</time>
          </div>
        ))}
      </div>
      <p className="notice">Times are approximate and may drift. Follow the live social feed for the latest ride updates.</p>
    </>
  );
}

export function WeekendDetailsDialog({ day }: { day: WeekendDay }) {
  const details = dayDetails[day];
  const scheduleStatusId = `schedule-${day}-status`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="day-details-trigger"
          type="button"
          style={{
            width: "100%",
            marginTop: "auto",
            padding: 0,
            border: 0,
            background: "transparent",
            color: "var(--purple)",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: "7px",
            fontSize: "13px",
            fontWeight: 900,
            lineHeight: 1.2,
            textAlign: "left",
            cursor: "pointer",
          }}
        >
          See the details <ArrowRight aria-hidden="true" size={16} />
        </button>
      </DialogTrigger>
      <DialogContent
        className={`donation-dialog weekend-details-dialog ${details.tone}`}
        style={{
          width: "min(820px, calc(100vw - 32px))",
          maxWidth: "820px",
          maxHeight: "calc(100dvh - 32px)",
          overflowY: "auto",
          backgroundColor: "#fffdf9",
        }}
      >
        <DialogHeader className="weekend-dialog-header">
          <span className="weekend-dialog-day">Day {details.number}</span>
          <p className={`eyebrow ${details.tone}-text`}>{details.eyebrow}</p>
          <DialogTitle>{details.title}</DialogTitle>
          <DialogDescription className="weekend-dialog-intro">
            {details.intro}
          </DialogDescription>
        </DialogHeader>
        <div className="weekend-dialog-body">
          <DayContent day={day} />
        </div>
        <div className="schedule-coming-soon">
          <button type="button" disabled aria-describedby={scheduleStatusId}>
            <FileText aria-hidden="true" /> Find the full schedule
          </button>
          <p id={scheduleStatusId}>Coming soon — a Google Doc will be linked here.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
