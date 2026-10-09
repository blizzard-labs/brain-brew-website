"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DonationDialog } from "@/components/donation-dialog";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const links = [
  { href: "#weekend", label: "The events" },
  { href: "#updates", label: "Live updates" },
  { href: "#plan", label: "Plan your visit" },
];

function RegisterButton() {
  return <Button asChild className="register"><a href="https://forms.gle/TBYodKPwEr8REew2A" target="_blank" rel="noreferrer">Register Free <ArrowRight size={16}/></a></Button>;
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".site-header");
    const hero = document.querySelector<HTMLElement>(".hero-section");
    const main = header?.closest("main");
    if (!header || !hero || !main) return;
    const updateBackground = () => main.style.setProperty("--hero-background-height", `${header.offsetHeight + hero.offsetHeight}px`);
    const observer = new ResizeObserver(updateBackground);
    observer.observe(header);
    observer.observe(hero);
    updateBackground();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 8);
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 901px)");
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  return <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
    <div className="live-strip"><span /> Live participant guide · details may be updated</div>
    <nav className="nav shell" aria-label="Main navigation">
      <a className="brand" href="#top">Brain Brew Ride SF</a>
      <div className="nav-links">{links.map(link => <a key={link.href} href={link.href}>{link.label}</a>)}</div>
      <div className="nav-actions">
        <RegisterButton />
        <span className="donate-action"><DonationDialog size="default" className="header-donate"/></span>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="mobile-menu-trigger" aria-label="Open navigation menu"><Menu size={26} aria-hidden="true"/></button>
        </SheetTrigger>
        <SheetContent className="mobile-menu-panel" aria-describedby={undefined}>
          <SheetHeader><SheetTitle className="brand">Brain Brew Ride SF</SheetTitle></SheetHeader>
          <nav className="mobile-menu-links" aria-label="Mobile navigation">
            {links.map(link => <SheetClose asChild key={link.href}><a href={link.href}>{link.label}</a></SheetClose>)}
          </nav>
          <div className="mobile-menu-actions"><RegisterButton/><DonationDialog size="default"/></div>
        </SheetContent>
      </Sheet>
    </nav>
  </header>;
}
