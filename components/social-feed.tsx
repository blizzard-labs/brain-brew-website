"use client";

import { useEffect, useState } from "react";
import { CommunityGallery } from "@/components/community-gallery";
import { Bike, CalendarDays, Camera, ExternalLink, MessageCircle, Play } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Platform = "instagram" | "facebook" | "youtube" | "strava";

type SocialItem = {
  id: string;
  platform: Platform;
  kind: "post" | "video" | "event" | "profile";
  title: string;
  published: string;
  publishedAt: string | null;
  thumbnail: string | null;
  url: string;
};

const profiles: Record<Platform, string> = {
  instagram: "https://www.instagram.com/brainbrewsf",
  facebook: "https://www.facebook.com/share/1EDs4UJuRH/?mibextid=wwXIfr",
  youtube: "https://www.youtube.com/@brainbrewsf",
  strava: "https://www.strava.com/clubs/brainbrewsf",
};

const platformDetails: Record<Platform, { label: string; handle: string; icon: LucideIcon }> = {
  instagram: { label: "Instagram", handle: "@brainbrewsf", icon: Camera },
  facebook: { label: "Facebook", handle: "The Brain Brew Ride", icon: MessageCircle },
  youtube: { label: "YouTube", handle: "@brainbrewsf", icon: Play },
  strava: { label: "Strava", handle: "The Brain Brew Ride", icon: Bike },
};

