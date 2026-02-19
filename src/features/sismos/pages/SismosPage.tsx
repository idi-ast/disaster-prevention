import type {
  SismoNivel,
} from "@/features/dashboard/types";
import { useSismos } from "../hooks/useSismos";

function SismosPage() {
  const { data: sismos, isLoading, error } = useSismos();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>Error al cargar los sismos</div>;
  }

  const NIVEL_COLOR: Record<SismoNivel, string> = {
    bajo: "text-yellow-400",
    medio: "text-orange-400",
    alto: "text-red-400",
    crítico: "text-red-600",
  };

  // const NIVEL_BG: Record<SismoNivel, string> = {
  //   bajo: "bg-yellow-400/10 border-yellow-400/30",
  //   medio: "bg-orange-400/10 border-orange-400/30",
  //   alto: "bg-red-400/10 border-red-400/30",
  //   crítico: "bg-red-600/10 border-red-600/30",
  // };

  // const NIVEL_DOT: Record<SismoNivel, string> = {
  //   bajo: "bg-yellow-400",
  //   medio: "bg-orange-400",
  //   alto: "bg-red-400",
  //   crítico: "bg-red-600",
  // };

  // const INTENSIDAD_LABEL: Record<SismoIntensidad, string> = {
  //   imperceptible: "Imperceptible",
  //   débil: "Débil",
  //   moderado: "Moderado",
  //   fuerte: "Fuerte",
  //   severo: "Severo",
  // };

  return (
    <div className="p-5">
      <h1>Registro de sismos</h1>
      <div className="flex-1 min-h-0 max-h-170 overflow-y-auto px-3 pb-3 pt-3 flex flex-col gap-2">
        {sismos?.data
          .sort((a, b) => b.magnitude - a.magnitude)
          .map((sismo) => (
            <div
              key={sismo.id}
              className="rounded-lg border border-border bg-bg-200 px-3 py-2 flex flex-col gap-1"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-semibold text-text-100 truncate leading-tight">
                  {sismo.place}
                </span>
                <span
                  className={`text-xs font-bold shrink-0 ${NIVEL_COLOR[sismo.magnitude.toFixed(1) as SismoNivel]}`}
                >
                  M{sismo.magnitude.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-text-200"></span>
                <span className="text-xs text-text-300">
                  · {sismo.depth} km prof.
                </span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-xs text-text-300"></span>
                <span className="text-xs text-text-300">
                  {formatRelative(sismo.time)}
                </span>
              </div>
            </div>
          ))}
      </div>
      <pre>{JSON.stringify(sismos, null, 2)}</pre>
    </div>
  );
}

function formatRelative(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h > 0) return `hace ${h}h ${m}m`;
  return `hace ${m}m`;
}
export default SismosPage;
