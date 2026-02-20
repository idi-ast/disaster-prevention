import { memo, useMemo, useState, useCallback, useEffect } from "react";
import { Source, Layer, Popup, useMap } from "react-map-gl";
import type { CircleLayer, HeatmapLayer, SymbolLayer } from "react-map-gl";
import type { DesastresGlobalesTypes } from "@/features/desastresGlobales/types/desastesGlobales.type";

interface DesastresGlobalesLayerProps {
  desastres?: DesastresGlobalesTypes;
}

interface SelectedDesastre {
  latitude: number;
  longitude: number;
  title: string;
  category: string;
  description: string;
  url: string;
  level: string;
}

const NIVEL_TEXT: Record<string, string> = {
  bajo: "text-yellow-400",
  medio: "text-orange-400",
  alto: "text-red-400",
  crítico: "text-red-600",
};


function makeCategorySvg(bg: string, pathData: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="18" fill="${bg}" stroke="white" stroke-width="2.5"/>
    <path d="${pathData}" fill="white" stroke="white" stroke-width="0.5" stroke-linejoin="round" stroke-linecap="round"/>
  </svg>`;
}

const CATEGORY_ICONS: Record<string, string> = {
  //  Wildfires – flame
  Wildfires: makeCategorySvg(
    "#EA580C",
    "M20 9c-1 3-4 5-4 9 0 2.2 1.8 4 4 4s4-1.8 4-4c0-1.5-0.8-2.8-2-3.5 0.3 1-0.5 2-1.5 2-0.6 0-1-0.5-0.8-1.1C20.5 14 21 11.5 20 9z M17 22c0 1.7 1.3 3 3 3s3-1.3 3-3-1.3-3-3-3-3 1.3-3 3z",
  ),
  //  Floods – water drop
  Floods: makeCategorySvg("#2563EB", "M20 9l-7 12.5a7 7 0 0014 0L20 9z"),
  //  Severe Storms – lightning bolt
  "Severe Storms": makeCategorySvg(
    "#03e3fc",
    "M23 10h-7l-3.5 10h5.5l-4 11 12-14h-6z",
  ),
  //  Volcanoes – mountain with eruption
  Volcanoes: makeCategorySvg(
    "#DC2626",
    "M20 10l-10 18h20L20 10z M18 10l2-5 2 5 M15 7l1 3 M25 7l-1 3",
  ),
  //  Sea and Lake Ice – snowflake
  "Sea and Lake Ice": makeCategorySvg(
    "#0891B2",
    "M20 10v20 M10 20h20 M13.1 13.1l13.8 13.8 M26.9 13.1L13.1 26.9 M17 12l3 3 3-3 M17 28l3-3 3 3 M12 17l3 3-3 3 M28 17l-3 3 3 3",
  ),
  // 〰 Earthquakes – seismic zigzag
  Earthquakes: makeCategorySvg("#F97316", "M8 22h4l3-7 4 14 3-10 3 5h7"),
  //  Drought – sun
  Drought: makeCategorySvg(
    "#D97706",
    "M20 15a5 5 0 100 10 5 5 0 000-10z M20 9v3 M20 28v3 M9 20h3 M28 20h3 M12.5 12.5l2.1 2.1 M25.4 25.4l2.1 2.1 M12.5 27.5l2.1-2.1 M25.4 14.6l2.1-2.1",
  ),
  //  Dust and Haze – wavy lines
  "Dust and Haze": makeCategorySvg(
    "#6B7280",
    "M9 15q3-3 6 0t6 0 6 0 M9 20q3-3 6 0t6 0 6 0 M9 25q3-3 6 0t6 0 6 0",
  ),
  //  Landslides – falling triangle with rocks
  Landslides: makeCategorySvg(
    "#92400E",
    "M9 29h22 M11 23l7-14 5 9 3-4 6 9 M22 28a2 2 0 100-4 2 2 0 000 4z M16 28a1.5 1.5 0 100-3 1.5 1.5 0 000 3z",
  ),
  //  Snow – six-point snowflake
  Snow: makeCategorySvg(
    "#38BDF8",
    "M20 9v22 M10 15l17.3 10 M10 25l17.3-10 M17 11l3 4 3-4 M17 29l3-4 3 4 M11 18l4 2-4 2 M29 18l-4 2 4 2",
  ),
  //  Temperature Extremes – thermometer
  "Temperature Extremes": makeCategorySvg(
    "#EF4444",
    "M20 10c-1.7 0-3 1.3-3 3v9.5a5 5 0 106 0V13c0-1.7-1.3-3-3-3z M20 23a2 2 0 100 4 2 2 0 000-4z M20 10v12",
  ),
  //  Water Color – ripple waves
  "Water Color": makeCategorySvg(
    "#0EA5E9",
    "M10 17q3-4 6 0t6 0 8 0 M10 22q3-4 6 0t6 0 8 0 M10 27q3-4 6 0t6 0 8 0 M16 11a4 4 0 018 0",
  ),
  //  Manmade – factory/building
  Manmade: makeCategorySvg(
    "#475569",
    "M11 29V17l6-5v5l6-5v5l6-5v12H11z M17 29v-5h3v5z M22 29v-5h3v5z M13 22h3v2h-3z",
  ),
  // Default fallback
  default: makeCategorySvg(
    "#7C3AED",
    "M20 12a8 8 0 100 16 8 8 0 000-16z M20 16v5 M20 23v2",
  ),
};

const CATEGORY_ES: Record<string, string> = {
  Wildfires: "Incendios forestales",
  Floods: "Inundaciones",
  "Severe Storms": "Tormentas severas",
  Volcanoes: "Volcanes",
  "Sea and Lake Ice": "Hielo marino y lacustre",
  Earthquakes: "Terremotos",
  Drought: "Sequía",
  "Dust and Haze": "Polvo y neblina",
  Landslides: "Deslizamientos",
  Snow: "Nieve",
  "Temperature Extremes": "Temperaturas extremas",
  "Water Color": "Color del agua",
  Manmade: "Causas humanas",
};

function loadSvgImage(svgString: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
  });
}


const heatLayer: HeatmapLayer = {
  id: "desastres-heat",
  type: "heatmap",
  source: "desastres-src",
  paint: {
    "heatmap-weight": ["interpolate", ["linear"], ["zoom"], 2, 0.4, 9, 1],
    "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 2, 0.6, 9, 2],
    "heatmap-color": [
      "interpolate",
      ["linear"],
      ["heatmap-density"],
      0,
      "rgba(0,0,0,0)",
      0.2,
      "rgba(147,197,253,0.5)",
      0.5,
      "rgba(99,102,241,0.7)",
      0.8,
      "rgba(139,92,246,0.85)",
      1,
      "rgba(109,40,217,1)",
    ],
    "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 2, 12, 9, 28],
    "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 7, 1, 9, 0],
  },
};

const clusterCircleLayer: CircleLayer = {
  id: "desastres-cluster",
  type: "circle",
  source: "desastres-src",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": [
      "step",
      ["get", "point_count"],
      "rgba(99,102,241,0.8)",
      20,
      "rgba(139,92,246,0.85)",
      100,
      "rgba(109,40,217,0.9)",
    ],
    "circle-radius": ["step", ["get", "point_count"], 18, 20, 26, 100, 34],
    "circle-stroke-width": 2,
    "circle-stroke-color": "rgba(255,255,255,0.25)",
  },
};

const clusterCountLayer: SymbolLayer = {
  id: "desastres-cluster-count",
  type: "symbol",
  source: "desastres-src",
  filter: ["has", "point_count"],
  layout: {
    "text-field": "{point_count_abbreviated}",
    "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
    "text-size": 12,
  },
  paint: { "text-color": "#fff" },
};

const circleLayer: CircleLayer = {
  id: "desastres-circle",
  type: "circle",
  source: "desastres-src",
  minzoom: 0,
  filter: ["!", ["has", "point_count"]],
  paint: {
    "circle-radius": 22,
    "circle-color": "rgba(0,0,0,0)",
    "circle-stroke-width": 0,
  },
};

const iconLayer: SymbolLayer = {
  id: "desastres-icon",
  type: "symbol",
  source: "desastres-src",
  filter: ["!", ["has", "point_count"]],
  layout: {
    "icon-image": ["get", "category"],
    "icon-size": 1.3,
    "icon-allow-overlap": true,
    "icon-ignore-placement": true,
  },
};

const EMPTY: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

const DesastresGlobalesLayer = memo(function DesastresGlobalesLayer({
  desastres,
}: DesastresGlobalesLayerProps) {
  const { current: map } = useMap();
  const [selected, setSelected] = useState<SelectedDesastre | null>(null);
  const [iconsLoaded, setIconsLoaded] = useState(false);

  useEffect(() => {
    if (!map) return;
    const mi = map.getMap();

    const loadIcons = async () => {
      await Promise.all(
        Object.entries(CATEGORY_ICONS).map(async ([category, svg]) => {
          if (mi.hasImage(category)) return;
          try {
            const img = await loadSvgImage(svg);
            if (!mi.hasImage(category)) {
              mi.addImage(category, img, { pixelRatio: 2 });
            }
          } catch {
            try {
              const fallback = await loadSvgImage(CATEGORY_ICONS.default);
              if (!mi.hasImage(category)) {
                mi.addImage(category, fallback, { pixelRatio: 2 });
              }
            } catch {
              /* ignorar */
            }
          }
        }),
      );
      setIconsLoaded(true);
    };

    if (mi.isStyleLoaded()) {
      loadIcons();
    } else {
      mi.once("styledata", loadIcons);
    }
  }, [map]);

  const geojson = useMemo(() => {
    if (!desastres?.data?.length) return EMPTY;
    return {
      type: "FeatureCollection" as const,
      features: desastres.data.map((d) => ({
        type: "Feature" as const,
        id: d.id,
        geometry: {
          type: "Point" as const,
          coordinates: [d.longitude, d.latitude] as [number, number],
        },
        properties: {
          title: d.title,
          category: CATEGORY_ICONS[d.category] ? d.category : "default",
          description: d.description,
          url: d.url,
          level: d.level,
        },
      })),
    };
  }, [desastres]);

  const handleClusterClick = useCallback(
    (e: mapboxgl.MapMouseEvent) => {
      if (!map) return;
      const mi = map.getMap();
      const features = mi.queryRenderedFeatures(e.point, {
        layers: ["desastres-cluster"],
      });
      if (!features.length) return;
      const clusterId = features[0].properties?.cluster_id as number;
      const source = mi.getSource("desastres-src") as mapboxgl.GeoJSONSource;
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err || zoom == null) return;
        const coords = (features[0].geometry as GeoJSON.Point).coordinates as [
          number,
          number,
        ];
        mi.easeTo({ center: coords, zoom });
      });
    },
    [map],
  );

  useEffect(() => {
    if (!map) return;
    const mi = map.getMap();

    const onIconClick = (e: mapboxgl.MapMouseEvent) => {
      const features = mi.queryRenderedFeatures(e.point, {
        layers: ["desastres-icon"],
      });
      if (!features.length) return;
      const p = features[0].properties as Record<string, unknown>;
      setSelected({
        latitude: e.lngLat.lat,
        longitude: e.lngLat.lng,
        title: String(p.title),
        category: String(p.category),
        description: String(p.description),
        url: String(p.url),
        level: String(p.level),
      });
    };

    const cursorOn = () => {
      mi.getCanvas().style.cursor = "pointer";
    };
    const cursorOff = () => {
      mi.getCanvas().style.cursor = "";
    };

    mi.on("click", "desastres-icon", onIconClick);
    mi.on("click", "desastres-cluster", handleClusterClick);
    mi.on("mouseenter", "desastres-icon", cursorOn);
    mi.on("mouseleave", "desastres-icon", cursorOff);
    mi.on("mouseenter", "desastres-cluster", cursorOn);
    mi.on("mouseleave", "desastres-cluster", cursorOff);

    return () => {
      mi.off("click", "desastres-icon", onIconClick);
      mi.off("click", "desastres-cluster", handleClusterClick);
      mi.off("mouseenter", "desastres-icon", cursorOn);
      mi.off("mouseleave", "desastres-icon", cursorOff);
      mi.off("mouseenter", "desastres-cluster", cursorOn);
      mi.off("mouseleave", "desastres-cluster", cursorOff);
    };
  }, [map, handleClusterClick]);

  if (!iconsLoaded) return null;

  return (
    <>
      <Source
        id="desastres-src"
        type="geojson"
        data={geojson}
        cluster={false}
        clusterMaxZoom={9}
        clusterRadius={50}
        generateId={true}
      >
        <Layer {...heatLayer} />
        <Layer {...clusterCircleLayer} />
        <Layer {...clusterCountLayer} />
        <Layer {...circleLayer} />
        <Layer {...iconLayer} />
      </Source>

      {selected && (
        <Popup
          latitude={selected.latitude}
          longitude={selected.longitude}
          anchor="bottom"
          onClose={() => setSelected(null)}
          closeOnClick={false}
          maxWidth="240px"
        >
          <div className="text-xs leading-snug text-text-400 p-1">
            <p className="font-semibold mb-1 truncate">{selected.title}</p>
            <p>
              Categoría: <strong>{CATEGORY_ES[selected.category] ?? selected.category}</strong>
            </p>
            {selected.description && (
              <p className="mt-0.5 line-clamp-2">{selected.description}</p>
            )}
            <p className="mt-0.5">
              Nivel:{" "}
              <strong className={NIVEL_TEXT[selected.level] ?? ""}>
                {selected.level.toUpperCase()}
              </strong>
            </p>
            {selected.url && (
              <a
                href={selected.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline mt-1 block"
              >
                Ver más
              </a>
            )}
          </div>
        </Popup>
      )}
    </>
  );
});

export default DesastresGlobalesLayer;
