import { useQuery } from "@tanstack/react-query";
import { serviceService } from "../services/services.service";
import type { ServicesType } from "../types/services.type";

export function useServices() {
  return useQuery<ServicesType[]>({
    queryKey: ["services"],
    queryFn: () => serviceService.getServices(),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: 30 * 1000,
    refetchIntervalInBackground: false,
  });
}
