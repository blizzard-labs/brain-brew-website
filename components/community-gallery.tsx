import Image from "next/image";
import { TeenCrewDialog } from "@/components/teen-crew-dialog";

const photos = [
  { file: "img_5203", alt: "Two people smiling through the handmade Brain Brew photo frame", tilt: "-5deg" },
  { file: "img_5206", alt: "A family with a baby posing in the Brain Brew photo frame", tilt: "4deg" },
  { file: "img_5207", alt: "A group sharing a sunset moment in the Brain Brew photo frame", tilt: "3deg" },
  { file: "img_5212", alt: "A person and a dog posing together in the Brain Brew photo frame", tilt: "-4deg" },
  { file: "img_5215-2", alt: "Two supporters with the Brain Brew photo frame in a sunny park", tilt: "5deg" },
  { file: "img_5217", alt: "Two people holding the Brain Brew photo frame at golden hour", tilt: "-4deg" },
  { file: "img_5218-2", alt: "Two young people posing in the Brain Brew photo frame", tilt: "3deg" },
];

function Snapshot({ photo }: { photo: typeof photos[number] }) {
  return <figure className="community-snapshot" style={{ rotate: photo.tilt }}>
    <Image src={`/gallery/${photo.file}.webp`} width={800} height={600} sizes="(max-width: 600px) 42vw, (max-width: 900px) 20vw, 210px" alt={photo.alt}/>
  </figure>;
}

export function CommunityGallery() {
  return <div className="community-gallery" role="group" aria-label="Brain Brew community photo gallery">
    <div className="community-gallery-side community-gallery-left">
      {photos.slice(0, 4).map(photo => <Snapshot photo={photo} key={photo.file}/>)}
    </div>
    <figure className="community-snapshot community-city-hall">
      <Image src="/gallery/city-hall.webp" width={720} height={1007} sizes="(max-width: 600px) 65vw, 320px" alt="Three Brain Brew participants in front of San Francisco City Hall illuminated purple at night"/>
      <figcaption><TeenCrewDialog/></figcaption>
    </figure>
    <div className="community-gallery-side community-gallery-right">
      {photos.slice(4).map(photo => <Snapshot photo={photo} key={photo.file}/>)}
    </div>
  </div>;
}
