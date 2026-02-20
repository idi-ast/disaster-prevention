import { apiSystem } from "@/apis/apiSystem";
import type { DesastresGlobalesTypes } from "@/features/desastresGlobales/types/desastesGlobales.type";

export const desastesGlobalesService = {
  getDesastresGlobales: async (): Promise<DesastresGlobalesTypes> => {
    const response =
      await apiSystem.get<DesastresGlobalesTypes>(`/nasa/?period=week`);
    return response.data;
  },
};
