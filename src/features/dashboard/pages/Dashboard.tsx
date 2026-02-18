import BottomBar from "@/components/bars/BottomBar";
import RightBar from "@/components/bars/RightBar";
import BaseMap from "@/components/baseMap/components/BaseMap";
import { BarChartWrapper } from "@/libs/recharts";

// Ejemplo de uso
const actividadPuertas = [
  { nombre: "Puerta 1", aperturas: 45, cierres: 42 },
  { nombre: "Puerta 2", aperturas: 32, cierres: 30 },
  { nombre: "Puerta 3", aperturas: 28, cierres: 28 },
  { nombre: "Puerta 4", aperturas: 15, cierres: 14 },
  { nombre: "Puerta 5", aperturas: 52, cierres: 50 },
];

function Dashboard() {
  return (
    <div className="w-full h-full grid grid-cols-12">
      <div className="col-span-10 h-full flex flex-col">
        <BaseMap>
          {/* Contenido del mapa */}
        </BaseMap>
        <BottomBar
          title="Actividad de Puertas"
          overlays={<div className="bg-100 px-3">Overlays</div>}
        >
          <BarChartWrapper
            data={actividadPuertas}
            dataKey={["aperturas", "cierres"]}
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
          title="Detalles de Puertas"
          overlays={
            <div className="px-3 border-t border-b border-border">
              <small>Overlays</small>
            </div>
          }
        >
          <div>
            <small>Contenido del RightBar</small>
          </div>
        </RightBar>
      </div>
    </div>
  );
}

export default Dashboard;
