import { sismosService } from "../services/sismos.service";
import { useQuery } from "@tanstack/react-query";

export function useSismos() {
  return useQuery({
    queryKey: ["sismos"],
    queryFn: () => sismosService.getSismos(),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: 30 * 1000, 
    refetchIntervalInBackground: false, 
  });
}
