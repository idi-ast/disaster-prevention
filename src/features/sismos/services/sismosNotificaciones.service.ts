import { apiSystem } from "@/apis/apiSystem";

// Tipos del endpoint sismos/notificaciones
export interface SismoNotificacionData {
  id: string;
  place: string;
  magnitude: number;
  time: string;
  url: string;
  latitude: number;
  longitude: number;
  depth: number;
  level: string;
}

export interface SismosNotificacionesResponse {
  count: number;
  data: SismoNotificacionData[];
}

export type PeriodFilter = "hour" | "day" | "week" | "month";

export const sismosNotificacionesService = {
  getNotificaciones: async (
    period: PeriodFilter = "day",
  ): Promise<SismosNotificacionesResponse> => {
    const response = await apiSystem.get<SismosNotificacionesResponse>(
      `/sismos/notificaciones/`,
      { params: { period } },
    );
    return response.data;
  },
};
