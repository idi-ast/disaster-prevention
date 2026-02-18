import { Marker } from "react-map-gl";
import MarkerSismo from "./markers/MarkerSismo";
import type { SismoData } from "../types/sismo.types";

interface SismoLayerProps {
  sismos: SismoData[];
}

function SismoLayer({ sismos }: SismoLayerProps) {
  return (
    <>
      {sismos.map((sismo) => (
        <Marker
          key={sismo.id}
          latitude={sismo.coordenadas.latitude}
          longitude={sismo.coordenadas.longitude}
          anchor="center"
        >
          <MarkerSismo
            magnitud={sismo.magnitud}
            nivel={sismo.nivel}
            zona={sismo.zona}
          />
        </Marker>
      ))}
    </>
  );
}

export default SismoLayer;
