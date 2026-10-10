"use client";

import Image from "next/image";
import lucasPortrait from "@/public/team/lucas-min.webp";
import larryPortrait from "@/public/team/larry-zhao.webp";
import { UsersRound } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const crew = [
  { name: "Krishna Bhatt", title: "Co-founder · Executive", photo: "/team/krishna.webp" },
  { name: "Govind Krishnan", title: "Co-founder · Executive" },
  { name: "Jaylen Lee", title: "Director · Community" },
  { name: "Lucas Min", title: "Director · Communications", photo: lucasPortrait },
  { name: "Manasvini Singh", title: "Director · Operations" },
  { name: "Larry Zhao", title: "Director · Education", photo: larryPortrait },
];

export function TeenCrewDialog() {
  return <Dialog>
    <DialogTrigger asChild>
      <button className="teen-crew-trigger" type="button">Meet the Teen Crew <UsersRound size={17} aria-hidden="true"/></button>
    </DialogTrigger>
    <DialogContent className="teen-crew-dialog" aria-describedby={undefined}>
      <DialogTitle className="sr-only">Meet the Teen Crew</DialogTitle>
      <p className="teen-crew-intro">We are a dedicated team of high school students committed to building a world where everyone can live their full lives. Through education, community events, and fundraising, we work to support people living with Alzheimer’s and Parkinson’s and their families.</p>
      <div className="teen-crew-grid">
        {crew.map(member => <article className="teen-crew-card" key={member.name}>
          <div className="teen-crew-portrait">
            {member.photo
              ? <Image src={member.photo} alt={`${member.name}’s portrait`} fill sizes="(max-width: 560px) 42vw, 240px" style={{ objectFit: "cover", objectPosition: "54% center" }}/>
              : <div className="teen-crew-placeholder" role="img" aria-label={`${member.name}’s portrait coming soon`}><span aria-hidden="true">{member.name[0]}</span><small aria-hidden="true">Portrait coming soon</small></div>}
          </div>
          <h3>{member.name}</h3>
          <p>{member.title}</p>
        </article>)}
      </div>
    </DialogContent>
  </Dialog>;
}
