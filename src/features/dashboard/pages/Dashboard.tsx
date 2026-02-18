import BottomBar from "@/components/bars/BottomBar";
import RightBar from "@/components/bars/RightBar";
import BaseMap from "@/components/baseMap/components/BaseMap";
import { BarChartWrapper } from "@/libs/recharts";
import { Marker } from "react-map-gl";
import MarkerSensor from "@/features/dashboard/components/markers/MarkerSensor";
import MarkerSismo from "../components/markers/MarkerSismo";

// Ejemplo de uso
const actividadAlertas = [
  { nombre: "Alerta 1", sismos: 0, tsunamis: 2 },
  { nombre: "Alerta 2", sismos: 2, tsunamis: 0 },
  { nombre: "Alerta 3", sismos: 8, tsunamis: 8 },
  { nombre: "Alerta 4", sismos: 1, tsunamis: 4 },
  { nombre: "Alerta 5", sismos: 2, tsunamis: 0 },
];

function Dashboard() {
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
          <Marker latitude={5.804109666166601} longitude={-76.76690150776584}>
            <MarkerSensor />
          </Marker>
          <Marker latitude={5.304109666166601} longitude={-78.939015}>
            <MarkerSismo />
          </Marker>
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
      <div className="col-span-2">
        <RightBar
          title="Centro de Actividad"
          subTitle="Monitoreo preventivo"
          overlays={
            <div className="px-3 border-t border-b border-border">
              <small>Overlays</small>
            </div>
          }
        >
          <div className="bg-bg-300 h-full w-full rounded-xl ">
            <small>d</small>
          </div>
        </RightBar>
      </div>
    </div>
  );
}

export default Dashboard;
