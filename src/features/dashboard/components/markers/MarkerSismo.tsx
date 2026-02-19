import type { SismoNivel } from "../../types/sismo.types";
import "./style.css";

interface MarkerSismoProps {
  magnitud: number;
  nivel: SismoNivel;
  zona: string;
}

const NIVEL_CONFIG: Record<
  SismoNivel,
  { color: string; size: number; pulse: string }
> = {
  bajo: {
    color: "rgb(253, 224, 71, 0.8)",
    size: 10,
    pulse: "rgba(253, 224, 71, 0.25)",
  }, // yellow-300
  medio: {
    color: "rgb(251, 146, 60, 0.8)",
    size: 14,
    pulse: "rgba(251, 146, 60, 0.25)",
  }, // orange-400
  alto: {
    color: "rgb(239, 68, 68, 0.8)",
    size: 18,
    pulse: "rgba(239, 68, 68, 0.25)",
  }, // red-500
  crítico: {
    color: "rgb(220, 38, 38, 0.8)",
    size: 42,
    pulse: "rgba(220, 38, 38, 0.25)",
  }, // red-600
};

function MarkerSismo({ magnitud, nivel, zona }: MarkerSismoProps) {
  const config = NIVEL_CONFIG[nivel] ?? NIVEL_CONFIG["bajo"];

  return (
    <div
      className="marker-sismo group relative flex items-center justify-center cursor-pointer"
      style={{ width: config.size, height: config.size }}
      title={`${zona} — M${magnitud.toFixed(1)}`}
    >
      <div
        className="marker-sismo-pulse"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          backgroundColor: config.pulse,
          animation: "sismo-pulse 2s ease-out infinite",
        }}
      />
      <div
        style={{
          width: config.size,
          height: config.size,
          borderRadius: "50%",
          backgroundColor: config.color,
          border: `2px solid ${config.color}`,
          boxShadow: `0 0 6px ${config.color}`,
          position: "relative",
          zIndex: 1,
        }}
      />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50">
        <div
          className="bg-bg-100 border border-border rounded px-2 py-1 text-xs text-text-100 whitespace-nowrap shadow-lg"
          style={{ fontSize: "11px" }}
        >
          <span className="font-semibold">{zona}</span>
          <br />M{magnitud.toFixed(1)} ·{" "}
          <span style={{ color: config.color }}>{nivel.toUpperCase()}</span>
        </div>
        <div className="w-2 h-2 bg-bg-100 border-r border-b border-border rotate-45 -mt-1" />
      </div>
    </div>
  );
}

export default MarkerSismo;
