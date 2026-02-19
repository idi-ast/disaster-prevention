import { memo, useEffect, useRef, useState, useMemo } from "react";
import { useMap, Popup } from "react-map-gl";
import proj4 from "proj4";
import type { DangerZoneTypes } from "@/features/dangerzone/types/dangerZone.type";

// EPSG:32721 = UTM Zona 21 Sur
const UTM21S = "+proj=utm +zone=21 +south +datum=WGS84 +units=m +no_defs";
const WGS84 = "+proj=longlat +datum=WGS84 +no_defs";

// Convierte par UTM → [lng, lat] — llamado por transformCoords
function utmToWgs84(coord: number[]): [number, number] {
  return proj4(UTM21S, WGS84, [coord[0], coord[1]]) as [number, number];
}

// Recorre recursivamente anillo / polígono / multipolígono
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformCoords(coords: any): any {
  if (typeof coords[0] === "number") return utmToWgs84(coords);
  return coords.map(transformCoords);
}

const SOURCE_ID = "danger-zones-src";
const LAYER_FILL = "danger-zones-fill";
const LAYER_LINE = "danger-zones-line";

interface DangerZoneLayerProps {
  dangerZones?: DangerZoneTypes;
}

interface SelectedZone {
  longitude: number;
  latitude: number;
  dpto: string;
  distrito: string;
  clave: string;
}

const EMPTY_FC: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };

// Construye el GeoJSON transformado — solo se llama desde useMemo
function buildGeojson(dangerZones?: DangerZoneTypes): GeoJSON.FeatureCollection {
  if (!dangerZones?.features?.length) return EMPTY_FC;
  return {
    type: "FeatureCollection",
    features: dangerZones.features.map((f) => ({
      type: "Feature" as const,
      geometry: {
        type: f.geometry.type,
        coordinates: transformCoords(f.geometry.coordinates),
      } as GeoJSON.Geometry,
      properties: f.properties,
    })),
  };
}

const DangerZoneLayer = memo(({ dangerZones }: DangerZoneLayerProps) => {
  const { current: map } = useMap();
  const [selectedZone, setSelectedZone] = useState<SelectedZone | null>(null);
  const readyRef = useRef(false);

  // ✅ La transformación UTM→WGS84 ocurre UNA SOLA VEZ cuando cambia dangerZones
  const geojson = useMemo(() => buildGeojson(dangerZones), [dangerZones]);

  // Configura source + layers de forma imperativa una sola vez
  useEffect(() => {
    const mapbox = map?.getMap();
    if (!mapbox) return;

    const setup = () => {
      if (readyRef.current) return;
      readyRef.current = true;

      // Limpia si ya existía (reuseMaps puede dejar residuos)
      if (mapbox.getLayer(LAYER_FILL)) mapbox.removeLayer(LAYER_FILL);
      if (mapbox.getLayer(LAYER_LINE)) mapbox.removeLayer(LAYER_LINE);
      if (mapbox.getSource(SOURCE_ID)) mapbox.removeSource(SOURCE_ID);

      mapbox.addSource(SOURCE_ID, {
        type: "geojson",
        data: EMPTY_FC,
      });

      mapbox.addLayer({
        id: LAYER_FILL,
        type: "fill",
        source: SOURCE_ID,
        paint: {
          "fill-color": "#3cb2dd",
          "fill-opacity": 0.3,
        },
      });

      mapbox.addLayer({
        id: LAYER_LINE,
        type: "line",
        source: SOURCE_ID,
        paint: {
          "line-color": "#3cb2dd",
          "line-width": 1,
          "line-opacity": 1,
        },
      });

      console.log("[DangerZoneLayer] source y layers añadidos al mapa");
    };

    if (mapbox.isStyleLoaded()) {
      setup();
    } else {
      mapbox.once("styledata", setup);
    }

    const onClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      const f = e.features?.[0];
      if (!f) return;
      const p = f.properties as { DPTO_DESC: string; DIST_DESC_: string; CLAVE: string };
      setSelectedZone({
        longitude: e.lngLat.lng,
        latitude: e.lngLat.lat,
        dpto: p.DPTO_DESC ?? "—",
        distrito: p.DIST_DESC_ ?? "—",
        clave: p.CLAVE ?? "—",
      });
    };
    const onEnter = () => { mapbox.getCanvas().style.cursor = "pointer"; };
    const onLeave = () => { mapbox.getCanvas().style.cursor = ""; };

    mapbox.on("click", LAYER_FILL, onClick);
    mapbox.on("mouseenter", LAYER_FILL, onEnter);
    mapbox.on("mouseleave", LAYER_FILL, onLeave);

    return () => {
      mapbox.off("click", LAYER_FILL, onClick);
      mapbox.off("mouseenter", LAYER_FILL, onEnter);
      mapbox.off("mouseleave", LAYER_FILL, onLeave);
      try {
        if (mapbox.getLayer(LAYER_FILL)) mapbox.removeLayer(LAYER_FILL);
        if (mapbox.getLayer(LAYER_LINE)) mapbox.removeLayer(LAYER_LINE);
        if (mapbox.getSource(SOURCE_ID)) mapbox.removeSource(SOURCE_ID);
      } catch { /* ignorar errores de cleanup */ }
      readyRef.current = false;
    };
  }, [map]);

  useEffect(() => {
    const mapbox = map?.getMap();
    if (!mapbox || !readyRef.current) return;

    const source = mapbox.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    if (!source) return;

    source.setData(geojson);
  }, [map, geojson]);

  return selectedZone ? (
    <Popup
      longitude={selectedZone.longitude}
      latitude={selectedZone.latitude}
      anchor="bottom"
      closeButton={true}
      closeOnClick={false}
      onClose={() => setSelectedZone(null)}
    >
      <div className="text-sm text-gray-800 min-w-40">
        <p className="font-semibold text-base mb-1">{selectedZone.distrito}</p>
        <p className="text-gray-500 text-xs mb-2">{selectedZone.dpto}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Clave:</span>
          <span className="font-bold text-red-600">{selectedZone.clave}</span>
        </div>
      </div>
    </Popup>
  ) : null;
});

DangerZoneLayer.displayName = "DangerZoneLayer";

export default DangerZoneLayer;
