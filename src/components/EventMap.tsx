"use client";

import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { PublicEvent } from "@/db/queries";
import type { LatLng } from "@/lib/geo";

const TILES =
  process.env.NEXT_PUBLIC_MAP_TILES ?? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

function css(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

/** Zooms to show "you" and the closest few events together. */
function Recenter({ origin, nearest }: { origin: LatLng | null; nearest: LatLng[] }) {
  const map = useMap();
  const key = origin ? `${origin.lat},${origin.lng}|${nearest.map((p) => `${p.lat},${p.lng}`).join(";")}` : "";
  useEffect(() => {
    if (!origin) return;
    const pts: [number, number][] = [[origin.lat, origin.lng], ...nearest.map((p) => [p.lat, p.lng] as [number, number])];
    // The map may have been hidden until now (phones), so let it measure itself first.
    const t = setTimeout(() => {
      map.invalidateSize();
      const size = map.getSize();
      if (!size.x || !size.y) return;
      if (pts.length === 1) map.setView(pts[0], 14);
      else map.fitBounds(pts, { padding: [36, 36], maxZoom: 15 });
    }, 50);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
}

type Props = {
  events: PublicEvent[];
  center: LatLng;
  zoom: number;
  origin: LatLng | null;
  /** The closest events to `origin`, drawn larger. */
  nearestIds?: number[];
  highlighted: number | null;
  onHover: (id: number | null) => void;
};

export default function EventMap({ events, center, zoom, origin, nearestIds = [], highlighted, onHover }: Props) {
  const router = useRouter();
  const colors = {
    free: css("--yolk", "#ffd23f"),
    paid: css("--paid", "#b3261e"),
    ring: css("--cobalt", "#5b3fd1"),
    surface: css("--surface", "#fff"),
    you: css("--coral", "#ff6b6b"),
  };
  const nearest = nearestIds.map((id) => events.find((e) => e.id === id)).filter((e): e is PublicEvent => !!e);

  // Featured pins draw last so they sit on top.
  const ordered = [...events].sort((a, b) => Number(a.featured) - Number(b.featured));

  return (
    <MapContainer center={[center.lat, center.lng]} zoom={zoom} scrollWheelZoom={false} className="h-full w-full rounded-xl">
      <TileLayer url={TILES} attribution={ATTRIBUTION} />
      <Recenter origin={origin} nearest={nearest} />
      {ordered.map((e) => {
        const hl = highlighted === e.id;
        const close = nearestIds.includes(e.id);
        return (
          <CircleMarker
            key={e.id}
            center={[e.lat, e.lng]}
            radius={hl ? 12 : close ? 10 : e.featured ? 9 : 7}
            pathOptions={{
              color: e.featured || close ? colors.ring : colors.surface,
              weight: e.featured || close ? 3 : 2,
              fillColor: e.isFree ? colors.free : colors.paid,
              fillOpacity: 1,
            }}
            eventHandlers={{
              click: () => router.push(`/events/${e.slug}`),
              mouseover: () => onHover(e.id),
              mouseout: () => onHover(null),
            }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              <strong>{e.title}</strong>
              <br />
              {e.venue}
            </Tooltip>
          </CircleMarker>
        );
      })}
      {/* "You" goes last so it sits on top of the event pins. */}
      {origin && (
        <CircleMarker center={[origin.lat, origin.lng]} radius={10} pathOptions={{ color: colors.surface, weight: 3, fillColor: colors.you, fillOpacity: 1 }}>
          <Tooltip permanent direction="top" offset={[0, -10]}>
            You are here
          </Tooltip>
        </CircleMarker>
      )}
    </MapContainer>
  );
}
