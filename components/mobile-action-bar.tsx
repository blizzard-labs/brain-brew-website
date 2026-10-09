"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DonationDialog } from "@/components/donation-dialog";

export function MobileActionBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const actions = document.querySelector(".hero-actions");
    if (!actions) return;
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(!entry.isIntersecting && entry.boundingClientRect.bottom <= 0);
    });
    observer.observe(actions);
    return () => observer.disconnect();
  }, []);

  return <nav className="mobile-action-bar" aria-label="Register or donate" hidden={!visible}>
    <Button asChild className="register"><a href="https://forms.gle/TBYodKPwEr8REew2A" target="_blank" rel="noreferrer">Register Free <ArrowRight aria-hidden="true"/></a></Button>
    <DonationDialog size="default"/>
  </nav>;
}
