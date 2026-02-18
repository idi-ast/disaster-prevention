import type {
  SismoData,
  SismoNivel,
  SismoIntensidad,
} from "../types/sismo.types";
import type { SismoResumenStats } from "../types/sismo.types";

interface SismoResumenProps {
  sismos: SismoData[];
  stats: SismoResumenStats;
}

const NIVEL_COLOR: Record<SismoNivel, string> = {
  bajo: "text-yellow-400",
  medio: "text-orange-400",
  alto: "text-red-400",
  crítico: "text-red-600",
};

const NIVEL_BG: Record<SismoNivel, string> = {
  bajo: "bg-yellow-400/10 border-yellow-400/30",
  medio: "bg-orange-400/10 border-orange-400/30",
  alto: "bg-red-400/10 border-red-400/30",
  crítico: "bg-red-600/10 border-red-600/30",
};

const NIVEL_DOT: Record<SismoNivel, string> = {
  bajo: "bg-yellow-400",
  medio: "bg-orange-400",
  alto: "bg-red-400",
  crítico: "bg-red-600",
};

const INTENSIDAD_LABEL: Record<SismoIntensidad, string> = {
  imperceptible: "Imperceptible",
  débil: "Débil",
  moderado: "Moderado",
  fuerte: "Fuerte",
  severo: "Severo",
};

function SismoResumen({ sismos, stats }: SismoResumenProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-col gap-3 px-3 pt-3 shrink-0">
        <div
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${NIVEL_BG[stats.nivelAlerta]}`}
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${NIVEL_DOT[stats.nivelAlerta]}`}
          />
          <div>
            <p
              className={`text-xs font-semibold leading-tight ${NIVEL_COLOR[stats.nivelAlerta]}`}
            >
              Alerta {stats.nivelAlerta.toUpperCase()}
            </p>
            <p className="text-xs text-text-200 leading-tight">
              Zona más activa: {stats.zonasMasActiva}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <StatCard
            label="Total eventos"
            value={stats.totalEventos.toString()}
          />
          <StatCard
            label="Mag. máxima"
            value={`M${stats.magnitudMaxima.toFixed(1)}`}
          />
          <StatCard
            label="Mag. promedio"
            value={`M${stats.magnitudPromedio.toFixed(1)}`}
          />
          <StatCard label="Zonas activas" value={sismos.length.toString()} />
        </div>

        <p className="text-xs font-semibold text-text-200 uppercase tracking-wide mt-1">
          Eventos registrados
        </p>
      </div>

      <div className="flex-1 min-h-0 max-h-130 overflow-y-auto px-3 pb-3 pt-3 flex flex-col gap-2">
        {[...sismos]
          .sort((a, b) => b.magnitud - a.magnitud)
          .map((sismo) => (
            <div
              key={sismo.id}
              className="rounded-lg border border-border bg-bg-200 px-3 py-2 flex flex-col gap-1"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-semibold text-text-100 truncate leading-tight">
                  {sismo.zona}
                </span>
                <span
                  className={`text-xs font-bold shrink-0 ${NIVEL_COLOR[sismo.nivel]}`}
                >
                  M{sismo.magnitud.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge nivel={sismo.nivel} />
                <span className="text-xs text-text-200">
                  {INTENSIDAD_LABEL[sismo.intensidad]}
                </span>
                <span className="text-xs text-text-300">
                  · {sismo.profundidad} km prof.
                </span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-xs text-text-300">
                  {sismo.movimientos} movimientos
                </span>
                <span className="text-xs text-text-300">
                  {formatRelative(sismo.ultimoRegistro)}
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}


function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-bg-200 px-2 py-2 flex flex-col items-center gap-0.5">
      <span className="text-sm font-bold text-text-100">{value}</span>
      <span className="text-xs text-text-300 text-center leading-tight">
        {label}
      </span>
    </div>
  );
}

function Badge({ nivel }: { nivel: SismoNivel }) {
  return (
    <span
      className={`text-xs px-1.5 py-0.5 rounded border font-medium ${NIVEL_BG[nivel]} ${NIVEL_COLOR[nivel]}`}
    >
      {nivel}
    </span>
  );
}

function formatRelative(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h > 0) return `hace ${h}h ${m}m`;
  return `hace ${m}m`;
}

export default SismoResumen;
