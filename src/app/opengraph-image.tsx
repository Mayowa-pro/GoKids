import { OG_SIZE, shareImage } from "@/lib/og";

export const alt = "My Little Outings: things to do with kids in Stoke-on-Trent";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return shareImage({ kicker: "Stoke-on-Trent", title: "Things to do with kids, all in one place", footer: "Free and paid family events · always free for parents" });
}
