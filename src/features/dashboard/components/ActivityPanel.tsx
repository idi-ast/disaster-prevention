import { useState } from "react";
import type {
  SismoData,
  SismoNivel,
  SismoIntensidad,
  SismoResumenStats,
} from "../types/sismo.types";
import type { DesastresGlobalesTypes } from "@/features/desastresGlobales/types/desastesGlobales.type";
import type { GyroscopeTypes } from "@/features/gyroscope/types/gyroscope.type";

type Tab = "sismos" | "nasa" | "gyro";

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

const NASA_CATEGORY_COLOR: Record<string, string> = {
  Wildfires: "text-orange-400",
  Floods: "text-blue-400",
  "Severe Storms": "text-yellow-400",
  Volcanoes: "text-red-400",
  "Sea and Lake Ice": "text-cyan-400",
  Earthquakes: "text-orange-300",
  Drought: "text-amber-400",
  "Dust and Haze": "text-gray-400",
  Landslides: "text-yellow-700",
  Snow: "text-sky-300",
  "Temperature Extremes": "text-red-300",
  "Water Color": "text-blue-300",
  Manmade: "text-slate-400",
};
const NASA_CATEGORY_BG: Record<string, string> = {
  Wildfires: "bg-orange-400/10 border-orange-400/30",
  Floods: "bg-blue-400/10 border-blue-400/30",
  "Severe Storms": "bg-yellow-400/10 border-yellow-400/30",
  Volcanoes: "bg-red-400/10 border-red-400/30",
  "Sea and Lake Ice": "bg-cyan-400/10 border-cyan-400/30",
  Earthquakes: "bg-orange-300/10 border-orange-300/30",
  Drought: "bg-amber-400/10 border-amber-400/30",
  "Dust and Haze": "bg-gray-400/10 border-gray-400/30",
  Landslides: "bg-yellow-700/10 border-yellow-700/30",
  Snow: "bg-sky-300/10 border-sky-300/30",
  "Temperature Extremes": "bg-red-300/10 border-red-300/30",
  "Water Color": "bg-blue-300/10 border-blue-300/30",
  Manmade: "bg-slate-400/10 border-slate-400/30",
};
const NASA_CATEGORY_EMOJI: Record<string, string> = {
  Wildfires: "",
  Floods: "",
  "Severe Storms": "",
  Volcanoes: "",
  "Sea and Lake Ice": "",
  Earthquakes: "",
  Drought: "",
  "Dust and Haze": "",
  Landslides: "",
  Snow: "",
  "Temperature Extremes": "",
  "Water Color": "",
  Manmade: "",
};

const NASA_CATEGORY_ES: Record<string, string> = {
  Wildfires: "Incendios forestales",
  Floods: "Inundaciones",
  "Severe Storms": "Tormentas severas",
  Volcanoes: "Volcanes",
  "Sea and Lake Ice": "Hielo marino y lacustre",
  Earthquakes: "Terremotos",
  Drought: "Sequía",
  "Dust and Haze": "Polvo y neblina",
  Landslides: "Deslizamientos",
  Snow: "Nieve",
  "Temperature Extremes": "Temperaturas extremas",
  "Water Color": "Color del agua",
  Manmade: "Causas humanas",
};

const LEVEL_NASA_COLOR: Record<string, string> = {
  bajo: "text-yellow-400",
  medio: "text-orange-400",
  alto: "text-red-400",
  crítico: "text-red-600",
};

type FocusFn = (lng: number, lat: number) => void;

interface ActivityPanelProps {
  isLoadingSismos: boolean;
  sismosList: SismoData[];
  sismoStats: SismoResumenStats | null;
  desastres?: DesastresGlobalesTypes;
  gyroscope?: GyroscopeTypes;
  onFocusLocation?: FocusFn;
}

