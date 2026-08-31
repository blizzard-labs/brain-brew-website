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

const volunteerStyles = `
  .volunteer-banner{position:relative;z-index:4;isolation:isolate;overflow:hidden;background:linear-gradient(110deg,var(--deep),#32164e);color:#fff}
  .volunteer-banner:after{content:"";position:absolute;right:-75px;top:-115px;width:310px;height:310px;border:55px solid #ffffff0b;border-radius:50%;pointer-events:none}
  .volunteer-banner-inner{position:relative;z-index:1;min-height:164px;display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:25px}
  .volunteer-banner-icon{width:56px;height:56px;display:grid;place-items:center;border:1px solid #ffffff35;border-radius:50%;background:#ffffff10;color:#8ad9c6;flex:none}
  .volunteer-banner-icon svg{width:27px;height:27px}
  .volunteer-banner-copy{display:grid;grid-template-columns:auto 1fr;align-items:baseline;column-gap:22px;row-gap:7px}
  .volunteer-banner-copy h2{font-family:Georgia,serif;font-size:31px;line-height:1.1;letter-spacing:-.025em;margin:0;white-space:nowrap}
  .volunteer-banner-copy>p:last-child{grid-column:1/-1;color:#d5cbd9;font-size:14px;line-height:1.55;margin:0;max-width:720px}
  .volunteer-kicker{color:#8ad9c6;font-size:10px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;margin:0}
  .volunteer-learn-more{height:44px!important;padding-inline:20px!important;border:1px solid #ffffff4d!important;border-radius:3px!important;background:#fff!important;color:var(--deep)!important;font-weight:900!important;box-shadow:none!important}
  .volunteer-learn-more:hover{background:#f1eaf2!important}
  .volunteer-dialog{border-top:6px solid var(--teal)!important}
  .volunteer-dialog-header .eyebrow{margin:9px 0 0}
  .volunteer-dialog-body{padding:28px 48px 30px}
  .volunteer-shifts{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
  .volunteer-shifts article{display:flex;gap:13px;padding:19px 17px;background:var(--cream);border-top:3px solid var(--teal)}
  .volunteer-shifts article>span{color:#a89cab;font-size:10px;font-weight:900;letter-spacing:.08em;padding-top:3px}
  .volunteer-shifts h3{font-family:Georgia,serif;color:var(--deep);font-size:18px;line-height:1.15;margin:0 0 9px}
  .volunteer-shifts p{color:var(--muted);font-size:12px;line-height:1.5;margin:8px 0 0}
  .volunteer-shifts .volunteer-shift-time{display:flex;align-items:center;gap:6px;color:var(--ink);font-size:12px;font-weight:900;margin:0}
  .volunteer-shift-time svg{width:14px;height:14px;color:var(--teal)}
  .volunteer-handover-note{margin:17px 0 0;padding:12px 15px;background:#eaf5f1;color:#4f5a56;font-size:12px;line-height:1.55}
  .volunteer-perks{display:grid;grid-template-columns:1fr 1fr;gap:11px 22px;margin-top:22px}
  .volunteer-perks span{display:flex;align-items:center;gap:9px;color:#514b57;font-size:12px;font-weight:800;line-height:1.4}
  .volunteer-perks svg{width:17px;height:17px;color:var(--teal);flex:none}
  .volunteer-dialog-footer{padding:22px 48px 26px;background:var(--cream);border-top:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;gap:24px}
  .volunteer-dialog-footer p{color:var(--muted);font-size:12px;line-height:1.5;margin:0;max-width:390px}
  .volunteer-dialog-footer p strong{display:block;color:var(--deep);font-family:Georgia,serif;font-size:17px;margin-bottom:2px}
  .volunteer-signup{height:44px!important;flex:none}
  @media(max-width:760px){.volunteer-banner-inner{grid-template-columns:auto 1fr;padding-block:28px}.volunteer-banner-copy{display:block}.volunteer-banner-copy h2{font-size:27px;white-space:normal;margin:5px 0 7px}.volunteer-learn-more{grid-column:2;justify-self:start}.volunteer-shifts{grid-template-columns:1fr}.volunteer-dialog-footer{align-items:stretch;flex-direction:column}.volunteer-signup{width:100%;justify-content:center}}
  @media(max-width:560px){.volunteer-banner-inner{grid-template-columns:1fr;gap:12px;padding-block:28px}.volunteer-banner-icon{width:43px;height:43px}.volunteer-banner-icon svg{width:22px;height:22px}.volunteer-learn-more{grid-column:1;width:100%;justify-content:center;margin-top:4px}.volunteer-dialog-body{padding:24px}.volunteer-perks{grid-template-columns:1fr}.volunteer-dialog-footer{padding:21px 24px 25px}}
`;

export function VolunteerBanner() {
  return (
    <>
      <style>{volunteerStyles}</style>
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
    </>
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
