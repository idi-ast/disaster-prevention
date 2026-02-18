import React, { useState } from "react";
import { IconMapCog, IconRosetteDiscountCheck } from "@tabler/icons-react";
import type { LayerSelectorProps, MapLayer } from "../types";

const LayerSelector: React.FC<LayerSelectorProps> = ({
  selectedLayer,
  onLayerChange,
  mapLayers,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleLayerSelect = (layer: MapLayer) => {
    onLayerChange(layer);
    setShowMenu(false);
  };

  return (
    <div className="z-50">
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="bg-bg-300 gap-2 text-text-100 hover:bg-bg-200 h-8 w-8 flex justify-center items-center transition-all"
        >
          <IconMapCog size={20} />
        </button>

        {showMenu && (
          <>
            {/* Overlay para cerrar el menú al hacer clic fuera */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />

            <div className="absolute top-12 right-0 bg-bg-100 border border-border rounded-lg shadow-xl p-3 min-w-60 z-50">
              {/* Capa seleccionada actual */}
              <div className="flex gap-2 font-medium mb-3 border border-border p-2 justify-center items-center rounded text-text-100">
                {mapLayers[selectedLayer].icon}
                {mapLayers[selectedLayer].name}
                <IconRosetteDiscountCheck size={20} className="text-lime-300" />
              </div>

              {/* Lista de capas */}
              {Object.entries(mapLayers).map(([key, layer]) => (
                <button
                  key={key}
                  onClick={() => handleLayerSelect(key as MapLayer)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors rounded mb-1 ${
                    selectedLayer === key
                      ? "bg-100 text-text-100"
                      : "hover:bg-100 text-text-200 hover:text-text-100"
                  }`}
                >
                  {layer.icon}
                  <span className="font-medium">{layer.name}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LayerSelector;
