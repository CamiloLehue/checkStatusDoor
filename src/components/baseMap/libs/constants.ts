import type { MapCenter } from "../types";

export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";

export const DEFAULT_CENTER: MapCenter = {
  longitude: -72.71428627459254,
  latitude: -42.91486354998348,
};
export const MAP_ZOOM_LEVEL = 13;

export const MAP_STYLES = {
  street: "mapbox://styles/mapbox/streets-v12",
  dark: "mapbox://styles/mapbox/dark-v11",
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
  smooth: "mapbox://styles/mapbox/satellite-v9",
} as const;
