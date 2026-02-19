import { memo, useState } from "react";
import { Marker, Popup } from "react-map-gl";
import { IconRotate3d } from "@tabler/icons-react";
import type { GyroscopeTypes, GyroDevices } from "@/features/gyroscope/types/gyroscope.type";

interface GyroscopeLayerProps {
  gyroscope?: GyroscopeTypes;
}

interface SelectedDevice {
  device: GyroDevices;
}

const GyroscopeLayer = memo(({ gyroscope }: GyroscopeLayerProps) => {
  const [selected, setSelected] = useState<SelectedDevice | null>(null);

  if (!gyroscope?.gyro_devices?.length) return null;

  return (
    <>
      {gyroscope.gyro_devices.map((device) => {
        const isAlert = device.alert;
        const isOnline = device.status?.toLowerCase() === "online";

        return (
          <Marker
            key={device.dev_eui}
            longitude={device.longitude}
            latitude={device.latitude}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelected({ device });
            }}
          >
            <div
              title={device.device_name}
              className="cursor-pointer transition-transform hover:scale-125"
            >
              {/* Anillo pulsante cuando hay alerta */}
              {isAlert && (
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
              )}
              <div
                className={[
                  "relative flex items-center justify-center rounded-full p-1.5 shadow-lg border-2",
                  isAlert
                    ? "bg-red-600 border-red-300"
                    : isOnline
                      ? "bg-cyan-500 border-cyan-300"
                      : "bg-gray-500 border-gray-400",
                ].join(" ")}
              >
                <IconRotate3d
                  size={18}
                  className="text-white"
                  stroke={2}
                />
              </div>
            </div>
          </Marker>
        );
      })}

      {selected && (
        <Popup
          longitude={selected.device.longitude}
          latitude={selected.device.latitude}
          anchor="bottom"
          offset={16}
          closeButton={true}
          closeOnClick={false}
          onClose={() => setSelected(null)}
        >
          <div className="text-sm text-gray-800 min-w-48 space-y-1.5">
            {/* Encabezado */}
            <div className="flex items-center gap-2 mb-2">
              <IconRotate3d
                size={16}
                className={selected.device.alert ? "text-red-600" : "text-cyan-600"}
              />
              <p className="font-semibold text-sm leading-tight">{selected.device.device_name}</p>
            </div>

            {/* Estado y alerta */}
            <div className="flex gap-2">
              <span
                className={[
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  selected.device.status?.toLowerCase() === "online"
                    ? "bg-cyan-100 text-cyan-700"
                    : "bg-gray-100 text-gray-600",
                ].join(" ")}
              >
                {selected.device.status ?? "—"}
              </span>
              {selected.device.alert && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                  ⚠ Alerta activa
                </span>
              )}
            </div>

            <hr className="border-gray-200" />

            {/* Datos del sensor */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-gray-600">
              <span className="text-gray-400">Giroscopio X</span>
              <span>{selected.device.gyro_x ?? "—"}</span>
              <span className="text-gray-400">Giroscopio Y</span>
              <span>{selected.device.gyro_y ?? "—"}</span>
              <span className="text-gray-400">Giroscopio Z</span>
              <span>{selected.device.gyro_z ?? "—"}</span>
              <span className="text-gray-400">Aceleración X</span>
              <span>{selected.device.acc_x ?? "—"}</span>
              <span className="text-gray-400">Aceleración Y</span>
              <span>{selected.device.acc_y ?? "—"}</span>
              <span className="text-gray-400">Aceleración Z</span>
              <span>{selected.device.acc_z ?? "—"}</span>
              <span className="text-gray-400">Temperatura</span>
              <span>{selected.device.temperature ?? "—"} °C</span>
              <span className="text-gray-400">Batería</span>
              <span>{selected.device.battery_percent ?? "—"} %</span>
            </div>
          </div>
        </Popup>
      )}
    </>
  );
});

GyroscopeLayer.displayName = "GyroscopeLayer";

export default GyroscopeLayer;
