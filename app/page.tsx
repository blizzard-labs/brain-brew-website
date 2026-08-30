import { ArrowRight, Bike, Clock3, Heart, Mail, MapPin, PersonStanding, ShieldCheck, Users } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { DonationDialog } from "@/components/donation-dialog";

const days = [
  { n: "01", date: "SAT · SEP 19", title: "Corpus Callosum 5K", time: "8:00–10:00 AM", icon: PersonStanding, text: "A welcoming 5K run/walk through neighborhood streets. All paces, walkers, strollers, and leashed dogs are welcome.", href: "#day-one", tone: "coral" },
  { n: "02", date: "SUN · SEP 20", title: "Community Day", time: "11:00 AM–3:00 PM", icon: Users, text: "A free, drop-in afternoon of hands-on brain health activities, family crafts, short talks, food, and connection.", href: "#day-two", tone: "teal" },
  { n: "03", date: "MON · SEP 21", title: "The Full Brain Brew Ride", time: "All day · finish ~6:45 PM", icon: Bike, text: "Follow two organizers as their 22.4-mile GPS route draws a brain across San Francisco, ending at City Hall.", href: "#day-three", tone: "purple" },
];

const stops = [
  ["Fort Mason / Marina Green", "9:45–10:45 AM", "Quiet first stop"], ["Pier 39 / Fisherman’s Wharf", "11:00 AM–12:30 PM", "Biggest stop"],
  ["Union Square", "2:00–3:30 PM", "Transit-friendly"], ["Oracle Park / South Beach", "3:45–4:30 PM", "Waterfront stop"],
  ["City Hall · Finish", "~6:45 PM", "Public finish + group photo"],
];

