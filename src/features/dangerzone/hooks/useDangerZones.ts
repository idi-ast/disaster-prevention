import { useQuery } from "@tanstack/react-query";
import { dangerZoneService } from "../services/dangerZone.service";

const QUERY_KEYS = {
  dangerZone: ["danger-zone"] as const,
};

export function useDangerZones() {
  return useQuery({
    queryKey: [...QUERY_KEYS.dangerZone],
    queryFn: () => dangerZoneService.getDangerZone(),
    staleTime: 30 * 1000,
  });
}
