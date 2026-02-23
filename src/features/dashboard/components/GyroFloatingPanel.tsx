import { useReducer, useEffect, useCallback } from "react";
import { LineChartWrapper } from "@/libs/recharts";
import type { GyroscopeTypes } from "@/features/gyroscope/types/gyroscope.type";
import type { GyroDevices } from "@/features/gyroscope/types/gyroscope.type";
import {
  IconAlertTriangle,
  IconChevronDown,
  IconChevronUp,
  IconX,
} from "@tabler/icons-react";

const MAX_POINTS = 40;

type HistoryPoint = {
  t: string;
  gyro_x: number;
  gyro_y: number;
  gyro_z: number;
  acc_x: number;
  acc_y: number;
  acc_z: number;
  mag_x: number;
  mag_y: number;
  mag_z: number;
  temperature: number;
  battery: number;
};

type DeviceHistory = HistoryPoint[];
type HistoryMap = Record<string, DeviceHistory>;

const MOTION_THRESHOLD = 0.3;

function magnitude(x: number, y: number, z: number) {
  return Math.sqrt(x ** 2 + y ** 2 + z ** 2);
}

function timeLabel() {
  const now = new Date();
  return `${now.getMinutes().toString().padStart(2, "0")}:${now
    .getSeconds()
    .toString()
    .padStart(2, "0")}`;
}

function appendPoint(prev: DeviceHistory, point: HistoryPoint): DeviceHistory {
  return [...prev, point].slice(-MAX_POINTS);
}

const GROUPS = {
  gyro: {
    label: "Giroscopio",
    keys: ["gyro_x", "gyro_y", "gyro_z"],
    colors: ["#3b82f6", "#60a5fa", "#93c5fd"],
  },
  acc: {
    label: "Acelerómetro",
    keys: ["acc_x", "acc_y", "acc_z"],
    colors: ["#ef4444", "#f87171", "#fca5a5"],
  },
  mag: {
    label: "Magnetómetro",
    keys: ["mag_x", "mag_y", "mag_z"],
    colors: ["#10b981", "#34d399", "#6ee7b7"],
  },
  extras: {
    label: "Temperatura / Batería",
    keys: ["temperature", "battery"],
    colors: ["#fbbf24", "#8b5cf6"],
  },
} as const;

type GroupKey = keyof typeof GROUPS;

// ── Estado con useReducer ────────────────────────────────────────────────────
type State = {
  history: HistoryMap;
  visible: boolean;
  minimized: boolean;
  selectedDevice: string | null;
  activeGroup: GroupKey;
  lastManualToggle: number;
};

type Action =
  | {
      type: "GYRO_UPDATE";
      devices: GyroDevices[];
      points: Record<string, HistoryPoint>;
      motionDetected: boolean;
      currentDeviceStatus?: string;
    }
  | { type: "CLOSE" }
  | { type: "TOGGLE_MINIMIZE" }
  | { type: "SELECT_DEVICE"; id: string }
  | { type: "SET_GROUP"; group: GroupKey };

const initialState: State = {
  history: {},
  visible: true,
  minimized: false,
  selectedDevice: null,
  activeGroup: "gyro",
  lastManualToggle: 0,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "GYRO_UPDATE": {
      const nextHistory: HistoryMap = { ...state.history };
      action.devices.forEach((dev) => {
        nextHistory[dev.dev_eui] = appendPoint(
          state.history[dev.dev_eui] ?? [],
          action.points[dev.dev_eui],
        );
      });
      const firstDevice = action.devices[0]?.dev_eui ?? null;
      const sel =
        state.selectedDevice &&
        action.devices.some((d) => d.dev_eui === state.selectedDevice)
          ? state.selectedDevice
          : firstDevice;
      
      // No maximizar si el device actual está "inactivo"
      const shouldMaximize = action.motionDetected && action.currentDeviceStatus !== "inactivo";
      
      return {
        ...state,
        history: nextHistory,
        visible: true,
        minimized: shouldMaximize ? false : state.minimized,
        selectedDevice: sel,
      };
    }
    case "CLOSE":
      return { ...state, visible: false };
    case "TOGGLE_MINIMIZE":
      return { ...state, minimized: !state.minimized, lastManualToggle: Date.now() };
    case "SELECT_DEVICE":
      return { ...state, selectedDevice: action.id };
    case "SET_GROUP":
      return { ...state, activeGroup: action.group };
    default:
      return state;
  }
}

interface GyroFloatingPanelProps {
  gyroscope?: GyroscopeTypes;
}

