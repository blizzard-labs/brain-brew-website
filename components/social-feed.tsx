"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Camera, ExternalLink, MessageCircle, Play } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Platform = "instagram" | "facebook" | "youtube";

type SocialItem = {
  id: string;
  platform: Platform;
  kind: "post" | "video" | "profile";
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
};

const platformDetails: Record<Platform, { label: string; handle: string; icon: LucideIcon }> = {
  instagram: { label: "Instagram", handle: "@brainbrewsf", icon: Camera },
  facebook: { label: "Facebook", handle: "The Brain Brew Ride", icon: MessageCircle },
  youtube: { label: "YouTube", handle: "@brainbrewsf", icon: Play },
};

const feedStyles = `
.social-feed-section{background:linear-gradient(180deg,#f3edf7 0%,#fbf8f2 100%);overflow:hidden;border-top:1px solid #e4dbe8;border-bottom:1px solid #e1d8d2}
.feed-heading{display:flex;align-items:end;justify-content:space-between;gap:64px;margin-bottom:38px}
.feed-heading h2{font-family:Georgia,serif;color:var(--deep);font-size:48px;letter-spacing:-.035em;margin:0}
.feed-heading-side{display:flex;align-items:end;gap:26px}.feed-heading-side>p{max-width:370px;color:var(--muted);line-height:1.6;margin:0}
.feed-controls{display:flex;gap:8px;flex:none}.feed-controls button{width:42px;height:42px;border:1px solid #bfb1c8;background:#fff;color:var(--purple);display:grid;place-items:center;cursor:pointer;transition:background .18s ease,color .18s ease,transform .18s ease}.feed-controls button:hover{background:var(--purple);color:#fff;transform:translateY(-1px)}.feed-controls svg{width:18px;height:18px}
.feed-rail{display:flex;gap:18px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding-inline:1px;padding:2px 2px 22px;overscroll-behavior-inline:contain;scrollbar-width:thin;scrollbar-color:#a991bb transparent}
.feed-card{flex:0 0 282px;height:372px;scroll-snap-align:start;background:#fff;border:1px solid var(--line);box-shadow:0 12px 28px #2810370d;overflow:hidden}.feed-card>a{display:flex;height:100%;flex-direction:column;color:inherit;text-decoration:none}
.feed-card-media{height:205px;position:relative;overflow:hidden;background:#eee6f0;flex:none}.feed-card-media>img{width:100%;height:100%;display:block;object-fit:cover;transition:transform .3s ease}.feed-card:hover .feed-card-media>img{transform:scale(1.025)}
.feed-card-fallback{width:100%;height:100%;display:flex;align-items:center;justify-content:center;gap:17px;background:radial-gradient(circle at 75% 25%,#fff8 0 12%,transparent 13%),linear-gradient(135deg,#d9cff9,#f4c3cb 58%,#f2a981);color:var(--deep)}.feed-card-fallback>span{font-family:Georgia,serif;font-size:58px;font-style:italic;letter-spacing:-.08em}.feed-card-fallback>svg{width:32px;height:32px;color:var(--purple)}
.feed-card-instagram .feed-card-fallback{background:linear-gradient(135deg,#dfd2ff,#f7c1d6 58%,#ffba86)}.feed-card-facebook .feed-card-fallback{background:linear-gradient(135deg,#dcecff,#c7d8fa 58%,#e3d5f2)}.feed-card-youtube .feed-card-fallback{background:linear-gradient(135deg,#f7d7da,#ffd8b8 58%,#e4d5f3)}
.feed-platform-badge{position:absolute;left:13px;top:13px;height:28px;padding:0 10px;display:flex;align-items:center;gap:6px;background:#fffffff0;color:var(--deep);font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.07em;box-shadow:0 4px 12px #24102e1a}.feed-platform-badge svg{width:13px;height:13px}.feed-card-instagram .feed-platform-badge svg{color:#b83272}.feed-card-facebook .feed-platform-badge svg{color:#2368bd}.feed-card-youtube .feed-platform-badge svg{color:#d93832}
.feed-card-copy{padding:18px 19px 20px;display:flex;min-height:0;flex:1;flex-direction:column}.feed-card-account{display:flex;align-items:center;justify-content:space-between;gap:10px;color:var(--teal);font-size:10px;font-weight:900;letter-spacing:.04em}.feed-card-account svg{width:13px;height:13px;color:#9c8da4}.feed-card-copy h3{font-family:Georgia,serif;color:var(--deep);font-size:19px;line-height:1.2;margin:13px 0 8px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.feed-card-copy p{margin:auto 0 0;color:var(--muted);font-size:11px;line-height:1.45;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.feed-card:hover{border-color:#a78ab9}.feed-card>a:focus-visible,.feed-controls button:focus-visible,.feed-footer a:focus-visible{outline:3px solid #7b4aa555;outline-offset:-3px}
.feed-card-loading{padding:18px;background:#fff}.feed-card-loading span{display:block;background:linear-gradient(90deg,#e8e0e9 25%,#f6f1f6 50%,#e8e0e9 75%);background-size:200% 100%;animation:feed-loading 1.3s infinite}.feed-card-loading span:first-child{height:205px;margin:-18px -18px 18px}.feed-card-loading span:nth-child(2){height:18px;width:74%;margin-bottom:12px}.feed-card-loading span:last-child{height:54px}
.feed-footer{display:flex;justify-content:space-between;align-items:center;gap:24px;margin-top:16px;color:var(--muted);font-size:11px}.feed-footer>span{display:flex;align-items:center;gap:9px;font-weight:800}.feed-footer i{width:7px;height:7px;border-radius:50%;background:#42b991;box-shadow:0 0 0 4px #42b9911f}.feed-footer nav{display:flex;gap:20px}.feed-footer a{display:flex;align-items:center;gap:5px;color:var(--purple);font-size:11px;font-weight:900;text-decoration:none}.feed-footer a:hover{text-decoration:underline}.feed-footer svg{width:12px;height:12px}
@keyframes feed-loading{to{background-position:-200% 0}}
@media(max-width:900px){.feed-heading{display:block}.feed-heading-side{align-items:center;justify-content:space-between;margin-top:20px}.feed-card{flex-basis:272px}}
@media(max-width:560px){.feed-heading h2{font-size:37px}.feed-heading-side>p{font-size:13px}.feed-controls{display:none}.feed-card{flex-basis:82vw;max-width:282px}.feed-footer{align-items:flex-start;flex-direction:column}.feed-footer nav{gap:13px;flex-wrap:wrap}}
`;