const feedStyles = `
.feed-social-links{display:flex;align-items:center;gap:10px}
.feed-social-links a{display:flex;align-items:center;gap:8px;color:var(--purple);font-size:14px;font-weight:600;text-decoration:none}
.feed-social-links a:hover{text-decoration:underline;text-underline-offset:3px}
.feed-social-links a:focus-visible{outline:2px solid var(--purple);outline-offset:4px}
.feed-social-links svg{flex-shrink:0}
.feed-social-links a{white-space:nowrap;background:#fff;border-radius:999px;padding:10px 20px}
@media(max-width:560px){.feed-social-links{gap:8px}.feed-social-links a{font-size:12px;gap:5px;padding:8px 12px}}

.social-feed-section{background:linear-gradient(180deg,#f3edf7 0%,#fbf8f2 100%);overflow:hidden;border-top:1px solid #e4dbe8;border-bottom:1px solid #e1d8d2}
.feed-heading{display:flex;align-items:center;justify-content:space-between;gap:64px;margin-bottom:38px}
.feed-heading h2{font-family:Georgia,serif;color:var(--deep);font-size:48px;letter-spacing:-.035em;margin:0}
.feed-heading-side{display:flex;align-items:center;gap:26px}.feed-heading-side>p{max-width:370px;color:var(--muted);line-height:1.6;margin:0}
.feed-controls{display:flex;gap:8px;flex:none}.feed-controls button{width:42px;height:42px;border:1px solid #bfb1c8;background:#fff;color:var(--purple);display:grid;place-items:center;cursor:pointer;transition:background .18s ease,color .18s ease,transform .18s ease}.feed-controls button:hover{background:var(--purple);color:#fff;transform:translateY(-1px)}.feed-controls svg{width:18px;height:18px}
.feed-rail{display:flex;gap:18px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding-inline:1px;padding:2px 2px 22px;overscroll-behavior-inline:contain;scrollbar-width:thin;scrollbar-color:#a991bb transparent}
.feed-card{flex:0 0 282px;height:372px;scroll-snap-align:start;background:#fff;border:1px solid var(--line);box-shadow:0 12px 28px #2810370d;overflow:hidden}.feed-card>a{display:flex;height:100%;flex-direction:column;color:inherit;text-decoration:none}
.feed-card-media{height:205px;position:relative;overflow:hidden;background:#eee6f0;flex:none}.feed-card-media>img{width:100%;height:100%;display:block;object-fit:cover;transition:transform .3s ease}.feed-card:hover .feed-card-media>img{transform:scale(1.025)}
.feed-card-fallback{width:100%;height:100%;display:flex;align-items:center;justify-content:center;gap:17px;background:radial-gradient(circle at 75% 25%,#fff8 0 12%,transparent 13%),linear-gradient(135deg,#d9cff9,#f4c3cb 58%,#f2a981);color:var(--deep)}.feed-card-fallback>span{font-family:Georgia,serif;font-size:58px;font-style:italic;letter-spacing:-.08em}.feed-card-fallback>svg{width:32px;height:32px;color:var(--purple)}
.feed-card-instagram .feed-card-fallback{background:linear-gradient(135deg,#dfd2ff,#f7c1d6 58%,#ffba86)}.feed-card-facebook .feed-card-fallback{background:linear-gradient(135deg,#dcecff,#c7d8fa 58%,#e3d5f2)}.feed-card-youtube .feed-card-fallback{background:linear-gradient(135deg,#f7d7da,#ffd8b8 58%,#e4d5f3)}.feed-card-strava .feed-card-fallback{background:linear-gradient(135deg,#ffe3d4,#ffb58d 58%,#fc7c3b)}
.feed-platform-badge{position:absolute;left:13px;top:13px;height:28px;padding:0 10px;display:flex;align-items:center;gap:6px;background:#fffffff0;color:var(--deep);font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.07em;box-shadow:0 4px 12px #24102e1a}.feed-platform-badge svg{width:13px;height:13px}.feed-card-instagram .feed-platform-badge svg{color:#b83272}.feed-card-facebook .feed-platform-badge svg{color:#2368bd}.feed-card-youtube .feed-platform-badge svg{color:#d93832}.feed-card-strava .feed-platform-badge svg{color:#fc5200}
.feed-card-copy{padding:18px 19px 20px;display:flex;min-height:0;flex:1;flex-direction:column}.feed-card-account{display:flex;align-items:center;justify-content:space-between;gap:10px;color:var(--teal);font-size:10px;font-weight:900;letter-spacing:.04em}.feed-card-account svg{width:13px;height:13px;color:#9c8da4}.feed-card-copy h3{font-family:Georgia,serif;color:var(--deep);font-size:19px;line-height:1.2;margin:13px 0 8px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.feed-card-copy p{margin:auto 0 0;color:var(--muted);font-size:11px;line-height:1.45;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.feed-card:hover{border-color:#a78ab9}.feed-card>a:focus-visible,.feed-controls button:focus-visible,.feed-footer a:focus-visible{outline:3px solid #7b4aa555;outline-offset:-3px}
.feed-card-loading{padding:18px;background:#fff}.feed-card-loading span{display:block;background:linear-gradient(90deg,#e8e0e9 25%,#f6f1f6 50%,#e8e0e9 75%);background-size:200% 100%;animation:feed-loading 1.3s infinite}.feed-card-loading span:first-child{height:205px;margin:-18px -18px 18px}.feed-card-loading span:nth-child(2){height:18px;width:74%;margin-bottom:12px}.feed-card-loading span:last-child{height:54px}
.feed-footer{display:flex;justify-content:space-between;align-items:center;gap:24px;margin-top:16px;color:var(--muted);font-size:11px}.feed-footer>span{display:flex;align-items:center;gap:9px;font-weight:800}.feed-footer i{width:7px;height:7px;border-radius:50%;background:#42b991;box-shadow:0 0 0 4px #42b9911f}.feed-footer nav{display:flex;gap:20px}.feed-footer a{display:flex;align-items:center;gap:5px;color:var(--purple);font-size:11px;font-weight:900;text-decoration:none}.feed-footer a:hover{text-decoration:underline}.feed-footer svg{width:12px;height:12px}
@keyframes feed-loading{to{background-position:-200% 0}}
@media(max-width:900px){.feed-heading{display:block}.feed-heading-side{align-items:center;justify-content:space-between;margin-top:20px}.feed-card{flex-basis:272px}}
@media(max-width:560px){.feed-heading h2{font-size:37px}.feed-heading-side>p{font-size:13px}.feed-controls{display:none}.feed-card{flex-basis:82vw;max-width:282px}.feed-footer{align-items:flex-start;flex-direction:column}.feed-footer nav{gap:13px;flex-wrap:wrap}}
`;

