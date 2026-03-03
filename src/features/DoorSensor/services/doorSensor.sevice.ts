import { apiSystem } from "@/apis/apiSystem";
import type { DoorSensorType } from "../types/DoorSensor.type";

export const doorSensorService = {
  getDoorSensors: async (): Promise<DoorSensorType[]> => {
    const response = await apiSystem.get("/sensors");
    console.log("mis sensores", response.data);

    return response.data as DoorSensorType[];
  },
};
