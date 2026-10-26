import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

const STRIPES = [
  ["#FF6B6B", 42.44],
  ["#FFD23F", 35.31],
  ["#4CC9A0", 28.18],
  ["#5B9BFF", 21.05],
] as const;

function Rainbow({ width }: { width: number }) {
  return (
    <svg width={width} height={(width * 52) / 96} viewBox="2 10 96 52">
      {STRIPES.map(([c, r]) => (
        <path key={c} d={`M${50 - r} 58 A${r} ${r} 0 0 1 ${50 + r} 58`} fill="none" stroke={c} strokeWidth="7.13" />
      ))}
      <path transform="translate(50,54) scale(0.667)" d="M0 12 C-14 3 -15 -7 -10 -11 C-6 -14 -1 -12 0 -7 C1 -12 6 -14 10 -11 C15 -7 14 3 0 12Z" fill="#FF6B6B" />
    </svg>
  );
}

/** The picture shown when a page is shared on WhatsApp, Facebook and so on. */
export async function shareImage({ kicker, title, footer }: { kicker?: string; title: string; footer?: string }) {
  const font = await readFile(join(process.cwd(), "assets/Fredoka-Bold.ttf"));
  const long = title.length > 48;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#5B3FD1", color: "white", padding: 64, position: "relative", fontFamily: "Fredoka" }}>
        <div style={{ position: "absolute", right: -90, top: -90, width: 320, height: 320, borderRadius: 999, background: "#FF6B6B" }} />
        <div style={{ position: "absolute", right: 200, top: 150, width: 64, height: 64, borderRadius: 999, background: "#FFD23F" }} />
        <div style={{ display: "flex", alignItems: "flex-end", gap: 18, background: "white", borderRadius: 28, padding: "18px 28px 18px 20px", alignSelf: "flex-start" }}>
          <Rainbow width={150} />
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <span style={{ fontSize: 22, color: "#5B3FD1" }}>My</span>
            <span style={{ fontSize: 30, color: "#FF6B6B" }}>Little</span>
            <span style={{ fontSize: 38, color: "#5B3FD1" }}>Outings</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
          {kicker && <div style={{ fontSize: 32, color: "#FFD23F" }}>{kicker}</div>}
          <div style={{ fontSize: long ? 60 : 76, lineHeight: 1.05, marginTop: 10, maxWidth: 1000 }}>{title}</div>
          {footer && <div style={{ fontSize: 30, marginTop: 22, opacity: 0.85 }}>{footer}</div>}
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: [{ name: "Fredoka", data: font, weight: 700, style: "normal" }] },
  );
}