const profileCards: SocialItem[] = (["instagram", "facebook", "youtube", "strava"] as Platform[]).map((platform) => ({
  id: `${platform}-profile`,
  platform,
  kind: "profile",
  title: platform === "facebook"
    ? "Follow The Brain Brew Ride"
    : platform === "strava"
      ? "Join The Brain Brew Ride club"
      : "Follow @brainbrewsf",
  published: "Official channel",
  publishedAt: null,
  thumbnail: null,
  url: profiles[platform],
}));

function FeedCard({ item }: { item: SocialItem }) {
  const details = platformDetails[item.platform];
  const Icon = item.kind === "event" ? CalendarDays : details.icon;
  const isProfile = item.kind === "profile";
  const badgeLabel = item.kind === "event" ? "Strava event" : details.label;

  return <article className={`feed-card feed-card-${item.platform}${isProfile ? " feed-card-profile" : ""}`}>
    <a href={item.url} target="_blank" rel="noreferrer" aria-label={`${item.title} on ${details.label}`}>
      <div className="feed-card-media">
        {item.thumbnail
          ? <img src={item.thumbnail} alt="" loading="lazy" />
          : <div className="feed-card-fallback" aria-hidden="true"><span>BB</span><Icon/></div>}
        <span className="feed-platform-badge"><Icon/>{badgeLabel}</span>
      </div>
      <div className="feed-card-copy">
        <div className="feed-card-account"><span>{details.handle}</span><ExternalLink/></div>
        <h3>{item.title}</h3>
        <p>{isProfile ? `Visit ${details.label} for all posts and updates.` : item.published}</p>
      </div>
    </a>
  </article>;
}

export function SocialFeed() {
  const [items, setItems] = useState<SocialItem[] | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let hasLoaded = false;

    function refresh() {
      fetch("/api/social-feed", { signal: controller.signal })
        .then((response) => response.ok ? response.json() : Promise.reject())
        .then((data: { items?: SocialItem[]; instagramStatus?: string }) => {
          const liveItems = (data.items ?? []).filter(item => !(item.platform === "youtube" && item.kind === "video"));
          setItems(previous => {
            const keepInstagram = data.instagramStatus === "unavailable" || data.instagramStatus === "stale";
            const instagram = keepInstagram ? (previous ?? []).filter(item => item.platform === "instagram" && item.kind !== "profile") : [];
            const merged = new Map([...instagram, ...liveItems].map(item => [`${item.platform}-${item.id}`, item]));
            return [...merged.values(), ...profileCards];
          });
          hasLoaded = true;
        })
        .catch((error: unknown) => {
          if ((error as { name?: string })?.name !== "AbortError") {
            if (!hasLoaded) setItems(profileCards);
          }
        });
    }

    refresh();
    const interval = window.setInterval(refresh, 5 * 60 * 1000);
    return () => {
      window.clearInterval(interval);
      controller.abort();
    };
  }, []);

  return <><style>{feedStyles}</style><section className="social-feed-section section" id="updates">
    <div className="shell">
      <div className="feed-heading">
        <div><h2>Fresh from the feed</h2></div>
        <div className="feed-heading-side">
          <nav className="feed-social-links" aria-label="Follow Brain Brew">
            <a href={profiles.instagram} target="_blank" rel="noreferrer" aria-label="@brainbrewsf on Instagram"><svg width="18" height="18" viewBox="2 2 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg><span>@brainbrewsf</span></a>
            <a href={profiles.facebook} target="_blank" rel="noreferrer" aria-label="The Brain Brew Ride on Facebook"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.025 4.388 11.02 10.125 11.927v-8.437H7.078v-3.49h3.047V9.413c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.972h-1.513c-1.49 0-1.956.931-1.956 1.887v2.262h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.098 24 12.073Z"/></svg><span>The Brain Brew Ride</span></a>
          </nav>
        </div>
      </div>

      <div className="feed-rail" tabIndex={0} aria-label="Latest Brain Brew social posts">
        {items === null
          ? [0, 1, 2, 3].map((item) => <div className="feed-card feed-card-loading" aria-hidden="true" key={item}><span/><span/><span/></div>)
          : items.map((item) => <FeedCard item={item} key={`${item.platform}-${item.id}`}/>)}
      </div>

      <CommunityGallery />
    </div>
  </section></>;
}
