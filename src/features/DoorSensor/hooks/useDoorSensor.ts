import { useQuery } from "@tanstack/react-query";
import { doorSensorService } from "../services/doorSensor.sevice";

export function useDoorSensor() {
    return useQuery({
        queryKey: ["door-sensors"],
        queryFn: () => doorSensorService.getDoorSensors(),
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchInterval: 30 * 1000,
        refetchIntervalInBackground: false,
    })
}