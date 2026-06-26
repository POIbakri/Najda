"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useI18n } from "@/components/i18n";

export interface MapPoint {
  lat: number;
  lng: number;
}

interface AlertMapProps {
  requester: MapPoint;
  responder?: MapPoint | null;
  accuracyM?: number | null;
  /** smaller chrome for cards */
  compact?: boolean;
  className?: string;
}

// Colored divIcons avoid Leaflet's broken default-marker image paths and match
// the design tokens (flare = the person in need, relief = help approaching).
function dot(color: string, label: string): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<span aria-label="${label}" style="display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:9999px;background:${color};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35)"></span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

const FLARE = "#E4451F";
const RELIEF = "#0E8C7A";

/**
 * Leaflet + OpenStreetMap (free, no API key). Plots the requester and, when
 * present, the approaching responder, smoothly refitting as the responder moves
 * — the "watch them approach" moment of the Locator Card.
 */
export function AlertMap({ requester, responder, accuracyM, compact, className }: AlertMapProps) {
  const { t } = useI18n();
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const reqMarker = useRef<L.Marker | null>(null);
  const resMarker = useRef<L.Marker | null>(null);
  const accCircle = useRef<L.Circle | null>(null);

  // init once
  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    const map = L.map(elRef.current, {
      zoomControl: !compact,
      attributionControl: true,
      dragging: !compact,
      scrollWheelZoom: false,
    }).setView([requester.lat, requester.lng], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(map);
    mapRef.current = map;

    // Leaflet measures the container at init; if it mounts hidden/animating or
    // the layout shifts (web font, card transition), tiles render half-filled.
    // Recompute on the first frames and on any container resize.
    map.invalidateSize(false);
    const t0 = setTimeout(() => map.invalidateSize(false), 150);
    const t1 = setTimeout(() => map.invalidateSize(false), 500);
    const ro = new ResizeObserver(() => map.invalidateSize(false));
    ro.observe(elRef.current);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // requester marker + accuracy circle
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!reqMarker.current) {
      reqMarker.current = L.marker([requester.lat, requester.lng], { icon: dot(FLARE, t("a11y.requesterMarker")) }).addTo(map);
    } else {
      reqMarker.current.setLatLng([requester.lat, requester.lng]);
    }
    if (accuracyM && accuracyM > 0) {
      if (!accCircle.current) {
        accCircle.current = L.circle([requester.lat, requester.lng], {
          radius: accuracyM,
          color: FLARE,
          weight: 1,
          fillColor: FLARE,
          fillOpacity: 0.1,
        }).addTo(map);
      } else {
        accCircle.current.setLatLng([requester.lat, requester.lng]).setRadius(accuracyM);
      }
    }
  }, [requester.lat, requester.lng, accuracyM]);

  // responder marker + refit to show both
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (responder) {
      if (!resMarker.current) {
        resMarker.current = L.marker([responder.lat, responder.lng], { icon: dot(RELIEF, t("a11y.responderMarker")) }).addTo(map);
      } else {
        resMarker.current.setLatLng([responder.lat, responder.lng]);
      }
      const bounds = L.latLngBounds([
        [requester.lat, requester.lng],
        [responder.lat, responder.lng],
      ]);
      // Respect prefers-reduced-motion: no fly animation when the user opts out.
      const reduce =
        typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (reduce) map.fitBounds(bounds.pad(0.4), { maxZoom: 15, animate: false });
      else map.flyToBounds(bounds.pad(0.4), { duration: 0.8, maxZoom: 15 });
    } else if (resMarker.current) {
      resMarker.current.remove();
      resMarker.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responder?.lat, responder?.lng, requester.lat, requester.lng]);

  return (
    <div
      ref={elRef}
      role="img"
      aria-label={t("a11y.map")}
      className={className ?? (compact ? "h-40 w-full" : "h-64 w-full")}
    />
  );
}
