import React, { useCallback } from "react";
import { IconPlus, IconMinus } from "@tabler/icons-react";
import type { CustomZoomControlProps } from "../types";

const CustomZoomControl: React.FC<CustomZoomControlProps> = React.memo(
  ({ mapRef }) => {
    const handleZoomIn = useCallback(() => {
      mapRef.current?.zoomIn();
    }, [mapRef]);

    const handleZoomOut = useCallback(() => {
      mapRef.current?.zoomOut();
    }, [mapRef]);

    return (
      <div className="flex flex-col gap-1">
        <button
          onClick={handleZoomIn}
          className="bg-bg-200 gap-2 text-text-100 rounded hover:bg-bg-300 h-8 w-8 flex justify-center items-center transition-all"
          title="Acercar"
        >
          <IconPlus size={20} />
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-bg-200 gap-2 text-text-100 rounded hover:bg-bg-300 h-8 w-8 flex justify-center items-center transition-all"
          title="Alejar"
        >
          <IconMinus size={20} />
        </button>
      </div>
    );
  }
);

CustomZoomControl.displayName = "CustomZoomControl";

export default CustomZoomControl;
