import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  sismosNotificacionesService,
  type SismoNotificacionData,
  type PeriodFilter,
} from "../services/sismosNotificaciones.service";
import { useNotificationStore } from "@/template/notifications/stores";
import { useToast } from "@/libs/sonner";
import type {
  Notification,
  NotificationType,
  NotificationPriority,
} from "@/template/notifications/types";

function levelToType(level: string): NotificationType {
  switch (level.toLowerCase()) {
    case "crítico":
    case "critico":
      return "error";
    case "alto":
      return "error";
    case "medio":
      return "warning";
    case "bajo":
    default:
      return "info";
  }
}

function levelToPriority(level: string): NotificationPriority {
  switch (level.toLowerCase()) {
    case "crítico":
    case "critico":
      return "urgent";
    case "alto":
      return "high";
    case "medio":
      return "normal";
    case "bajo":
    default:
      return "low";
  }
}

function mapSismoToNotification(sismo: SismoNotificacionData): Notification {
  const type = levelToType(sismo.level);
  return {
    id: `sismo-${sismo.id}`,
    title: `Sismo ${sismo.level} — ${sismo.place}`,
    message: `Magnitud ${Number(sismo.magnitude).toFixed(1)} · Profundidad ${Number(sismo.depth).toFixed(0)} km`,
    type,
    priority: levelToPriority(sismo.level),
    status: "unread",
    createdAt: new Date(sismo.time),
    actionUrl: sismo.url,
    actionLabel: "Ver en USGS",
    source: "sismos",
    category: "sismo",
    tags: [sismo.level, "sismo"],
    metadata: {
      latitude: sismo.latitude,
      longitude: sismo.longitude,
      depth: sismo.depth,
      magnitude: sismo.magnitude,
      level: sismo.level,
      place: sismo.place,
    },
  };
}

const QUERY_KEY = ["sismos-notificaciones"] as const;

interface UseSismosNotificacionesOptions {
  period?: PeriodFilter;
  /** Intervalo de refresco en ms (por defecto 60 s) */
  refetchInterval?: number;
  /** Activar / desactivar la inyección al store del template */
  injectToStore?: boolean;
}

/**
 * Capa adaptadora entre el endpoint `sismos/notificaciones`
 * y el sistema de notificaciones del template.
 *
 * - Llama al endpoint con el período indicado.
 * - Mapea cada sismo → Notification del template.
 * - Inyecta solo registros nuevos (sin duplicar) al useNotificationStore.
 * - Retorna también los datos crudos y el estado de la query para uso propio.
 */
export function useSismosNotificaciones({
  period = "day",
  refetchInterval = 60_000,
  injectToStore = true,
}: UseSismosNotificacionesOptions = {}) {
  const store = useNotificationStore();
  const {
    error: toastError,
    warning: toastWarning,
    info: toastInfo,
  } = useToast();
  // IDs ya notificados via toast (persiste entre refetches)
  const seenIds = useRef<Set<string>>(new Set());

  const query = useQuery({
    queryKey: [...QUERY_KEY, period],
    queryFn: () => sismosNotificacionesService.getNotificaciones(period),
    staleTime: refetchInterval,
    refetchInterval,
    refetchIntervalInBackground: false,
  });

  // Inyección al store: solo las notificaciones que aún no existen
  useEffect(() => {
    if (!injectToStore || !query.data?.data?.length) return;

    const existingIds = new Set(store.notifications.map((n) => n.id));

    const nuevas = query.data.data
      .map(mapSismoToNotification)
      .filter((n) => !existingIds.has(n.id));

    if (nuevas.length > 0) {
      store.addNotifications(nuevas);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data, injectToStore]);

  // Toasts: se muestran al cargar y solo para registros aún no notificados
  useEffect(() => {
    if (!query.data?.data?.length) return;

    const noVistas = query.data.data.filter((s) => !seenIds.current.has(s.id));
    if (!noVistas.length) return;

    // Marcar como vistas antes de mostrar
    noVistas.forEach((s) => seenIds.current.add(s.id));

    const criticas = noVistas.filter((s) =>
      ["crítico", "critico", "alto"].includes(s.level.toLowerCase()),
    );
    const medias = noVistas.filter((s) => s.level.toLowerCase() === "medio");
    const bajas = noVistas.filter((s) => s.level.toLowerCase() === "bajo");

    // Toast individual por cada sismo crítico / alto
    criticas.forEach((s) => {
      toastError(` Sismo ${s.level} — ${s.place}`, {
        description: `Magnitud ${Number(s.magnitude).toFixed(1)} · Prof. ${Number(s.depth).toFixed(0)} km`,
        duration: 8000,
      });
    });

    // Toast agrupado para sismos medios
    if (medias.length === 1) {
      toastWarning(`Sismo moderado — ${medias[0].place}`, {
        description: `Magnitud ${Number(medias[0].magnitude).toFixed(1)} · Prof. ${Number(medias[0].depth).toFixed(0)} km`,
        duration: 6000,
      });
    } else if (medias.length > 1) {
      toastWarning(`${medias.length} sismos moderados detectados`, {
        description: `Magnitudes entre ${Math.min(...medias.map((s) => Number(s.magnitude))).toFixed(1)} y ${Math.max(...medias.map((s) => Number(s.magnitude))).toFixed(1)}`,
        duration: 6000,
      });
    }

    // Resumen único para sismos de bajo nivel
    if (bajas.length > 0) {
      toastInfo(
        `${bajas.length} sismo${bajas.length !== 1 ? "s" : ""} de baja intensidad`,
        {
          description: "Revisá el panel de actividad para más detalles.",
          duration: 4000,
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data]);

  return {
    /** Datos crudos del endpoint */
    data: query.data,
    /** Notificaciones ya mapeadas al formato del template */
    notifications: (query.data?.data ?? []).map(mapSismoToNotification),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
