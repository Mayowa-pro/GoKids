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

function Recenter({ origin }: { origin: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (origin) map.flyTo([origin.lat, origin.lng], Math.max(map.getZoom(), 13), { duration: 0.6 });
  }, [origin, map]);
  return null;
}

type Props = {
  events: PublicEvent[];
  center: LatLng;
  zoom: number;
  origin: LatLng | null;
  highlighted: number | null;
  onHover: (id: number | null) => void;
};

export default function EventMap({ events, center, zoom, origin, highlighted, onHover }: Props) {
  const router = useRouter();
  const colors = { free: css("--yolk", "#ffcc33"), paid: css("--paid", "#6d43cf"), ring: css("--cobalt", "#1f4fbf"), surface: css("--surface", "#fff") };

  // Featured pins draw last so they sit on top.
  const ordered = [...events].sort((a, b) => Number(a.featured) - Number(b.featured));

  return (
    <MapContainer center={[center.lat, center.lng]} zoom={zoom} scrollWheelZoom={false} className="h-full w-full rounded-xl">
      <TileLayer url={TILES} attribution={ATTRIBUTION} />
      <Recenter origin={origin} />
      {origin && (
        <CircleMarker center={[origin.lat, origin.lng]} radius={6} pathOptions={{ color: colors.surface, weight: 2, fillColor: colors.ring, fillOpacity: 1 }}>
          <Tooltip>You</Tooltip>
        </CircleMarker>
      )}
      {ordered.map((e) => {
        const hl = highlighted === e.id;
        return (
          <CircleMarker
            key={e.id}
            center={[e.lat, e.lng]}
            radius={hl ? 12 : e.featured ? 9 : 7}
            pathOptions={{
              color: e.featured ? colors.ring : colors.surface,
              weight: e.featured ? 3 : 2,
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
    </MapContainer>
  );
}
