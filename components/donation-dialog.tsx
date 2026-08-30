"use client";

import type { ComponentProps } from "react";
import { ArrowUpRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const donationOptions = [
  {
    name: "Alzheimer’s Association",
    description: "Support families affected by Alzheimer’s and help advance care and research.",
    href: "https://events.alz.org/fundraisers/krishnabhatt/brain-brew",
    className: "alzheimers",
  },
  {
    name: "Michael J. Fox Foundation",
    description: "Help accelerate Parkinson’s research and progress toward a cure.",
    href: "https://give.michaeljfox.org/BrainBrew",
    className: "michael-j-fox",
  },
];

type DonationDialogProps = Pick<ComponentProps<typeof Button>, "className" | "size">;

export function DonationDialog({ className, size = "lg" }: DonationDialogProps = {}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={size} className={`donate-button ${className ?? ""}`}>
          <Heart aria-hidden="true" /> Donate
        </Button>
      </DialogTrigger>
      <DialogContent className="donation-dialog">
        <DialogHeader>
          <div className="donation-icon" aria-hidden="true">
            <Heart />
          </div>
          <DialogTitle>Choose where to make an impact</DialogTitle>
          <DialogDescription>
            Both official Brain Brew fundraisers directly support people affected by
            Alzheimer’s and Parkinson’s.
          </DialogDescription>
        </DialogHeader>
        <div className="donation-options">
          {donationOptions.map((option) => (
            <a
              className={`donation-option ${option.className}`}
              href={option.href}
              key={option.name}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>
                <strong>{option.name}</strong>
                <small>{option.description}</small>
              </span>
              <ArrowUpRight aria-hidden="true" />
            </a>
          ))}
        </div>
        <p className="donation-note">Donation pages open in a new tab.</p>
      </DialogContent>
    </Dialog>
  );
}
