"use client";

import { ArrowRight, Check, Clock3, HeartHandshake, Shirt, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const registrationUrl = "https://forms.gle/TBYodKPwEr8REew2A";

const shifts = [
  {
    label: "Full-day core",
    time: "8:00 AM-4:30 PM",
    detail: "Lead a station, welcome both shifts, and help keep the day running smoothly.",
  },
  {
    label: "Morning shift",
    time: "8:30 AM-1:00 PM",
    detail: "Help with setup, check-in, and the morning activity stations.",
  },
  {
    label: "Afternoon shift",
    time: "12:30-4:30 PM",
    detail: "Support afternoon stations, then help the team pack down.",
  },
];

export function VolunteerBanner() {
  return (
    <aside className="volunteer-banner" aria-labelledby="volunteer-banner-title">
      <div className="shell volunteer-banner-inner">
        <span className="volunteer-banner-icon" aria-hidden="true"><HeartHandshake /></span>
        <div className="volunteer-banner-copy">
          <p className="volunteer-kicker">Lend a hand on Community Day</p>
          <h2 id="volunteer-banner-title">Volunteer with us.</h2>
          <p>Earn verified service hours, get an event shirt, and enjoy food and drinks during your shift.</p>
        </div>
        <VolunteerDialog />
      </div>
    </aside>
  );
}

function VolunteerDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="volunteer-learn-more">
          Learn more <ArrowRight aria-hidden="true" size={17} />
        </Button>
      </DialogTrigger>
      <DialogContent className="weekend-details-dialog volunteer-dialog">
        <DialogHeader className="weekend-dialog-header volunteer-dialog-header">
          <span className="weekend-dialog-day">Sunday · September 20 · Buchanan YMCA</span>
          <p className="eyebrow teal-text">Join the Community Day crew</p>
          <DialogTitle>Choose the shift that works for you.</DialogTitle>
          <DialogDescription className="weekend-dialog-intro">
            Help welcome families, run hands-on activities, serve refreshments, or capture the day. Volunteers age 15 and up are welcome.
          </DialogDescription>
        </DialogHeader>

        <div className="volunteer-dialog-body">
          <div className="volunteer-shifts" aria-label="Volunteer shift schedule">
            {shifts.map((shift, index) => (
              <article key={shift.label}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{shift.label}</h3>
                  <p className="volunteer-shift-time"><Clock3 aria-hidden="true" />{shift.time}</p>
                  <p>{shift.detail}</p>
                </div>
              </article>
            ))}
          </div>
          <p className="volunteer-handover-note"><strong>12:30 PM handover:</strong> both shifts overlap for 30 minutes so the morning crew can walk the afternoon crew through each station.</p>

          <div className="volunteer-perks" aria-label="Volunteer benefits">
            <span><Check aria-hidden="true" /> Verified service hours</span>
            <span><Shirt aria-hidden="true" /> Event shirt</span>
            <span><Utensils aria-hidden="true" /> Food and drinks</span>
            <span><HeartHandshake aria-hidden="true" /> Recommendation letters for standout volunteers</span>
          </div>
        </div>

        <div className="volunteer-dialog-footer">
          <p><strong>Ready to help?</strong> Use the event registration form and select the volunteer option.</p>
          <Button asChild className="register volunteer-signup">
            <a href={registrationUrl} target="_blank" rel="noreferrer">
              Sign up to volunteer <ArrowRight aria-hidden="true" size={17} />
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
