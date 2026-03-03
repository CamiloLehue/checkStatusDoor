import BottomBar from "@/components/bars/BottomBar";
import RightBar from "@/components/bars/RightBar";
import BaseMap from "@/components/baseMap/components/BaseMap";
import { useBreakpoint } from "@/hooks/useBreakpoints";
import { LineChartWrapper } from "@/libs/recharts";
import { useEffect, useRef, useState, useCallback } from "react";
import type { MapRef } from "react-map-gl";
import { IconArrowNarrowLeft, IconLoader2, IconX } from "@tabler/icons-react";
import { Marker } from "react-map-gl";
import MarkerSensor from "@/features/DoorSensor/components/MarkerSensor";
import type { DoorSensorType } from "@/features/DoorSensor/types/DoorSensor.type";
import { useDoorSensor } from "@/features/DoorSensor/hooks/useDoorSensor";
import { useServices } from "@/features/services/hooks/useServices";
import { ServiceStatusBadge } from "@/features/DoorSensor/components/ServiceStatusBadge";

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
  const { data: statusDoors = [] as DoorSensorType[], isLoading } =
    useDoorSensor();
  const mapRef = useRef<MapRef | null>(null);
  const [hasCentered, setHasCentered] = useState(false);
  const [selectedDoorId, setSelectedDoorId] = useState<number | null>(null);

  const flyToSensor = useCallback((door: DoorSensorType) => {
    setSelectedDoorId(door.id);
    mapRef.current?.flyTo({
      center: [parseFloat(door.center.longitude), parseFloat(door.center.latitude)],
      zoom: 17,
      duration: 900,
    });
  }, []);

  const lat = statusDoors.map((door) => parseFloat(door.center.latitude));
  const lon = statusDoors.map((door) => parseFloat(door.center.longitude));
  const status = statusDoors.map((door) =>
    door.open_status === "abierto" ? true : false,
  );

  useEffect(() => {
    if (!mapRef.current) return;
    if (!statusDoors || statusDoors.length === 0) return;
    if (hasCentered) return;

    const first = statusDoors[0];
    const firstLat = parseFloat(first.center.latitude);
    const firstLon = parseFloat(first.center.longitude);

    try {
      mapRef.current?.flyTo(
        {
          center: [firstLon, firstLat],
          zoom: 14,
          duration: 1200,
        },
        { complete: () => setHasCentered(true) },
      );
    } catch (e) {
      console.warn("Map centering failed", e);
    }
  }, [statusDoors, hasCentered]);

  return (
    <div
      className={`w-full h-full  ${isMobile ? "flex flex-row" : "grid grid-cols-12"}`}
    >
      <div className="col-span-10 h-full flex flex-col w-full">
        {isLoading || statusDoors.length === 0 ? (
          <div className="w-full h-full bg-bg-100 flex items-center justify-center">
            <div className="text-text-200">Cargando sensores del mapa...</div>
          </div>
        ) : (
          <BaseMap
            initialZoom={10}
            onMapRef={(ref) => (mapRef.current = ref)}
            initialCenter={{ longitude: lon[0], latitude: lat[0] }}
          >
            {statusDoors.map((door) => (
              <Marker
                key={door.id}
                latitude={parseFloat(door.center.latitude)}
                longitude={parseFloat(door.center.longitude)}
              >
                <div>
                  <MarkerSensor
                    door={door}
                    isSelected={selectedDoorId === door.id}
                    onSelect={() => flyToSensor(door)}
                  />
                </div>
              </Marker>
            ))}
            {!status[0] && <PopUpDoor data={statusDoors[0]} />}
          </BaseMap>
        )}
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
        <RightBarDashboard
          data={statusDoors}
          selectedDoorId={selectedDoorId}
          onSelectDoor={flyToSensor}
        />
      ) : isOpenRightBar ? (
        <RightBarDashboard
          setOpenRightBar={setOpenRightBar}
          data={statusDoors}
          selectedDoorId={selectedDoorId}
          onSelectDoor={flyToSensor}
        />
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
  data,
  selectedDoorId,
  onSelectDoor,
}: {
  setOpenRightBar?: (isOpen: boolean) => void;
  data: DoorSensorType[];
  selectedDoorId: number | null;
  onSelectDoor: (door: DoorSensorType) => void;
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
        <ContentRightBar
          data={data}
          selectedDoorId={selectedDoorId}
          onSelectDoor={onSelectDoor}
        />
      </RightBar>
    </div>
  );
};

const ContentRightBar = ({
  data,
  selectedDoorId,
  onSelectDoor,
}: {
  data: DoorSensorType[];
  selectedDoorId: number | null;
  onSelectDoor: (door: DoorSensorType) => void;
}) => {
  const { data: services, isLoading: loadingServices, isError: errorServices } = useServices();

  return (
    <div className="flex flex-col gap-4 p-2">
      <div className="flex flex-col gap-1">
        <p className="text-text-200 text-xs uppercase tracking-wide px-1 mb-1">Sensores</p>
        {data.map((door) => {
          const isOpen = door.open_status === "Open";
          const isSelected = selectedDoorId === door.id;
          return (
            <button
              key={door.id}
              onClick={() => onSelectDoor(door)}
              className={`bg-bg-200 relative overflow-hidden transition-all duration-300 rounded-lg py-2 px-4 flex justify-between items-center text-left w-full
                ${
                  isSelected
                    ? "ring-1 ring-bg-400/50 bg-bg-300"
                    : "hover:bg-bg-300"
                }`}
            >
              <div className="flex flex-col min-w-0">
                <small className="font-bold truncate">{door.name}</small>
                <small className="text-text-200 truncate">
                  {door.location_description}
                </small>
                <small className={`font-semibold text-[10px] ${
                  isOpen ? "text-red-400" : "text-green-400"
                }`}>
                  {isOpen ? "Abierto" : "Cerrado"}
                </small>
              </div>
              <span className="relative flex h-3 w-3 shrink-0 ml-2">
                {!isOpen && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-3 w-3 ${
                    isOpen ? "bg-red-500" : "bg-green-400"
                  }`}
                />
              </span>
              <div
                className={`absolute right-0 top-0 h-14 w-14 ${
                  isOpen ? "bg-red-500" : "bg-green-500"
                } opacity-20 blur-2xl pointer-events-none`}
              />
            </button>
          );
        })}
      </div>

      {/* Servicios */}
      <div className="flex flex-col gap-1">
        <p className="text-text-200 text-xs uppercase tracking-wide px-1 mb-1">Servicios</p>
        {loadingServices && (
          <div className="flex items-center gap-2 text-text-300 text-xs px-1 py-1">
            <IconLoader2 size={13} className="animate-spin" />
            Cargando…
          </div>
        )}
        {errorServices && (
          <p className="text-red-400 text-xs px-1">No se pudieron cargar los servicios.</p>
        )}
        {!loadingServices && !errorServices && services && services.length === 0 && (
          <p className="text-text-300 text-xs px-1">Sin servicios registrados.</p>
        )}
        {!loadingServices && !errorServices && services && services.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {services.map((service) => (
              <ServiceStatusBadge key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const PopUpDoor = ({ data }: { data: DoorSensorType }) => {
  return (
    <div className="absolute top-5 right-14 w-100 h-full ">
      <div className="flex flex-col gap-1 p-2 rounded-lg bg-brand-100/50 border border-brand-100 backdrop-blur-sm">
        <h3 className="text-text-100 font-bold">{data.name}</h3>
        <small className="text-text-100">
          {data.open_status === "Open" ? "Abierto" : "Cerrado"}
        </small>
      </div>
    </div>
  );
};
export default Dashboard;
