import { useQuery } from "@tanstack/react-query";
import { doorSensorService } from "../services/doorSensor.sevice";
import type { DoorSensorType } from "../types/DoorSensor.type";

export function useDoorSensor() {
    return useQuery<DoorSensorType[]>({
        queryKey: ["door-sensors"],
        queryFn: () => doorSensorService.getDoorSensors(),
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchInterval: 5 * 1000,
        refetchIntervalInBackground: false,
    });
}