const profileCards: SocialItem[] = (["instagram", "facebook", "youtube"] as Platform[]).map((platform) => ({
  id: `${platform}-profile`,
  platform,
  kind: "profile",
  title: platform === "facebook" ? "Follow The Brain Brew Ride" : "Follow @brainbrewsf",
  published: "Official channel",
  publishedAt: null,
  thumbnail: null,
  url: profiles[platform],
}));

function FeedCard({ item }: { item: SocialItem }) {
  const details = platformDetails[item.platform];
  const Icon = details.icon;
  const isProfile = item.kind === "profile";

  return <article className={`feed-card feed-card-${item.platform}${isProfile ? " feed-card-profile" : ""}`}>
    <a href={item.url} target="_blank" rel="noreferrer" aria-label={`${item.title} on ${details.label}`}>
      <div className="feed-card-media">
        {item.thumbnail
          ? <img src={item.thumbnail} alt="" loading="lazy" />
          : <div className="feed-card-fallback" aria-hidden="true"><span>BB</span><Icon/></div>}
        <span className="feed-platform-badge"><Icon/>{details.label}</span>
      </div>
      <div className="feed-card-copy">
        <div className="feed-card-account"><span>{details.handle}</span><ExternalLink/></div>
        <h3>{item.title}</h3>
        <p>{isProfile ? `New ${details.label} updates will join this stream automatically as they are published.` : item.published}</p>
      </div>
    </a>
  </article>;
}

export function SocialFeed() {
  const [items, setItems] = useState<SocialItem[] | null>(null);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/social-feed", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data: { items?: SocialItem[] }) => {
        const liveItems = data.items ?? [];
        setItems([...liveItems, ...profileCards]);
      })
      .catch((error: unknown) => {
        if ((error as { name?: string })?.name !== "AbortError") setItems(profileCards);
      });
    return () => controller.abort();
  }, []);

  function scroll(direction: -1 | 1) {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector<HTMLElement>(".feed-card");
    rail.scrollBy({ left: direction * ((card?.offsetWidth ?? 288) + 18) * 2, behavior: "smooth" });
  }

  return <><style>{feedStyles}</style><section className="social-feed-section section" id="updates">
    <div className="shell">
      <div className="feed-heading">
        <div><p className="eyebrow">Live from Brain Brew</p><h2>Fresh from the feed</h2></div>
        <div className="feed-heading-side">
          <p>One stream for every public update across Instagram, Facebook, and YouTube.</p>
          <div className="feed-controls" aria-label="Scroll social updates">
            <button type="button" onClick={() => scroll(-1)} aria-label="See previous updates"><ArrowLeft/></button>
            <button type="button" onClick={() => scroll(1)} aria-label="See more updates"><ArrowRight/></button>
          </div>
        </div>
      </div>

      <div className="feed-rail" ref={railRef} tabIndex={0} aria-label="Latest Brain Brew social posts">
        {items === null
          ? [0, 1, 2, 3].map((item) => <div className="feed-card feed-card-loading" aria-hidden="true" key={item}><span/><span/><span/></div>)
          : items.map((item) => <FeedCard item={item} key={`${item.platform}-${item.id}`}/>)}
      </div>

      <div className="feed-footer">
        <span><i/> Auto-refreshing throughout ride weekend</span>
        <nav aria-label="Follow Brain Brew">
          <a href={profiles.instagram} target="_blank" rel="noreferrer">Instagram <ExternalLink/></a>
          <a href={profiles.facebook} target="_blank" rel="noreferrer">Facebook <ExternalLink/></a>
          <a href={profiles.youtube} target="_blank" rel="noreferrer">YouTube <ExternalLink/></a>
        </nav>
      </div>
    </div>
  </section></>;
}
