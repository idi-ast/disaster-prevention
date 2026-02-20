import { apiSystem } from "@/apis/apiSystem";
import type { DangerZoneTypes } from "@/features/dangerzone/types/dangerZone.type";

export const dangerZoneService = {
  getDangerZone: async (): Promise<DangerZoneTypes> => {
    const response = await apiSystem.get<DangerZoneTypes>(`/dangerzone/`);
    return response.data;
  },
};
