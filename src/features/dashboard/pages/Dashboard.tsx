import BottomBar from "@/components/bars/BottomBar";
import RightBar from "@/components/bars/RightBar";
import BaseMap from "@/components/baseMap/components/BaseMap";
import { BarChartWrapper } from "@/libs/recharts";
// import { Marker } from "react-map-gl";
// import MarkerSensor from "@/features/dashboard/components/markers/MarkerSensor";
import SismoLayer from "../components/SismoLayer";
import DangerZoneLayer from "../components/DangerZoneLayer";
import SismoResumen from "../components/SismoResumen";
import { useSismos } from "@/features/sismos/hooks/useSismos";
import type {
  SismoData,
  SismoIntensidad,
  SismoResumenStats,
} from "../types/sismo.types";
import type { Data } from "@/features/sismos/types/sismos.type";
import { useEffect, useState } from "react";
import { useDangerZones } from "@/features/dangerzone/hooks/useDangerZones";

function getMagnitudIntensidad(magnitude: number): SismoIntensidad {
  if (magnitude < 2.0) return "imperceptible";
  if (magnitude < 4.0) return "débil";
  if (magnitude < 5.0) return "moderado";
  if (magnitude < 6.0) return "fuerte";
  return "severo";
}

function mapToSismoData(data: Data[]): SismoData[] {
  return data.map((s) => ({
    id: s.id,
    zona: s.place,
    descripcionZona: "",
    magnitud: s.magnitude,
    intensidad: getMagnitudIntensidad(s.magnitude),
    nivel: s.level,
    profundidad: s.depth,
    movimientos: 1,
    coordenadas: { latitude: s.latitude, longitude: s.longitude },
    ultimoRegistro: s.time,
  }));
}

function computeStats(sismos: SismoData[]): SismoResumenStats {
  const nivelOrder = ["bajo", "medio", "alto", "crítico"] as const;
  return {
    totalEventos: sismos.length,
    magnitudPromedio:
      Math.round(
        (sismos.reduce((acc, s) => acc + s.magnitud, 0) / sismos.length) * 10,
      ) / 10,
    magnitudMaxima: Math.max(...sismos.map((s) => s.magnitud)),
    zonasMasActiva: sismos.reduce((prev, curr) =>
      curr.magnitud > prev.magnitud ? curr : prev,
    ).zona,
    nivelAlerta: sismos.reduce((prev, curr) =>
      nivelOrder.indexOf(curr.nivel) > nivelOrder.indexOf(prev.nivel)
        ? curr
        : prev,
    ).nivel,
  };
}

const actividadAlertas = [
  { nombre: "Alerta 1", sismos: 0, tsunamis: 2 },
  { nombre: "Alerta 2", sismos: 2, tsunamis: 0 },
  { nombre: "Alerta 3", sismos: 8, tsunamis: 8 },
  { nombre: "Alerta 4", sismos: 1, tsunamis: 4 },
  { nombre: "Alerta 5", sismos: 2, tsunamis: 0 },
];

function Dashboard() {
  const { data: sismos, isLoading } = useSismos();
  const { data: dangerZones } = useDangerZones();

  console.log("mis dangerzonezs", dangerZones);

  const sismosList: SismoData[] =
    sismos && sismos.data.length > 0 ? mapToSismoData(sismos.data) : [];

  const sismoStats: SismoResumenStats | null =
    sismosList.length > 0 ? computeStats(sismosList) : null;

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const timer = setInterval(() => {
      setLoading(true);
    }, 2000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="w-full h-full grid grid-cols-12">
      <div className="col-span-10 h-full flex flex-col">
        <BaseMap
          initialZoom={4}
          initialCenter={{
            longitude: -76.76690150776584,
            latitude: 5.804109666166601,
          }}
        >
          {/* <Marker latitude={5.804109666166601} longitude={-76.76690150776584}>
            <MarkerSensor />
          </Marker> */}
          {!loading && (
            <div className="absolute top-0 left-0 w-full h-full bg-bg-200 ">
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                  <p className="mt-2 text-sm text-text-200">Iniciando mapa</p>
                </div>
              </div>
            </div>
          )}

          {/* Zonas de peligro */}
          <DangerZoneLayer dangerZones={dangerZones} />
          {/* Sismos */}
          {sismos && <SismoLayer sismos={sismos} />}
        </BaseMap>
        <BottomBar
          title="Actividad de Alertas"
          overlays={<div className="bg-100 px-3">Overlays</div>}
        >
          <BarChartWrapper
            data={actividadAlertas}
            dataKey={["sismos", "tsunamis"]}
            xAxisKey="nombre"
            height={170}
            colors={["gray", "red"]}
            showGrid={true}
            barSize={20}
            showLegend={true}
            stacked={false}
          />
        </BottomBar>
      </div>
      <div className="col-span-2 h-full overflow-hidden">
        <RightBar title="Centro de Actividad" subTitle="Monitoreo preventivo">
          {isLoading && (
            <div className="p-4 text-sm text-text-200">Cargando sismos...</div>
          )}
          {!isLoading && sismoStats && (
            <SismoResumen sismos={sismosList} stats={sismoStats} />
          )}
          {!isLoading && !sismoStats && (
            <div className="p-4 text-sm text-text-200">
              Sin datos sísmicos disponibles.
            </div>
          )}
        </RightBar>
      </div>
    </div>
  );
}

export default Dashboard;