export function ActivityPanel({
  isLoadingSismos,
  sismosList,
  sismoStats,
  desastres,
  gyroscope,
  onFocusLocation,
}: ActivityPanelProps) {
  const [tab, setTab] = useState<Tab>("sismos");

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "sismos", label: "Sismos", count: sismosList.length },
    {
      key: "nasa",
      label: "Desastres",
      count: desastres?.data.length,
    },
    {
      key: "gyro",
      label: "Giroscopio",
      count: gyroscope?.gyro_devices.length,
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-border shrink-0 px-1 pt-1 gap-0.5">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex flex-col items-center py-1.5 px-1 text-xs rounded-t transition-colors relative ${
              tab === t.key
                ? "text-text-100 bg-bg-200 border border-b-bg-200 border-border -mb-px"
                : "text-text-300 hover:text-text-200 bg-transparent border border-transparent"
            }`}
          >
            <span className="font-medium leading-tight">{t.label}</span>
            {t.count !== undefined && (
              <span
                className={`text-[10px] font-bold ${
                  tab === t.key ? "text-text-200" : "text-text-300"
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {tab === "sismos" && (
          <SismosPanel
            isLoading={isLoadingSismos}
            sismosList={sismosList}
            stats={sismoStats}
            onFocusLocation={onFocusLocation}
          />
        )}
        {tab === "nasa" && (
          <NasaPanel desastres={desastres} onFocusLocation={onFocusLocation} />
        )}
        {tab === "gyro" && (
          <GyroPanel gyroscope={gyroscope} onFocusLocation={onFocusLocation} />
        )}
      </div>
    </div>
  );
}

