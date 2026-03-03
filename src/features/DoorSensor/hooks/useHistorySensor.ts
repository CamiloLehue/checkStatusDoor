import { useQuery } from "@tanstack/react-query";
import { doorSensorService } from "../services/doorSensor.sevice";
import type { Events } from "../types/HistorySensor.type";

export function useHistorySensor() {
  return useQuery<Events[]>({
    queryKey: ["door-history"],
    queryFn: async () => {
      const data = await doorSensorService.getAllHistoryEvents();
      return data.events ?? [];
    },
    refetchOnWindowFocus: false,
    refetchInterval: 30 * 1000,
  });
}
