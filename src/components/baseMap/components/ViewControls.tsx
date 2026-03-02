import React, { useCallback } from "react";
import {
  IconMap,
  Icon3dCubeSphere,
  IconCompass,
  IconRefresh,
} from "@tabler/icons-react";
import type { ViewControlsProps } from "../types";

const ViewControls: React.FC<ViewControlsProps> = ({
  mapRef,
  initialCenter,
  initialZoom,
}) => {
  const setTopView = useCallback(() => {
    mapRef.current?.easeTo({
      pitch: 0,
      bearing: 0,
      duration: 1000,
    });
  }, [mapRef]);

  const set3DView = useCallback(() => {
    mapRef.current?.easeTo({
      pitch: 60,
      duration: 1000,
    });
  }, [mapRef]);

  const resetNorth = useCallback(() => {
    mapRef.current?.easeTo({
      bearing: 0,
      duration: 800,
    });
  }, [mapRef]);

  const resetView = useCallback(() => {
    mapRef.current?.flyTo({
      center: [initialCenter.longitude, initialCenter.latitude],
      zoom: initialZoom,
      pitch: 0,
      bearing: 0,
      duration: 1500,
    });
  }, [mapRef, initialCenter, initialZoom]);

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={setTopView}
        className="bg-bg-200 gap-2 text-text-100 rounded hover:bg-bg-300 h-8 w-8 flex justify-center items-center transition-all"
        title="Vista superior (2D)"
      >
        <IconMap size={20} />
      </button>
      <button
        onClick={set3DView}
        className="bg-bg-200 gap-2 text-text-100 rounded hover:bg-bg-300 h-8 w-8 flex justify-center items-center transition-all"
        title="Vista 3D"
      >
        <Icon3dCubeSphere size={20} />
      </button>
      <button
        onClick={resetNorth}
        className="bg-bg-200 gap-2 text-text-100 rounded hover:bg-bg-300 h-8 w-8 flex justify-center items-center transition-all"
        title="Orientar al norte"
      >
        <IconCompass size={20} />
      </button>
      <button
        onClick={resetView}
        className="bg-bg-200 gap-2 text-text-100 rounded hover:bg-bg-300 h-8 w-8 flex justify-center items-center transition-all"
        title="Resetear vista"
      >
        <IconRefresh size={20} />
      </button>
    </div>
  );
};

export default ViewControls;
