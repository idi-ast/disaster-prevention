import { apiSystem } from "@/apis/apiSystem";
import type { GyroscopeTypes } from "@/features/gyroscope/types/gyroscope.type";

export const gyroscopeService = {
  getGyroscope: async (): Promise<GyroscopeTypes> => {
    const response = await apiSystem.get<GyroscopeTypes>(`/gyroscope`);
    return response.data;
  },
};