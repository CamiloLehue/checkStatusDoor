import { apiSystem } from "@/apis/apiSystem";
import type { DoorSensorType } from "../types/DoorSensor.type";
import type { HistorySensorType } from "../types/HistorySensor.type";

export const doorSensorService = {
  getDoorSensors: async (): Promise<DoorSensorType[]> => {
    const response = await apiSystem.get("/sensors");
    console.log("mis sensores", response.data);

    return response.data as DoorSensorType[];
  },
  getHistorySensor: async (id: number): Promise<HistorySensorType> => {
    const response = await apiSystem.get(
      `/door-events?last=24h&id_device=${id}`,
    );
    return response.data as HistorySensorType;
  },
  getAllHistoryEvents: async (): Promise<HistorySensorType> => {
    const response = await apiSystem.get(`/door-events?last=30d`);
    return response.data as HistorySensorType;
  },
};
