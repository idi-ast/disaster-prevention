import { memo, useMemo, useState, useCallback, useEffect } from "react";
import { Source, Layer, Popup, useMap } from "react-map-gl";
import type { CircleLayer, HeatmapLayer, SymbolLayer } from "react-map-gl";
import type { SismoTypes } from "@/features/sismos/types/sismos.type";

interface SismoLayerProps {
  sismos?: SismoTypes;
}

interface SelectedSismo {
  latitude: number;
  longitude: number;
  place: string;
  magnitude: number;
  level: string;
  depth: number;
}

const NIVEL_TEXT: Record<string, string> = {
  bajo: "text-yellow-400",
  medio: "text-orange-400",
  alto: "text-red-400",
  crítico: "text-red-600",
};

const heatLayer: HeatmapLayer = {
  id: "sismos-heat",
  type: "heatmap",
  source: "sismos-src",
  paint: {
    "heatmap-weight": [
      "interpolate",
      ["linear"],
      ["get", "magnitude"],
      2,
      0.2,
      8,
      1,
    ],
    "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 2, 0.6, 9, 2],
    "heatmap-color": [
      "interpolate",
      ["linear"],
      ["heatmap-density"],
      0,
      "rgba(0,0,0,0)",
      0.2,
      "rgba(253,224,71,0.5)",
      0.5,
      "rgba(251,146,60,0.7)",
      0.8,
      "rgba(239,68,68,0.85)",
      1,
      "rgba(220,38,38,1)",
    ],
    "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 2, 12, 9, 28],
    "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 7, 1, 9, 0],
  },
};

const clusterCircleLayer: CircleLayer = {
  id: "sismos-cluster",
  type: "circle",
  source: "sismos-src",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": [
      "step",
      ["get", "point_count"],
      "rgba(251,146,60,0.8)",
      20,
      "rgba(239,68,68,0.85)",
      100,
      "rgba(220,38,38,0.9)",
    ],
    "circle-radius": ["step", ["get", "point_count"], 18, 20, 26, 100, 34],
    "circle-stroke-width": 2,
    "circle-stroke-color": "rgba(255,255,255,0.25)",
  },
};

const clusterCountLayer: SymbolLayer = {
  id: "sismos-cluster-count",
  type: "symbol",
  source: "sismos-src",
  filter: ["has", "point_count"],
  layout: {
    "text-field": "{point_count_abbreviated}",
    "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
    "text-size": 12,
  },
  paint: { "text-color": "#fff" },
};

const circleLayer: CircleLayer = {
  id: "sismos-circle",
  type: "circle",
  source: "sismos-src",
  minzoom: 0,
  filter: ["!", ["has", "point_count"]],
  paint: {
    "circle-radius": [
      "match",
      ["get", "level"],
      "bajo",
      7,
      "medio",
      10,
      "alto",
      14,
      "crítico",
      18,
      7,
    ],
    "circle-color": [
      "match",
      ["get", "level"],
      "bajo",
      "rgba(253,224,71,0.5)",
      "medio",
      "rgba(251,146,60,0.5)",
      "alto",
      "rgba(239,68,68,0.5)",
      "crítico",
      "rgba(220,38,38,0.9)",
      "rgba(253,224,71,0.5)",
    ],

    "circle-stroke-width": 4,
    "circle-stroke-color": [
      "match",
      ["get", "level"],
      "bajo",
      "rgba(253,224,71,1)",
      "medio",
      "rgba(251,146,60,1)",
      "alto",
      "rgba(239,68,68,1)",
      "crítico",
      "rgba(220,38,38,1)",
      "rgba(253,224,71,1)",
    ],
    "circle-blur": 0.08,
  },
};

const EMPTY: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

const SismoLayer = memo(function SismoLayer({ sismos }: SismoLayerProps) {
  const { current: map } = useMap();
  const [selected, setSelected] = useState<SelectedSismo | null>(null);

  // react-map-gl llama setData() internamente cuando cambia data
  const geojson = useMemo(() => {
    if (!sismos?.data?.length) return EMPTY;
    return {
      type: "FeatureCollection" as const,
      features: sismos.data.map((s) => ({
        type: "Feature" as const,
        id: s.id,
        geometry: {
          type: "Point" as const,
          coordinates: [s.longitude, s.latitude] as [number, number],
        },
        properties: {
          place: s.place,
          magnitude: s.magnitude,
          level: s.level,
          depth: s.depth,
        },
      })),
    };
  }, [sismos]);

  const handleClusterClick = useCallback(
    (e: mapboxgl.MapMouseEvent) => {
      if (!map) return;
      const mi = map.getMap();
      const features = mi.queryRenderedFeatures(e.point, {
        layers: ["sismos-cluster"],
      });
      if (!features.length) return;
      const clusterId = features[0].properties?.cluster_id as number;
      const source = mi.getSource("sismos-src") as mapboxgl.GeoJSONSource;
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

    const onCircleClick = (e: mapboxgl.MapMouseEvent) => {
      const features = mi.queryRenderedFeatures(e.point, {
        layers: ["sismos-circle"],
      });
      if (!features.length) return;
      const p = features[0].properties as Record<string, unknown>;
      setSelected({
        latitude: e.lngLat.lat,
        longitude: e.lngLat.lng,
        place: String(p.place),
        magnitude: Number(p.magnitude),
        level: String(p.level),
        depth: Number(p.depth),
      });
    };

    const cursorOn = () => {
      mi.getCanvas().style.cursor = "pointer";
    };
    const cursorOff = () => {
      mi.getCanvas().style.cursor = "";
    };

    mi.on("click", "sismos-circle", onCircleClick);
    mi.on("click", "sismos-cluster", handleClusterClick);
    mi.on("mouseenter", "sismos-circle", cursorOn);
    mi.on("mouseleave", "sismos-circle", cursorOff);
    mi.on("mouseenter", "sismos-cluster", cursorOn);
    mi.on("mouseleave", "sismos-cluster", cursorOff);

    return () => {
      mi.off("click", "sismos-circle", onCircleClick);
      mi.off("click", "sismos-cluster", handleClusterClick);
      mi.off("mouseenter", "sismos-circle", cursorOn);
      mi.off("mouseleave", "sismos-circle", cursorOff);
      mi.off("mouseenter", "sismos-cluster", cursorOn);
      mi.off("mouseleave", "sismos-cluster", cursorOff);
    };
  }, [map, handleClusterClick]);

  return (
    <>
      <Source
        id="sismos-src"
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
      </Source>

      {selected && (
        <Popup
          latitude={selected.latitude}
          longitude={selected.longitude}
          anchor="bottom"
          onClose={() => setSelected(null)}
          closeOnClick={false}
          maxWidth="220px"
        >
          <div className="text-xs leading-snug p-1">
            <p className="font-semibold mb-1 truncate">{selected.place}</p>
            <p>
              Magnitud: <strong>M{selected.magnitude.toFixed(1)}</strong>
            </p>
            <p>
              Prof.: <strong>{selected.depth} km</strong>
            </p>
            <p>
              Nivel:{" "}
              <strong className={NIVEL_TEXT[selected.level] ?? ""}>
                {selected.level.toUpperCase()}
              </strong>
            </p>
          </div>
        </Popup>
      )}
    </>
  );
});

export default SismoLayer;
