import BottomBar from "@/components/bars/BottomBar";
import RightBar from "@/components/bars/RightBar";
import BaseMap from "@/components/baseMap/components/BaseMap";
import { useBreakpoint } from "@/hooks/useBreakpoints";
import { LineChartWrapper } from "@/libs/recharts";
import { useState } from "react";
import { IconArrowNarrowLeft, IconX } from "@tabler/icons-react";
import { Marker } from "react-map-gl";
import MarkerSensor from "@/features/DoorSensor/components/MarkerSensor";

// Ejemplo de uso
const actividadPuertas = [
  { nombre: "Puerta 1", aperturas: 45, cierres: 42 },
  { nombre: "Puerta 2", aperturas: 32, cierres: 30 },
  { nombre: "Puerta 3", aperturas: 28, cierres: 28 },
  { nombre: "Puerta 4", aperturas: 15, cierres: 14 },
  { nombre: "Puerta 5", aperturas: 52, cierres: 50 },
];

function Dashboard() {
  const { isMobile } = useBreakpoint();
  const [isOpenRightBar, setOpenRightBar] = useState(false);
  return (
    <div
      className={`w-full h-full  ${isMobile ? "flex flex-row" : "grid grid-cols-12"}`}
    >
      <div className="col-span-10 h-full flex flex-col w-full">
        <BaseMap>
          <Marker
            latitude={-42.91486354998348}
            longitude={-72.71428627459254}
          >
            <div>
              <MarkerSensor />
            </div>
          </Marker>
        </BaseMap>
        <BottomBar
          title="Actividad de Puertas"
          overlays={<div className="bg-100 px-3">Overlays</div>}
        >
          <LineChartWrapper
            data={actividadPuertas}
            dataKey={["aperturas", "cierres"]}
            xAxisKey="nombre"
            height={170}
            colors={["gray", "red"]}
            showGrid={true}
            showLegend={true}
          ></LineChartWrapper>
        </BottomBar>
      </div>
      {!isMobile ? (
        <RightBarDashboard />
      ) : isOpenRightBar ? (
        <RightBarDashboard setOpenRightBar={setOpenRightBar} />
      ) : (
        <button
          className="absolute right-0 z-50 top-[50%] rounded-s-sm bg-brand-100 "
          onClick={() => setOpenRightBar && setOpenRightBar(true)}
        >
          <IconArrowNarrowLeft size={24} stroke={1.5} />
        </button>
      )}
    </div>
  );
}

const RightBarDashboard = ({
  setOpenRightBar,
}: {
  setOpenRightBar?: (isOpen: boolean) => void;
}) => {
  return (
    <div className="relative col-span-2 z-50 ">
      {setOpenRightBar && (
        <button
          onClick={() => setOpenRightBar && setOpenRightBar(false)}
          className="absolute top-2 flex justify-center items-center right-2 z-50  outline outline-transparent"
        >
          <IconX size={20} stroke={1.5} />
        </button>
      )}
      <RightBar
        title="Actividad de Puertas"
        overlays={
          <div className="px-3 py-4  border-b border-border-200">
            <small>Overlays</small>
          </div>
        }
      >
        <div>
          <small>Contenido del RightBar</small>
        </div>
      </RightBar>
    </div>
  );
};

export default Dashboard;
