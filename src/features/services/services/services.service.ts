import { apiSystem } from "@/apis/apiSystem";
import type { ServicesType } from "../types/services.type";

export const serviceService = {
  getServices: async (): Promise<ServicesType[]> => {
    const response = await apiSystem.get("/services");
    console.log("mis servicios", response.data);

    return response.data as ServicesType[];
  },
};