export function GyroFloatingPanel({ gyroscope }: GyroFloatingPanelProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { history, visible, minimized, selectedDevice, activeGroup } = state;

  const devices = gyroscope?.gyro_devices ?? [];
  const currentDevice = devices.find((d) => d.dev_eui === selectedDevice);
  const deviceHistory = selectedDevice ? (history[selectedDevice] ?? []) : [];

  useEffect(() => {
    if (!gyroscope?.gyro_devices?.length) return;

    const t = timeLabel();
    let motionDetected = false;
    const points: Record<string, HistoryPoint> = {};

    gyroscope.gyro_devices.forEach((dev) => {
      const point: HistoryPoint = {
        t,
        gyro_x: Number(dev.gyro_x),
        gyro_y: Number(dev.gyro_y),
        gyro_z: Number(dev.gyro_z),
        acc_x: Number(dev.acc_x),
        acc_y: Number(dev.acc_y),
        acc_z: Number(dev.acc_z),
        mag_x: Number(dev.mag_x),
        mag_y: Number(dev.mag_y),
        mag_z: Number(dev.mag_z),
        temperature: Number(dev.temperature),
        battery: Number(dev.battery_percent),
      };
      points[dev.dev_eui] = point;

      const gyroMag = magnitude(point.gyro_x, point.gyro_y, point.gyro_z);
      if (dev.alert || gyroMag > MOTION_THRESHOLD) motionDetected = true;
    });

    dispatch({
      type: "GYRO_UPDATE",
      devices: gyroscope.gyro_devices,
      points,
      motionDetected,
      currentDeviceStatus: currentDevice?.status,
    });
  }, [gyroscope, currentDevice?.status]);

  // Minimizar cuando status es "inactivo"
  useEffect(() => {
    if (currentDevice) {
      const timeSinceManualToggle = Date.now() - state.lastManualToggle;
      const allowAutoToggle = timeSinceManualToggle > 5000; // Solo auto-toggle después de 5 segundos sin interacción manual
      
      if (allowAutoToggle) {
        const shouldMinimize = currentDevice.status === "inactivo";
        // Solo minimizar automáticamente, no maximizar
        if (shouldMinimize && !minimized) {
          dispatch({ type: "TOGGLE_MINIMIZE" });
        }
      }
    }
  }, [currentDevice?.status, currentDevice?.dev_eui, minimized, state.lastManualToggle]);

  const handleClose = useCallback(() => dispatch({ type: "CLOSE" }), []);
  const handleToggleMinimize = useCallback(
    () => dispatch({ type: "TOGGLE_MINIMIZE" }),
    [],
  );

  // Mostrar en cuanto haya dispositivos
  if (!devices.length) return null;
  if (!visible) return null;

  const isAlert = currentDevice?.alert ?? false;
  const gyroMag = currentDevice
    ? magnitude(
        Number(currentDevice.gyro_x),
        Number(currentDevice.gyro_y),
        Number(currentDevice.gyro_z),
      ).toFixed(2)
    : "0.00";
  const accMag = currentDevice
    ? magnitude(
        Number(currentDevice.acc_x),
        Number(currentDevice.acc_y),
        Number(currentDevice.acc_z),
      ).toFixed(2)
    : "0.00";

  const group = GROUPS[activeGroup];

  


  return (
    <div
      className={`absolute bottom-4 left-4 z-50 flex flex-col rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 ${
        isAlert
          ? "border-red-500/60 bg-bg-100/95 shadow-red-900/30"
          : "border-border bg-bg-100/95"
      }`}
      style={{ width: "480px" }}
    >
      <div
        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-t-xl border-b ${
          isAlert
            ? "border-red-500/30 bg-red-500/10"
            : "border-border bg-bg-200/60"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {isAlert && (
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse shrink-0" />
          )}
          <span
            className={`text-xs font-bold uppercase tracking-wider truncate ${
              isAlert ? "text-red-400" : "text-text-100"
            }`}
          >
            {isAlert ? (
              <>
                <IconAlertTriangle className="inline-block mr-1" /> Movimiento
                detectado
              </>
            ) : (
              "Monitor Giroscopio"
            )}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-xs font-mono text-text-300">
          <span>
            <span className="text-blue-400 font-semibold">|ω|</span> {gyroMag}
          </span>
          <span>
            <span className="text-red-400 font-semibold">|a|</span> {accMag}
          </span>
          {currentDevice && (
            <span
              className={
                currentDevice.battery_percent > 50
                  ? "text-green-400"
                  : currentDevice.battery_percent > 20
                    ? "text-yellow-400"
                    : "text-red-400"
              }
            >
              {currentDevice.battery_percent}%
            </span>
          )}
          {currentDevice && (
            <span className="text-amber-400">
              {currentDevice.temperature}°C
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleToggleMinimize}
            className="text-text-300 hover:text-text-100 transition-colors text-xs px-1.5 py-0.5 rounded hover:bg-bg-300"
            title={minimized ? "Expandir" : "Minimizar"}
          >
            {minimized ? <IconChevronUp /> : <IconChevronDown />}
          </button>
          <button
            onClick={handleClose}
            className="text-text-300 hover:text-red-400 transition-colors text-xs px-1.5 py-0.5 rounded hover:bg-bg-300"
            title="Cerrar"
          >
            ✕
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {devices.length > 1 && (
            <div className="flex gap-1 px-2 pt-2 flex-wrap">
              {devices.map((dev) => (
                <button
                  key={dev.dev_eui}
                  onClick={() =>
                    dispatch({ type: "SELECT_DEVICE", id: dev.dev_eui })
                  }
                  className={`text-[10px] px-2 py-1 rounded-full border font-medium transition-colors ${
                    selectedDevice === dev.dev_eui
                      ? dev.alert
                        ? "bg-red-500/20 border-red-400/50 text-red-400"
                        : "bg-bg-300 border-border text-text-100"
                      : "border-transparent text-text-300 hover:text-text-200"
                  }`}
                >
                  {dev.alert && <IconX />}
                  {dev.device_name ?? dev.dev_eui}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-0.5 px-2 pt-2">
            {(Object.keys(GROUPS) as GroupKey[]).map((gk) => (
              <button
                key={gk}
                onClick={() => dispatch({ type: "SET_GROUP", group: gk })}
                className={`flex-1 text-[10px] py-1 px-1 rounded font-medium transition-colors ${
                  activeGroup === gk
                    ? "bg-bg-300 text-text-100"
                    : "text-text-300 hover:text-text-200"
                }`}
              >
                {GROUPS[gk].label}
              </button>
            ))}
          </div>

          <div className="px-2 pt-1 pb-2">
            {deviceHistory.length > 1 ? (
              <div className="relative">
                {/* Leyenda compacta encima */}
                <div className="flex gap-3 mb-1 px-1">
                  {group.keys.map((k, i) => (
                    <span
                      key={k}
                      className="text-[10px] font-mono flex items-center gap-1"
                    >
                      <span
                        className="inline-block w-3 h-0.5 rounded"
                        style={{ background: group.colors[i] }}
                      />
                      <span style={{ color: group.colors[i] }}>{k}</span>
                      {/* valor actual */}
                      <span className="text-text-300 ml-0.5">
                        {Number(
                          deviceHistory[deviceHistory.length - 1]?.[
                            k as keyof HistoryPoint
                          ] ?? 0,
                        ).toFixed(2)}
                      </span>
                    </span>
                  ))}
                </div>

                <LineChartWrapper
                  data={deviceHistory}
                  dataKey={group.keys as unknown as string[]}
                  xAxisKey="t"
                  height={130}
                  colors={[...group.colors]}
                  showGrid={true}
                  showLegend={false}
                  showTooltip={true}
                  strokeWidth={1.5}
                  dot={false}
                  curved={true}
                />
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-xs text-text-300">
                Acumulando datos…
              </div>
            )}
          </div>

          {currentDevice && (
            <div className="grid grid-cols-6 gap-1 px-2 pb-2 text-center">
              {[
                {
                  label: "Gyr X",
                  value: currentDevice.gyro_x,
                  color: "#3b82f6",
                },
                {
                  label: "Gyr Y",
                  value: currentDevice.gyro_y,
                  color: "#60a5fa",
                },
                {
                  label: "Gyr Z",
                  value: currentDevice.gyro_z,
                  color: "#93c5fd",
                },
                {
                  label: "Acc X",
                  value: currentDevice.acc_x,
                  color: "#ef4444",
                },
                {
                  label: "Acc Y",
                  value: currentDevice.acc_y,
                  color: "#f87171",
                },
                {
                  label: "Acc Z",
                  value: currentDevice.acc_z,
                  color: "#fca5a5",
                },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="rounded bg-bg-200 border border-border px-1 py-1"
                >
                  <p className="text-[9px] text-text-300">{label}</p>
                  <p
                    className="text-[10px] font-mono font-bold"
                    style={{ color }}
                  >
                    {Number(value).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {currentDevice && (
            <div className="flex items-center justify-between px-3 pb-2 text-[10px]">
              <span
                className={`flex items-center gap-1 font-medium ${
                  currentDevice.status === "activo"
                    ? "text-green-400"
                    : "text-gray-400"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    currentDevice.status === "activo"
                      ? "bg-green-400 animate-pulse"
                      : "bg-gray-500"
                  }`}
                />
                {currentDevice.status === "activo" ? "Activo" : "Desactivado"} —{" "}
                {currentDevice.device_name}
              </span>
              <span className="text-text-300 font-mono">
                {deviceHistory.length} muestras
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
