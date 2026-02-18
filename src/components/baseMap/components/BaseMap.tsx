import React, { useRef, useCallback, useMemo, useState } from "react";
import ReactMapGL from "react-map-gl";
import type { MapRef } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  IconMap,
  IconSatellite,
  IconWorld,
  IconMapPin,
} from "@tabler/icons-react";

import CustomZoomControl from "./CustomZoomControl";
import ViewControls from "./ViewControls";
import LayerSelector from "./LayerSelector";
import { MAPBOX_TOKEN, DEFAULT_CENTER, MAP_ZOOM_LEVEL } from "../libs";
import type { BaseMapProps, MapLayer, MapLayerConfig } from "../types";

const BaseMap: React.FC<BaseMapProps> = ({
  children,
  initialCenter = DEFAULT_CENTER,
  initialZoom = MAP_ZOOM_LEVEL,
  onMapRef,
}) => {
  const mapRef = useRef<MapRef>(null);
  const [selectedLayer, setSelectedLayer] = useState<MapLayer>("satellite");

  const mapLayers = useMemo<Record<MapLayer, MapLayerConfig>>(
    () => ({
      street: {
        name: "Mapa de Calles",
        icon: <IconMap size={20} />,
        style: "mapbox://styles/mapbox/streets-v12",
      },
      dark: {
        name: "Mapa Oscuro",
        icon: <IconWorld size={20} />,
        style: "mapbox://styles/mapbox/dark-v11",
      },
      satellite: {
        name: "Satelital Clásico",
        icon: <IconSatellite size={20} />,
        style: "mapbox://styles/mapbox/satellite-streets-v12",
      },
      smooth: {
        name: "Satelital Clear",
        icon: <IconMapPin size={20} />,
        style: "mapbox://styles/mapbox/satellite-v9",
      },
    }),
    []
  );

  const handleMapLoad = useCallback(() => {
    onMapRef?.(mapRef.current);
  }, [onMapRef]);

  const handleLayerChange = useCallback((layer: MapLayer) => {
    setSelectedLayer(layer);
  }, []);

  return (
    <div className="w-full h-full relative">
      <ReactMapGL
        ref={mapRef}
        initialViewState={{
          longitude: initialCenter.longitude,
          latitude: initialCenter.latitude,
          zoom: initialZoom,
          pitch: 0,
          bearing: 0,
        }}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={mapLayers[selectedLayer].style}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
        reuseMaps
        maxPitch={85}
        renderWorldCopies={false}
        optimizeForTerrain={false}
        fadeDuration={0}
        onLoad={handleMapLoad}
      >
        <div className="absolute right-0 top-0 z-10 bg-bg-100 h-full flex flex-col gap-2 p-2">
          {/* Controles de navegación nativos */}
          {/* <NavigationControl position="top-right" showCompass={true} /> */}

          {/* Selector de capas */}
          <LayerSelector
            selectedLayer={selectedLayer}
            onLayerChange={handleLayerChange}
            mapLayers={mapLayers}
          />

          {/* Controles de vista */}
          <ViewControls
            mapRef={mapRef}
            initialCenter={initialCenter}
            initialZoom={initialZoom}
          />

          {/* Controles de zoom personalizados */}
          <CustomZoomControl mapRef={mapRef} />

          <div className="flex justify-center items-center h-full">
            <span className="[writing-mode:vertical-rl] truncate rotate-180 text-base tracking-[0.3em] text-text-300 font-light">
              Configuración Mapa
            </span>
          </div>
        </div>

        {/* Contenido adicional (markers, layers, etc.) */}
        {children}
      </ReactMapGL>
    </div>
  );
};

export default BaseMap;
