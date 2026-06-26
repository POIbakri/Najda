"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ALQUAA_CENTER } from "@/lib/config";
import { useI18n } from "@/components/i18n";

const FLARE = "#E4451F";

function dot(): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:26px;height:26px;border-radius:9999px;background:${FLARE};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35)"></span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

/** Tap or drag to set your exact location when GPS fails (manual-pin fallback). */
export function ManualPinMap({
  initial,
  onChange,
}: {
  initial?: { lat: number; lng: number } | null;
  onChange: (p: { lat: number; lng: number }) => void;
}) {
  const { t } = useI18n();
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    const start = initial ?? ALQUAA_CENTER;
    const map = L.map(elRef.current, { scrollWheelZoom: false }).setView([start.lat, start.lng], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(map);

    const marker = L.marker([start.lat, start.lng], { icon: dot(), draggable: true }).addTo(map);
    markerRef.current = marker;
    onChange({ lat: start.lat, lng: start.lng });

    marker.on("dragend", () => {
      const { lat, lng } = marker.getLatLng();
      onChange({ lat, lng });
    });
    map.on("click", (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    mapRef.current = map;

    // Recompute size after mount / on resize so tiles fill the container.
    map.invalidateSize(false);
    const t0 = setTimeout(() => map.invalidateSize(false), 150);
    const ro = new ResizeObserver(() => map.invalidateSize(false));
    ro.observe(elRef.current);

    return () => {
      clearTimeout(t0);
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={elRef} className="h-64 w-full rounded-card" role="application" aria-label={t("a11y.manualPin")} />;
}
