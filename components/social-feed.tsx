"use client";

import { useEffect, useState } from "react";
import { Camera, ExternalLink, MessageCircle, Play } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type YouTubeItem = {
  id: string;
  type: "video" | "post";
  title: string;
  published: string;
  thumbnail: string | null;
  url: string;
};

const profiles = {
  instagram: "https://www.instagram.com/brainbrewsf",
  facebook: "https://www.facebook.com/share/1EDs4UJuRH/?mibextid=wwXIfr",
  youtube: "https://www.youtube.com/@brainbrewsf",
};

function YouTubeStream() {
  const [items, setItems] = useState<YouTubeItem[] | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/youtube-feed", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data: { items?: YouTubeItem[] }) => setItems(data.items ?? []))
      .catch((error: unknown) => {
        if ((error as { name?: string })?.name !== "AbortError") setItems([]);
      });

    return () => controller.abort();
  }, []);

  if (items === null) {
    return <div className="youtube-loading" aria-live="polite"><span/><span/><span/></div>;
  }

  if (items.length === 0) {
    return <div className="social-empty">
      <Play aria-hidden="true" />
      <strong>The channel is warming up.</strong>
      <p>Videos, Shorts, live streams, and community posts will appear here automatically as they are published.</p>
      <a href={profiles.youtube} target="_blank" rel="noreferrer">Visit YouTube <ExternalLink size={14}/></a>
    </div>;
  }

  return <div className="youtube-stream">
    {items.map((item) => <a className="youtube-item" href={item.url} target="_blank" rel="noreferrer" key={`${item.type}-${item.id}`}>
      {item.thumbnail ? <img src={item.thumbnail} alt="" loading="lazy" /> : <span className="youtube-item-placeholder"><Play/></span>}
      <span className="youtube-item-copy">
        <small>{item.type === "post" ? "Community post" : "YouTube video"}{item.published ? ` · ${item.published}` : ""}</small>
        <strong>{item.title}</strong>
        <em>View on YouTube <ExternalLink size={12}/></em>
      </span>
    </a>)}
  </div>;
}

function StreamHeader({
  icon: Icon,
  name,
  handle,
  href,
}: {
  icon: LucideIcon;
  name: string;
  handle: string;
  href: string;
}) {
  return <div className="social-card-head">
    <span className="social-platform-icon"><Icon aria-hidden="true"/></span>
    <span><strong>{name}</strong><small>{handle}</small></span>
    <a href={href} target="_blank" rel="noreferrer" aria-label={`Open Brain Brew on ${name}`}><ExternalLink/></a>
  </div>;
}

export function SocialFeed() {
  const facebookEmbed = "https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fpeople%2FThe-Brain-Brew-Ride%2F61593945623883%2F&tabs=timeline&width=500&height=560&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=false";

  return <section className="social-section section" id="updates">
    <div className="shell">
      <div className="social-heading">
        <div><p className="eyebrow">Live from Brain Brew</p><h2>The latest from the ride</h2></div>
        <p>Every public update flows in from our official channels. The feeds refresh automatically, so check back as ride weekend gets closer.</p>
      </div>

      <div className="social-grid">
        <article className="social-card instagram-card">
          <StreamHeader icon={Camera} name="Instagram" handle="@brainbrewsf" href={profiles.instagram}/>
          <div className="social-embed-wrap">
            <iframe
              className="social-embed instagram-embed"
              src="https://www.instagram.com/brainbrewsf/embed"
              title="Latest Instagram posts from Brain Brew Ride"
              loading="lazy"
              allow="encrypted-media"
            />
          </div>
          <p className="social-card-note">New public posts and Reels appear here automatically.</p>
        </article>

        <article className="social-card facebook-card">
          <StreamHeader icon={MessageCircle} name="Facebook" handle="The Brain Brew Ride" href={profiles.facebook}/>
          <div className="social-embed-wrap">
            <iframe
              className="social-embed facebook-embed"
              src={facebookEmbed}
              title="Latest Facebook updates from Brain Brew Ride"
              loading="lazy"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            />
          </div>
          <p className="social-card-note">Public timeline updates load directly from Facebook.</p>
        </article>

        <article className="social-card youtube-card">
          <StreamHeader icon={Play} name="YouTube" handle="@brainbrewsf" href={profiles.youtube}/>
          <div className="social-embed-wrap youtube-wrap"><YouTubeStream/></div>
          <p className="social-card-note">Uploads and community posts refresh throughout the day.</p>
        </article>
      </div>

      <div className="social-follow-row" aria-label="Brain Brew social profiles">
        <span>Follow along</span>
        <a href={profiles.instagram} target="_blank" rel="noreferrer"><Camera/>Instagram</a>
        <a href={profiles.facebook} target="_blank" rel="noreferrer"><MessageCircle/>Facebook</a>
        <a href={profiles.youtube} target="_blank" rel="noreferrer"><Play/>YouTube</a>
      </div>
    </div>
  </section>;
}
