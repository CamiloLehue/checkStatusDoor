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
    /* Primera página para conocer el total de páginas */
    const first = await apiSystem.get(`/door-events?last=30d&limit=100&page=1`);
    const firstData = first.data as HistorySensorType;
    const totalPages = firstData.pagination?.pages ?? 1;

    if (totalPages <= 1) return firstData;

    /* Fetch del resto de páginas en paralelo */
    const rest = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) =>
        apiSystem
          .get(`/door-events?last=30d&limit=100&page=${i + 2}`)
          .then((r) => (r.data as HistorySensorType).events ?? []),
      ),
    );

    return {
      ...firstData,
      events: [...(firstData.events ?? []), ...rest.flat()],
    };
  },
};
