"use client";

import type { CSSProperties } from "react";
import Image from "next/image";

const mainSupporters = [
  { name: "Buchanan YMCA", image: "ymca.svg", href: "https://www.ymcasf.org/location/buchanan-ymca/" },
  { name: "Walk to End Alzheimer’s", image: "walk-to-end-alzheimers.webp", href: "http://act.alz.org/goto/brainbrew" },
];
const sponsors = [
  { name: "Jane", image: "jane.webp", artworkWidth: 109, artworkHeight: 85, href: "https://www.itsjane.com/" },
  { name: "Verve Coffee Roasters", image: "verve.webp", artworkWidth: 101, artworkHeight: 91, href: "https://www.vervecoffee.com/" },
  { name: "Kissako Tea", image: "kissako.webp", artworkWidth: 96, artworkHeight: 96, href: "https://www.instagram.com/kissako.tea/" },
  { name: "Linea Caffe", image: "linea.webp", artworkWidth: 97, artworkHeight: 95, href: "https://lineacaffe.com/" },
  { name: "Four Barrel Coffee", image: "four-barrel.webp", artworkWidth: 167, artworkHeight: 55, href: "https://www.fourbarrelcoffee.com/" },
  { name: "Bicycle Coffee", image: "bicycle-coffee.webp", artworkWidth: 96, artworkHeight: 96, href: "https://www.bicyclecoffeeco.com/" },
  { name: "Contraband Coffee Roasters", image: "contraband.webp", artworkWidth: 156, artworkHeight: 59, href: "https://contrabandcoffee.com/", dark: true },
  { name: "Cliff’s Variety", image: "cliffs-variety.webp", artworkWidth: 142, artworkHeight: 65, href: "https://www.cliffsvariety.com/" },
  { name: "FLAX art & design", image: "flax.webp", artworkWidth: 162, artworkHeight: 57, href: "https://flaxart.com/" },
  { name: "San Francisco Mercantile", image: "sf-mercantile.webp", artworkWidth: 102, artworkHeight: 90, href: "https://www.shopsfmercantile.com/" },
  { name: "Starfish Printing", image: "starfish.webp", artworkWidth: 194, artworkHeight: 48, href: "https://www.starfishprinting.com/", dark: true },
  { name: "Copy Edge Printing", image: "copy-edge.webp", artworkWidth: 169, artworkHeight: 54, href: "https://www.copyedge.com/" },
];

type Sponsor = { name: string; image: string; href: string; dark?: boolean; artworkWidth?: number; artworkHeight?: number };
function SponsorLink({ sponsor, duplicate = false }: { sponsor: Sponsor; duplicate?: boolean }) {
  return <a className={`sponsor-logo${sponsor.dark ? " sponsor-logo-dark" : ""}`} href={sponsor.href} target="_blank" rel="noopener noreferrer" aria-label={`${sponsor.name} (opens in a new tab)`} tabIndex={duplicate ? -1 : undefined} style={sponsor.artworkWidth ? {
    "--artwork-width": `${sponsor.artworkWidth}px`,
    "--artwork-height": `${sponsor.artworkHeight}px`,
  } as CSSProperties : undefined}>
    <Image src={`/sponsors/${sponsor.image}`} alt={sponsor.name} width={180} height={100} loading="eager" unoptimized />
  </a>;
}

export function SponsorStrip() {
  return <section id="sponsors" className="sponsors-section" aria-labelledby="sponsors-title">
    <div className="shell">
      <div className="sponsors-row">
        <div className="sponsors-fixed" aria-label="Main supporters">
          {mainSupporters.map(sponsor => <SponsorLink key={sponsor.name} sponsor={sponsor}/>)}
        </div>
        <div className="sponsors-scrolling">
      <div className="sponsors-heading">
        <h2 id="sponsors-title">With incredible support from the <span className="marker-highlight">local SF community</span></h2>

      </div>
        <div className="sponsors-marquee" id="sponsor-marquee">
          <div className="sponsors-track">
            <div className="sponsors-group">{sponsors.map(sponsor => <SponsorLink key={sponsor.name} sponsor={sponsor}/>)}</div>
            <div className="sponsors-group sponsors-duplicate" aria-hidden="true">{sponsors.map(sponsor => <SponsorLink key={sponsor.name} sponsor={sponsor} duplicate/>)}</div>
          </div>
        </div>
        </div>
      </div>
    </div>
  </section>;
}
