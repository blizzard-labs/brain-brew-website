"use client";

import type { ComponentProps } from "react";
import Image from "next/image";
import { ArrowUpRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MatchedGiftForm } from "@/components/matched-gift-form";

const donationOptions = [
  {
    name: "Alzheimer’s Association",
    href: "http://act.alz.org/goto/brainbrew",
    logo: "/donations/alzheimers-association.svg",
  },
  {
    name: "Michael J. Fox Foundation",
    href: "https://give.michaeljfox.org/BrainBrew",
    logo: "/donations/michael-j-fox-foundation.svg",
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
      <DialogContent
        className="donation-dialog"
        aria-describedby={undefined}
        // Focus the dialog itself so opening it doesn't pop up the mobile keyboard.
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          (event.currentTarget as HTMLElement).focus();
        }}
      >
        <DialogTitle className="sr-only">Donate to a Brain Brew fundraiser</DialogTitle>
        <div className="donation-options">
          {donationOptions.map((option) => (
            <a
              className="donation-option"
              href={option.href}
              key={option.name}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image src={option.logo} alt={option.name} width={300} height={60} unoptimized />
              <ArrowUpRight aria-hidden="true" />
            </a>
          ))}
        </div>
        <p className="donation-note">
          Many employers match charitable gifts. Check with yours to double your impact!
        </p>
        <MatchedGiftForm />
      </DialogContent>
    </Dialog>
  );
}
