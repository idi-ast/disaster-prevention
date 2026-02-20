import { type SismoTypes } from "../types/sismos.type";
import { apiSystem } from "@/apis/apiSystem";

export const sismosService = {
  getSismos: async (): Promise<SismoTypes> => {
    const response = await apiSystem.get<SismoTypes>(`/sismos/`);
    return response.data;
  },
};
