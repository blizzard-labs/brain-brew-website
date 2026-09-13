import { ArrowRight, Bike, Clock3, Heart, Mail, MapPin, PersonStanding, ShieldCheck, Users } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { DonationDialog } from "@/components/donation-dialog";
import { SocialFeed } from "@/components/social-feed";
import { WeekendDetailsDialog } from "@/components/weekend-details-dialog";
import { VolunteerBanner } from "@/components/volunteer-dialog";

const days = [
  { n: "01", day: "one" as const, date: "SAT · OCT 17", title: "The Full Brain Brew Ride", location: "Fort Mason Park", time: "All day · finish ~6:45 PM", icon: Bike, text: "Follow the cafés as two organizers trace a 22.4-mile brain-shaped route across San Francisco, ending at City Hall.", tone: "purple" },
  { n: "02", day: "two" as const, date: "SUN · OCT 18", title: "Community Day", location: "Buchanan YMCA", time: "11:00 AM–3:00 PM", icon: Users, text: "A free, family-friendly day of hands-on brain health activities, a memory wall, short talks, food, and connection.", tone: "teal" },
  { n: "03", day: "three" as const, date: "SAT · OCT 24", title: "The Brain Brew Crew", location: "Bayfront Park · Mission Bay", time: "10:00 AM ceremony · 10:30 AM walk", icon: PersonStanding, text: "Join our team at Walk to End Alzheimer’s SF for a 3-mile community walk. Walk together, hoist our Memory Wall, and honor those affected by Alzheimer’s.", tone: "coral" },
];

export default function Home() {
  return <main>
    <header className="site-header">
      <div className="live-strip"><span /> Live participant guide · details may be updated</div>
      <nav className="nav shell" aria-label="Main navigation">
        <a className="brand" href="#top"><span className="brain-mark">BB</span><span>Brain Brew<span>Ride SF</span></span></a>
        <div className="nav-links"><a href="#weekend">The events</a><a href="#updates">Live updates</a><a href="#plan">Plan your visit</a><a href="#safety">Safety</a></div>
        <div className="nav-actions">
          <Button asChild className="register"><a href="https://forms.gle/TBYodKPwEr8REew2A" target="_blank" rel="noreferrer">Register free <ArrowRight size={16}/></a></Button>
          <span className="donate-action"><DonationDialog size="default" className="header-donate"/></span>
        </div>
      </nav>
    </header>
    <section className="hero-section" id="top"><div className="hero shell">
      <div className="hero-copy"><p className="eyebrow">Kicking off National Alzheimer&apos;s Month · San Francisco</p><h1>Every <em>mind</em><br/>has a <em>story.</em></h1>
        <p className="lede">Three days of learning, connection, and coffee—building youth empathy for people living with Alzheimer’s and Parkinson’s, and supporting their families.</p>
        <div className="hero-actions"><Button asChild size="lg" className="register"><a href="https://forms.gle/TBYodKPwEr8REew2A" target="_blank" rel="noreferrer">Save your spot <ArrowRight size={17}/></a></Button><DonationDialog/><a className="text-link" href="#weekend">Explore the events ↓</a></div>
        <p className="micro">Free to attend · Walk-ups welcome · Suggested donation $30</p>
      </div>
      <div className="route-art flyer-art"><Image src="/brain-brew-route-transparent.png" width={1536} height={1024} sizes="(max-width: 900px) 100vw, 45vw" priority alt="Illustrated San Francisco map showing the red Brain Brew route, Golden Gate Bridge, running shoe, coffee cup, and brain" /></div>
    </div></section>
    <section className="impact"><div className="shell impact-inner"><Heart fill="currentColor"/><p>Everything raised supports patients through the <strong>Michael J. Fox Foundation</strong> and the <strong>Alzheimer’s Association.</strong></p></div></section>
    <section className="section shell" id="weekend"><div className="section-head"><div><p className="eyebrow">Choose your day—or join all three</p><h2>Three days. One mission. Brain health.</h2></div><p>Every event is free, welcoming, and designed so you can participate in the way that works for you.</p></div><div className="day-grid">{days.map(({icon: Icon,...d})=><article className={`day-card ${d.tone}`} key={d.n}><div className="day-top"><span>{d.n}</span><Icon/></div><p className="date">{d.date}</p><h3>{d.title}</h3><p className="time"><MapPin size={16}/>{d.location}</p><p className="time"><Clock3 size={16}/>{d.time}</p><p className="day-description">{d.text}</p><WeekendDetailsDialog day={d.day}/></article>)}</div></section>
    <VolunteerBanner />
    <SocialFeed/>
    <section className="visit section shell" id="plan"><div><p className="eyebrow">Three days · Three locations</p><h2>Getting there</h2><p>Check the location for your event before heading out. Use your maps app or 511.org to plan your trip.</p></div><div className="travel-grid"><div><b>The Brain Brew Ride</b><div className="location-details" style={{display: "grid", gap: "8px"}}><p><MapPin size={20}/><strong>Fort Mason Park</strong></p><p>Bay Street &amp; Franklin Street<br/>San Francisco, CA 94123</p></div></div><div><b>Community Day</b><div className="location-details" style={{display: "grid", gap: "8px"}}><p><MapPin size={20}/><strong>Buchanan YMCA</strong></p><p>1530 Buchanan Street<br/>San Francisco, CA 94115</p></div></div><div><b>The Brain Brew Crew</b><div className="location-details" style={{display: "grid", gap: "8px"}}><p><MapPin size={20}/><strong>Bayfront Park · Mission Bay</strong></p><p>16th Street &amp; Terry A. Francois Boulevard<br/>San Francisco, CA 94158</p></div></div></div></section>
    <section className="safety section" id="safety"><div className="shell safety-grid"><div><ShieldCheck/><p className="eyebrow">Know before you go</p><h2>Safe, simple, welcoming.</h2></div><ul><li>Waivers are required; participants under 18 need a parent or guardian signature.</li><li>Simulation gear is seated-only, supervised, and sanitized between uses.</li><li>First aid and a supervising adult are on site all three days.</li><li>Events run rain or shine unless there is a safety hazard.</li><li>Look for volunteers in purple shirts if you need anything.</li></ul></div></section>
    <footer>
      <div className="shell footer-grid"><div><div className="brand light"><span className="brain-mark">BB</span><span>Brain Brew<span>Ride SF</span></span></div><h2>Ride, Walk,<br/>Remember.</h2></div><div><p className="eyebrow">Questions?</p><a href="mailto:brainbrewsf@googlegroups.com"><Mail size={17}/>brainbrewsf@googlegroups.com</a><a href="tel:+16692919198">Day-of: (669) 291-9198</a><div className="footer-actions"><Button asChild className="footer-button"><a href="https://forms.gle/TBYodKPwEr8REew2A" target="_blank" rel="noreferrer">Register for free <ArrowRight size={16}/></a></Button><span className="donate-action"><DonationDialog size="default" className="footer-donate"/></span></div></div></div><div className="shell footer-bottom"><span>Brain Brew Ride · October 17, 18 & 24, 2026</span><span>San Francisco, California</span></div>
    </footer>
    <div className="footer-sticker-parade" aria-hidden="true">
      <div className="footer-sticker-track">
        {[0, 1, 2].map((copy) => <Image key={copy} src="/brain-brew-sticker-strip-v3.png" width={2172} height={724} alt="" />)}
      </div>
    </div>
  </main>;
}
