"use client";

import { useEffect, useRef, useState } from "react";
import type { GlobeInstance } from "globe.gl";
import type { GeometryCollection, Topology } from "topojson-specification";
import { WONDERS, YEREVAN, type Wonder } from "@/data/wonders";

const COLORS = { new: "#3264FF", ancient: "#B8323A", home: "#FFF8F0" };

type Props = {
  selected: Wonder | null;
  onSelect: (wonder: Wonder) => void;
  lang: "hy" | "en";
};

// Spinning 3D Earth with the 14 wonders as pins and a line from Yerevan to the chosen one.
export default function WonderGlobe({ selected, onSelect, lang }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeInstance | null>(null);
  const onSelectRef = useRef(onSelect);
  const [ready, setReady] = useState(false);

  // Keep the latest click handler and hover-label language without rebuilding the globe.
  const langRef = useRef(lang);
  useEffect(() => {
    onSelectRef.current = onSelect;
    langRef.current = lang;
  }, [onSelect, lang]);

  // Build the globe once, in the browser only.
  useEffect(() => {
    let cancelled = false;
    let resizeObserver: ResizeObserver | undefined;

    (async () => {
      const [{ default: Globe }, THREE, topojson, countries] = await Promise.all([
        import("globe.gl"),
        import("three"),
        import("topojson-client"),
        import("world-atlas/countries-110m.json"),
      ]);
      if (cancelled || !containerRef.current) return;

      const topo = countries.default as unknown as Topology<{ countries: GeometryCollection }>;
      const land = topojson.feature(topo, topo.objects.countries);
      // The map data has a few zero-size shapes (one in North Korea) that break the dot drawing; drop them.
      for (const f of land.features) {
        if (f.geometry?.type === "MultiPolygon") {
          f.geometry.coordinates = f.geometry.coordinates.filter(
            (poly) => new Set(poly[0].map((pt) => pt.join(","))).size >= 3,
          );
        }
      }

      const el = containerRef.current;
      const globe = new Globe(el, { animateIn: true })
        .width(el.clientWidth)
        .height(el.clientHeight)
        .backgroundColor("rgba(0,0,0,0)")
        .showAtmosphere(true)
        .atmosphereColor("#3264FF")
        .atmosphereAltitude(0.18)
        .globeMaterial(new THREE.MeshPhongMaterial({ color: "#14213D", shininess: 8 }))
        // Land drawn as small dots; Armenia (ISO 051) glows brand.
        .hexPolygonsData(land.features)
        .hexPolygonResolution(3)
        .hexPolygonMargin(0.35)
        .hexPolygonUseDots(true)
        .hexPolygonColor((f) => ((f as { id?: string }).id === "051" ? "#3264FF" : "rgba(255,248,240,0.75)"))
        // Wonders as raised pins in two colors.
        .pointsData(WONDERS)
        .pointLat("lat")
        .pointLng("lng")
        .pointColor((w) => COLORS[(w as Wonder).group])
        .pointAltitude(0.07)
        .pointRadius(0.65)
        .pointsMerge(false)
        .pointLabel((w) => {
          const wonder = w as Wonder;
          return `<div style="background:#fff;color:#14213D;padding:6px 10px;border-radius:10px;font:600 13px system-ui;box-shadow:0 4px 14px rgba(0,0,0,.2)">${wonder.name[langRef.current]}</div>`;
        })
        .onPointClick((w) => onSelectRef.current(w as Wonder))
        // Pulsing ring on Yerevan.
        .ringsData([YEREVAN])
        .ringColor(() => (t: number) => `rgba(242,140,40,${1 - t})`)
        .ringMaxRadius(4)
        .ringPropagationSpeed(2)
        .ringRepeatPeriod(1400)
        .arcColor(() => ["#FFF8F0", "#3264FF"])
        .arcDashLength(0.4)
        .arcDashGap(0.15)
        .arcDashAnimateTime(1800)
        .arcStroke(0.6)
        .pointOfView({ lat: 35, lng: 40, altitude: 2.3 });

      const controls = globe.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.6;
      controls.enableZoom = false;

      resizeObserver = new ResizeObserver(() => globe.width(el.clientWidth).height(el.clientHeight));
      resizeObserver.observe(el);

      globeRef.current = globe;
      setReady(true);
    })();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      globeRef.current?._destructor();
      globeRef.current = null;
    };
  }, []);

  // Fly to the chosen wonder and draw the trip line from Yerevan.
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe || !selected) return;
    globe.controls().autoRotate = false;
    globe.pointOfView({ lat: selected.lat, lng: selected.lng, altitude: 1.8 }, 1200);
    globe.arcsData([
      { startLat: YEREVAN.lat, startLng: YEREVAN.lng, endLat: selected.lat, endLng: selected.lng },
    ]);
  }, [selected, ready]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full cursor-grab active:cursor-grabbing" />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-48 w-48 animate-pulse rounded-full bg-panel/80" />
        </div>
      )}
    </div>
  );
}
