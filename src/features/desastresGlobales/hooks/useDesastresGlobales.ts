import { useQuery } from "@tanstack/react-query";
import { desastesGlobalesService } from "../services/desastesGlobales.service";

const QUERY_KEYS = {
  desastresGlobales: ["desastres-globales"] as const,
};

export function useDesastresGlobales() {
  return useQuery({
    queryKey: [...QUERY_KEYS.desastresGlobales],
    queryFn: () => desastesGlobalesService.getDesastresGlobales(),
    staleTime: 30 * 1000,
  });
}