// Panel Sismos
function SismosPanel({
  isLoading,
  sismosList,
  stats,
  onFocusLocation,
}: {
  isLoading: boolean;
  sismosList: SismoData[];
  stats: SismoResumenStats | null;
  onFocusLocation?: FocusFn;
}) {
  if (isLoading)
    return <div className="p-4 text-sm text-text-200">Cargando sismos...</div>;
  if (!stats)
    return (
      <div className="p-4 text-sm text-text-200">
        Sin datos sísmicos disponibles.
      </div>
    );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-col gap-2.5 px-3 pt-3 shrink-0">
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
            <p className="text-xs text-text-200 leading-tight truncate">
              {stats.zonasMasActiva}
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-1.5">
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
          <StatCard
            label="Zonas activas"
            value={sismosList.length.toString()}
          />
        </div>

        <p className="text-xs font-semibold text-text-300 uppercase tracking-wide">
          Eventos registrados
        </p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto max-h-120 px-3 pb-3 pt-1.5 flex flex-col gap-2">
        {[...sismosList]
          .sort((a, b) => b.magnitud - a.magnitud)
          .map((s) => (
            <div
              key={s.id}
              onClick={() =>
                onFocusLocation?.(
                  s.coordenadas.longitude,
                  s.coordenadas.latitude,
                )
              }
              className="rounded-lg border border-border bg-bg-200 px-3 py-2 flex flex-col gap-1 cursor-pointer hover:border-text-300 transition-colors"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-semibold text-text-100 truncate leading-tight">
                  {s.zona}
                </span>
                <span
                  className={`text-xs font-bold shrink-0 ${NIVEL_COLOR[s.nivel]}`}
                >
                  M{s.magnitud.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-xs px-1.5 py-0.5 rounded border font-medium ${NIVEL_BG[s.nivel]} ${NIVEL_COLOR[s.nivel]}`}
                >
                  {s.nivel}
                </span>
                <span className="text-xs text-text-200">
                  {INTENSIDAD_LABEL[s.intensidad]}
                </span>
                <span className="text-xs text-text-300">
                  · {s.profundidad} km
                </span>
              </div>
              <span className="text-xs text-text-300">
                {formatRelative(s.ultimoRegistro)}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

// Panel NASA
function NasaPanel({
  desastres,
  onFocusLocation,
}: {
  desastres?: DesastresGlobalesTypes;
  onFocusLocation?: FocusFn;
}) {
  if (!desastres?.data.length)
    return (
      <div className="p-4 text-sm text-text-200">
        Sin eventos Desastres Globales disponibles.
      </div>
    );

  const byCategory = desastres.data.reduce<
    Record<string, typeof desastres.data>
  >((acc, d) => {
    (acc[d.category] ??= []).push(d);
    return acc;
  }, {});

  const categories = Object.entries(byCategory).sort(
    (a, b) => b[1].length - a[1].length,
  );

  const total = desastres.data.length;
  const hasAlert = desastres.data.some(
    (d) => d.level === "alto" || d.level === "crítico",
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-3 pt-3 shrink-0 flex flex-col gap-2.5">
        <div className="rounded-lg border border-border bg-bg-200 px-3 py-2 flex items-center gap-2">
          <span className="text-lg"> </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-text-100 leading-tight">
              {total} evento{total !== 1 ? "s" : ""} activos — NASA EONET
            </p>
            <p
              className={`text-xs leading-tight ${hasAlert ? "text-red-400" : "text-green-400"}`}
            >
              {hasAlert
                ? " Eventos de alto riesgo detectados"
                : " Sin alertas críticas"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {categories.map(([cat, items]) => (
            <div
              key={cat}
              className={`rounded-lg border px-2 py-1.5 flex items-center gap-1.5 ${
                NASA_CATEGORY_BG[cat] ?? "bg-bg-200 border-border"
              }`}
            >
              <span className="text-base leading-none">
                {NASA_CATEGORY_EMOJI[cat] ?? ""}
              </span>
              <div className="min-w-0">
                <p
                  className={`text-xs font-bold leading-tight ${
                    NASA_CATEGORY_COLOR[cat] ?? "text-text-100"
                  }`}
                >
                  {items.length}
                </p>
                <p className="text-[10px] text-text-300 leading-tight truncate">
                  {NASA_CATEGORY_ES[cat] ?? cat}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs font-semibold text-text-300 uppercase tracking-wide">
          Eventos recientes
        </p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto max-h-145 px-3 pb-3 pt-1.5 flex flex-col gap-2">
        {desastres.data.map((d) => (
          <div
            key={d.id}
            onClick={() => onFocusLocation?.(d.longitude, d.latitude)}
            className="rounded-lg border border-border bg-bg-200 px-3 py-2 flex flex-col gap-1 cursor-pointer hover:border-text-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm shrink-0">
                  {NASA_CATEGORY_EMOJI[d.category] ?? ""}
                </span>
                <span className="text-xs font-semibold text-text-100 truncate leading-tight">
                  {d.title}
                </span>
              </div>
              <span
                className={`text-xs font-bold shrink-0 ${
                  LEVEL_NASA_COLOR[d.level] ?? "text-text-300"
                }`}
              >
                {d.level.toUpperCase()}
              </span>
            </div>
            <p className="text-[10px] text-text-300 leading-tight">
              {NASA_CATEGORY_ES[d.category] ?? d.category}
            </p>
            {d.description && (
              <p className="text-xs text-text-200 line-clamp-2 leading-tight">
                {d.description}
              </p>
            )}
            
          </div>
        ))}
      </div>
    </div>
  );
}

// Panel Giroscopio
function GyroPanel({
  gyroscope,
  onFocusLocation,
}: {
  gyroscope?: GyroscopeTypes;
  onFocusLocation?: FocusFn;
}) {
  if (!gyroscope?.gyro_devices.length)
    return (
      <div className="p-4 text-sm text-text-200">Sin sensores disponibles.</div>
    );

  const devices = gyroscope.gyro_devices;
  const alertCount = devices.filter((d) => d.alert).length;
  const onlineCount = devices.filter((d) => d.status === "online").length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-3 pt-3 shrink-0 flex flex-col gap-2.5">
        <div className="grid grid-cols-3 gap-1.5">
          <StatCard label="Sensores" value={devices.length.toString()} />
          <StatCard label="En línea" value={onlineCount.toString()} />
          <StatCard
            label="Alertas"
            value={alertCount.toString()}
            valueClass={alertCount > 0 ? "text-red-400" : "text-green-400"}
          />
        </div>

        {alertCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg border bg-red-400/10 border-red-400/30 px-3 py-2">
            <span className="w-2 h-2 rounded-full bg-red-400 shrink-0 animate-pulse" />
            <p className="text-xs font-semibold text-red-400">
              {alertCount} sensor{alertCount !== 1 ? "es" : ""} en alerta
            </p>
          </div>
        )}

        <p className="text-xs font-semibold text-text-300 uppercase tracking-wide">
          Sensores registrados
        </p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3 pt-1.5 flex flex-col gap-2">
        {[...devices]
          .sort((a, b) => (b.alert ? 1 : 0) - (a.alert ? 1 : 0))
          .map((d) => {
            const magnitude = Math.sqrt(
              d.gyro_x ** 2 + d.gyro_y ** 2 + d.gyro_z ** 2,
            ).toFixed(2);
            const accMag = Math.sqrt(
              d.acc_x ** 2 + d.acc_y ** 2 + d.acc_z ** 2,
            ).toFixed(2);
            const isOnline = d.status === "online";

            return (
              <div
                key={d.dev_eui}
                onClick={() => onFocusLocation?.(d.longitude, d.latitude)}
                className={`rounded-lg border bg-bg-200 px-3 py-2 flex flex-col gap-1.5 cursor-pointer hover:border-text-300 transition-colors ${
                  d.alert ? "border-red-400/50" : "border-border"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-text-100 truncate leading-tight">
                    {d.device_name}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {d.alert && (
                      <span className="text-xs font-bold text-red-400 animate-pulse">
                        ⚠ ALERTA
                      </span>
                    )}
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        isOnline
                          ? "bg-green-400/15 text-green-400"
                          : "bg-gray-400/15 text-gray-400"
                      }`}
                    >
                      {isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>

                {/* Lecturas giroscópicas */}
                <div className="grid grid-cols-3 gap-1 text-center">
                  <div className="rounded bg-bg-100 px-1 py-1">
                    <p className="text-[10px] text-text-300">Gyr X</p>
                    <p className="text-xs font-mono font-semibold text-text-100">
                      {Number(d.gyro_x).toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded bg-bg-100 px-1 py-1">
                    <p className="text-[10px] text-text-300">Gyr Y</p>
                    <p className="text-xs font-mono font-semibold text-text-100">
                      {Number(d.gyro_y).toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded bg-bg-100 px-1 py-1">
                    <p className="text-[10px] text-text-300">Gyr Z</p>
                    <p className="text-xs font-mono font-semibold text-text-100">
                      {Number(d.gyro_z).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Magnitudes + batería + temp */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs text-text-200">
                    |ω|{" "}
                    <strong className="text-text-100 font-mono">
                      {magnitude}
                    </strong>
                  </span>
                  <span className="text-xs text-text-200">
                    |a|{" "}
                    <strong className="text-text-100 font-mono">
                      {accMag}
                    </strong>
                  </span>
                  <span className="text-xs text-text-200">
                    {" "}
                    <strong className="text-text-100">{d.temperature}°C</strong>
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      d.battery_percent > 50
                        ? "text-green-400"
                        : d.battery_percent > 20
                          ? "text-yellow-400"
                          : "text-red-400"
                    }`}
                  >
                    {d.battery_percent}%
                  </span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function StatCard({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-bg-200 px-2 py-2 flex flex-col items-center gap-0.5">
      <span className={`text-sm font-bold ${valueClass ?? "text-text-100"}`}>
        {value}
      </span>
      <span className="text-[10px] text-text-300 text-center leading-tight">
        {label}
      </span>
    </div>
  );
}

function formatRelative(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h > 24) return `hace ${Math.floor(h / 24)}d`;
  if (h > 0) return `hace ${h}h ${m}m`;
  return `hace ${m}m`;
}
