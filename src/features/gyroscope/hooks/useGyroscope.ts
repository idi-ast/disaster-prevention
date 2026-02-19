import { useQuery } from "@tanstack/react-query";
import { gyroscopeService } from "../services/gyroscope.service";

const QUERY_KEYS = {
  gyroscope: ["gyroscope"] as const,
};

export function useGyroscope() {
  return useQuery({
    queryKey: [...QUERY_KEYS.gyroscope],
    queryFn: () => gyroscopeService.getGyroscope(),
    staleTime: 30 * 1000,
  });
}