export default function Home() {
  return <main>
    <div className="live-strip"><span /> Live participant guide · details may be updated</div>
    <nav className="nav shell" aria-label="Main navigation">
      <a className="brand" href="#top"><span className="brain-mark">BB</span><span>Brain Brew<span>Ride SF</span></span></a>
      <div className="nav-links"><a href="#weekend">The weekend</a><a href="#plan">Plan your visit</a><a href="#safety">Safety</a></div>
      <Button asChild className="register"><a href="https://forms.gle/TBYodKPwEr8REew2A" target="_blank" rel="noreferrer">Register free <ArrowRight size={16}/></a></Button>
    </nav>
    <section className="hero-section" id="top"><div className="hero shell">
      <div className="hero-copy"><p className="eyebrow">World Alzheimer’s Day · San Francisco</p><h1>Move for a<br/><em>healthier brain.</em></h1>
        <p className="lede">Three student-led days. One brain-shaped route. Join a 5K, explore a free community day, and follow a citywide ride supporting families affected by Alzheimer’s and Parkinson’s.</p>
        <div className="hero-actions"><Button asChild size="lg" className="register"><a href="https://forms.gle/TBYodKPwEr8REew2A" target="_blank" rel="noreferrer">Save your spot <ArrowRight size={17}/></a></Button><DonationDialog/><a className="text-link" href="#weekend">Explore the weekend ↓</a></div>
        <p className="micro">Free to attend · Walk-ups welcome · Suggested donation $30</p>
      </div>
      <div className="route-art flyer-art"><Image src="/brain-brew-route-transparent.png" width={1536} height={1024} sizes="(max-width: 900px) 100vw, 45vw" priority alt="Illustrated San Francisco map showing the red Brain Brew route, Golden Gate Bridge, running shoe, coffee cup, and brain" /></div>
    </div></section>
    <section className="impact"><div className="shell impact-inner"><Heart fill="currentColor"/><p>Everything raised supports patients through the <strong>Michael J. Fox Foundation</strong> and the <strong>Alzheimer’s Association.</strong></p></div></section>
    <div className="hero-sticker-parade" aria-hidden="true" />
    <section className="section shell" id="weekend"><div className="section-head"><div><p className="eyebrow">Choose your day—or join all three</p><h2>Your weekend at a glance</h2></div><p>Every event is free, welcoming, and designed so you can participate in the way that works for you.</p></div><div className="day-grid">{days.map(({icon: Icon,...d})=><article className={`day-card ${d.tone}`} key={d.n}><div className="day-top"><span>{d.n}</span><Icon/></div><p className="date">{d.date}</p><h3>{d.title}</h3><p className="time"><Clock3 size={16}/>{d.time}</p><p>{d.text}</p><a href={d.href}>See the details <ArrowRight size={16}/></a></article>)}</div></section>
    <section className="details section" id="plan"><div className="shell">
      <article className="event-block" id="day-one"><div className="event-num">DAY 01</div><div><p className="eyebrow coral-text">Saturday · Buchanan YMCA</p><h2>Corpus Callosum 5K</h2><p className="event-intro">Not a race—just one group moving together. The flat, marshaled 3.1-mile course represents the fibers connecting the brain’s two halves.</p><div className="timeline"><span><b>7:30</b>Check-in opens</span><span><b>8:00</b>Briefing</span><span><b>8:10</b>Group photo</span><span><b>8:15</b>Roll out</span><span><b>~9:00</b>Finish + cold brew</span></div></div></article>
      <article className="event-block" id="day-two"><div className="event-num">DAY 02</div><div><p className="eyebrow teal-text">Sunday · Drop in anytime</p><h2>A community day for curious minds</h2><p className="event-intro">Stay for twenty minutes or the afternoon. There’s no program to be late for.</p><div className="station-grid"><div><span>01</span><h3>The Empathy Café</h3><p>Try tremor gloves and vision-distorting goggles while seated with a spotter.</p></div><div><span>02</span><h3>The Memory Wall</h3><p>Honor someone you love who has been affected.</p></div><div><span>03</span><h3>Build-a-Brain</h3><p>Kids create a model and learn what each region does.</p></div><div><span>04</span><h3>Move Your Mind</h3><p>Light games connect movement with long-term brain health.</p></div></div></div></article>
      <article className="event-block" id="day-three"><div className="event-num">DAY 03</div><div><p className="eyebrow purple-text">Monday · World Alzheimer’s Day</p><h2>Meet the ride across the city</h2><p className="event-intro">Two organizers trace the full brain route on e-bikes. Follow remotely or meet the team at a landmark stop.</p><div className="stop-list">{stops.map((s,i)=><div key={s[0]}><b>{String(i+1).padStart(2,"0")}</b><span><strong>{s[0]}</strong><small>{s[2]}</small></span><time>{s[1]}</time></div>)}</div><p className="notice">Times are approximate and may drift. Live tracker and social updates are coming soon.</p></div></article>
    </div></section>
    <section className="visit section shell"><div><p className="eyebrow">Home base</p><h2>Getting there</h2><p><MapPin size={20}/><strong>Buchanan YMCA</strong><br/>1530 Buchanan Street, San Francisco, CA 94115</p></div><div className="travel-grid"><div><b>Transit</b><p>Several Muni lines stop within a few blocks. Check 511.org or your maps app that morning.</p></div><div><b>Driving</b><p>Street parking is limited. Japan Center garages are the nearest paid option; add 20 minutes.</p></div><div><b>Biking</b><p>Bring a lock—racks are limited.</p></div></div></section>
    <section className="safety section" id="safety"><div className="shell safety-grid"><div><ShieldCheck/><p className="eyebrow">Know before you go</p><h2>Safe, simple, welcoming.</h2></div><ul><li>Waivers are required; participants under 18 need a parent or guardian signature.</li><li>Simulation gear is seated-only, supervised, and sanitized between uses.</li><li>First aid and a supervising adult are on site all three days.</li><li>Events run rain or shine unless there is a safety hazard.</li><li>Look for volunteers in purple shirts if you need anything.</li></ul></div></section>
    <footer><div className="shell footer-grid"><div><div className="brand light"><span className="brain-mark">BB</span><span>Brain Brew<span>Ride SF</span></span></div><h2>Come move, remember,<br/>and make an impact.</h2></div><div><p className="eyebrow">Questions?</p><a href="mailto:brainbrewsf@googlegroups.com"><Mail size={17}/>brainbrewsf@googlegroups.com</a><a href="tel:+16692919198">Day-of: (669) 291-9198</a><Button asChild className="footer-button"><a href="https://forms.gle/TBYodKPwEr8REew2A" target="_blank" rel="noreferrer">Register for free <ArrowRight size={16}/></a></Button></div></div><div className="shell footer-bottom"><span>Brain Brew Ride · September 19–21, 2026</span><span>San Francisco, California</span></div></footer>
  </main>;
}
