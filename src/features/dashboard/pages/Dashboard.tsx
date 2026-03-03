import BottomBar from "@/components/bars/BottomBar";
import RightBar from "@/components/bars/RightBar";
import BaseMap from "@/components/baseMap/components/BaseMap";
import { useBreakpoint } from "@/hooks/useBreakpoints";
import { useEffect, useRef, useState, useCallback } from "react";
import type { MapRef } from "react-map-gl";
import { IconArrowNarrowLeft, IconLoader2, IconX } from "@tabler/icons-react";
import { Marker } from "react-map-gl";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import MarkerSensor from "@/features/DoorSensor/components/MarkerSensor";
import type { DoorSensorType } from "@/features/DoorSensor/types/DoorSensor.type";
import { useDoorSensor } from "@/features/DoorSensor/hooks/useDoorSensor";
import { useServices } from "@/features/services/hooks/useServices";
import type { ServicesType } from "@/features/services/types/services.type";
import { ServiceStatusBadge } from "@/features/DoorSensor/components/ServiceStatusBadge";
import AlertsCalendar from "@/features/DoorSensor/components/AlertsCalendar";
import { useHistorySensor } from "@/features/DoorSensor/hooks/useHistorySensor";

function Dashboard() {
  const { isMobile } = useBreakpoint();
  const [isOpenRightBar, setOpenRightBar] = useState(false);
  const { data: servicesSensor } = useServices();
  const { data: statusDoors = [] as DoorSensorType[], isLoading } =
    useDoorSensor();
  const mapRef = useRef<MapRef | null>(null);
  const [hasCentered, setHasCentered] = useState(false);
  const [selectedDoorId, setSelectedDoorId] = useState<number | null>(null);

  const flyToSensor = useCallback((door: DoorSensorType) => {
    setSelectedDoorId(door.id);
    mapRef.current?.flyTo({
      center: [
        parseFloat(door.center.longitude),
        parseFloat(door.center.latitude),
      ],
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
            <div className="absolute left-2 top-2 flex flex-col gap-2">
              {servicesSensor?.map((service) => (
                <ServiceStatusBadge key={service.id} service={service} />
              ))}
            </div>

            {statusDoors.map((door) => (
              <Marker
                key={door.id}
                latitude={parseFloat(door.center.latitude)}
                longitude={parseFloat(door.center.longitude)}
              >
                <div className="z-9999">
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
          title="Monitoreo General"
          overlays={<div className="bg-100 px-3">Overlays</div>}
        >
          <div className="grid grid-cols-2 divide-x divide-border-200">
            <ServiceStatusChart />
            <SensorStatusChart doors={statusDoors} />
          </div>
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
        title="Actividad"
        subTitle="Monitoreo de sensores"
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
  const { data: historyEvents = [], isLoading: loadingHistory } =
    useHistorySensor();

  return (
    <div className="flex flex-col gap-4 p-2">
      <div className="flex flex-col gap-1">
        <p className="text-text-100  text-xs uppercase tracking-wide px-1 mb-1">
          Sensores
        </p>
        {data.map((door) => {
          const isOpen = door.open_status === "abierto";
          const isSelected = selectedDoorId === door.id;
          return (
            <button
              key={door.id}
              onClick={() => onSelectDoor(door)}
              className={`bg-bg-200 relative overflow-hidden transition-all duration-300 rounded py-2 px-4 flex justify-between items-center text-left w-full
                ${
                  isSelected
                    ? "bg-bg-100 border-b border-border-200"
                    : "hover:bg-bg-300"
                }`}
            >
              <div className="flex flex-col min-w-0">
                <small className="font-bold truncate">{door.name}</small>
                <small className="text-xs font-bold">{door.updatedAt}</small>

                <small className="text-text-200 truncate">
                  {door.location_description}
                </small>
                <small
                  className={`font-semibold text-[10px] ${
                    isOpen ? "text-red-400" : "text-green-400"
                  }`}
                >
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
      <AlertsCalendar events={historyEvents} isLoading={loadingHistory} />
     
    </div>
  );
};

const PopUpDoor = ({ data }: { data: DoorSensorType }) => {
  return (
    <div className="absolute top-5 right-14 w-100 h-full ">
      <div className="flex flex-col gap-1 p-2 rounded-lg bg-brand-100/50 border border-brand-100 backdrop-blur-sm">
        <h3 className="text-text-100 font-bold">{data.name}</h3>
        <small className="text-text-100">
          {data.open_status === "abierto" ? "Abierto" : "Cerrado"}
        </small>
      </div>
    </div>
  );
};

/* ── Tooltip servicios ── */
const CustomServiceTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; payload: { online: boolean } }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  const isOnline = payload[0]?.payload?.online;
  return (
    <div className="bg-bg-100/95 border border-border-200 rounded-lg px-3 py-2 shadow-xl backdrop-blur-sm">
      <p className="text-text-100 text-xs font-semibold mb-1 truncate max-w-32">
        {label}
      </p>
      <span
        className={`text-[11px] font-bold uppercase tracking-wide ${
          isOnline ? "text-blue-400" : "text-orange-400"
        }`}
      >
        {isOnline ? "● Online" : "● Offline"}
      </span>
    </div>
  );
};

/* ── Gráfico de servicios ── */
const ServiceStatusChart = () => {
  const { data: services = [] as ServicesType[], isLoading } = useServices();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-text-300 text-xs gap-2">
        <IconLoader2 size={14} className="animate-spin" />
        Cargando servicios…
      </div>
    );
  }

  const online = services.filter(
    (s) => s.is_active && s.status === "online",
  ).length;
  const offline = services.length - online;
  const total = services.length;
  const pctOnline = total > 0 ? Math.round((online / total) * 100) : 0;

  const radialData = [
    { name: "bg", value: 100, fill: "#fb923c22" },
    { name: "Online", value: pctOnline, fill: "url(#radialBlue)" },
  ];

  const barData = services.map((s) => ({
    nombre: s.name.length > 9 ? s.name.slice(0, 9) + "…" : s.name,
    nombreCompleto: s.name,
    valor: 1,
    online: s.is_active && s.status === "online",
  }));

  return (
    <div className="flex items-stretch gap-0 h-full w-full overflow-hidden">
      {/* ── Bloque izquierdo: RadialBar + contadores ── */}
      <div className="flex items-center gap-3 shrink-0 pl-3 pr-5 border-r border-border-200">
        {/* Gauge radial */}
        <div className="relative flex items-center justify-center">
          <ResponsiveContainer width={120} height={120}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="58%"
              outerRadius="92%"
              startAngle={210}
              endAngle={-30}
              data={radialData}
              barSize={3}
            >
              <defs>
                <linearGradient id="radialBlue" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity={1} />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity={1} />
                </linearGradient>
              </defs>
              <RadialBar
                dataKey="value"
                cornerRadius={8}
                background={false}
                isAnimationActive
              />
            </RadialBarChart>
          </ResponsiveContainer>
          {/* Número central */}
          <div className="absolute flex flex-col items-center pointer-events-none select-none">
            <span className="text-2xl font-bold text-text-100 leading-none">
              {pctOnline}
              <span className="text-xs text-text-300">%</span>
            </span>
            <span className="text-[9px] text-text-300 uppercase tracking-wide">
              online
            </span>
          </div>
        </div>

        {/* Contadores */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-50" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-400" />
            </span>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-bold text-blue-400">{online}</span>
              <span className="text-[9px] text-text-200 uppercase tracking-wide">
                Online
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500 shrink-0" />
            <div className="flex flex-col leading-none">
              <span className="text-xl font-bold text-orange-400">
                {offline}
              </span>
              <span className="text-[9px] text-text-200 uppercase tracking-wide">
                Offline
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-border-200 shrink-0" />
            <div className="flex flex-col leading-none">
              <span className="text-xl font-bold text-text-200">{total}</span>
              <span className="text-[9px] text-text-200 uppercase tracking-wide">
                Total
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bloque derecho: BarChart por servicio ── */}
      <div className="flex flex-col flex-1 min-w-0 px-3 py-1">
        <span className="text-text-100 text-[10px] uppercase tracking-wide mb-0.5">
          Estado por servicio
        </span>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={barData}
            barCategoryGap="28%"
            margin={{ top: 4, right: 4, bottom: 0, left: -28 }}
          >
            <defs>
              <linearGradient id="svBarBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity={1} />
                <stop offset="100%" stopColor="#3730a3" stopOpacity={0.6} />
              </linearGradient>
              <linearGradient id="svBarOrange" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="red" stopOpacity={1} />
                <stop offset="100%" stopColor="#92400e" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="nombre"
              tick={{ fill: "var(--color-text-300, #9ca3af)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide domain={[0, 1]} />
            <Tooltip
              content={<CustomServiceTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.04)", radius: 6 }}
            />
            <Bar
              dataKey="valor"
              radius={[6, 6, 3, 3]}
              maxBarSize={10}
              isAnimationActive
            >
              {barData.map((entry, i) => (
                <Cell
                  key={`svcell-${i}`}
                  fill={entry.online ? "url(#svBarBlue)" : "url(#svBarOrange)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/* ── Tooltip personalizado ── */
const CustomBarTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; payload: { abierto: boolean } }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  const isOpen = payload[0]?.payload?.abierto;
  return (
    <div className="bg-bg-100/95 border border-border-200 rounded-lg px-3 py-2 shadow-xl backdrop-blur-sm">
      <p className="text-text-100 text-xs font-semibold mb-1 truncate max-w-32">
        {label}
      </p>
      <span
        className={`text-[11px] font-bold uppercase tracking-wide ${
          isOpen ? "text-red-400" : "text-green-400"
        }`}
      >
        {isOpen ? "● Abierto" : "● Cerrado"}
      </span>
    </div>
  );
};

const SensorStatusChart = ({ doors }: { doors: DoorSensorType[] }) => {
  const abiertos = doors.filter((d) => d.open_status === "abierto").length;
  const cerrados = doors.length - abiertos;
  const total = doors.length;
  const pctCerrado = total > 0 ? Math.round((cerrados / total) * 100) : 0;

  const radialData = [
    { name: "bg", value: 100, fill: "#f8717122" },
    { name: "Cerrados", value: pctCerrado, fill: "url(#radialGreen)" },
  ];

  const barData = doors.map((d) => ({
    nombre: d.name.length > 9 ? d.name.slice(0, 9) + "…" : d.name,
    nombreCompleto: d.name,
    valor: 1,
    abierto: d.open_status === "abierto",
  }));

  return (
    <div className="flex items-stretch gap-0 h-full w-full overflow-hidden">
      {/* ── Bloque izquierdo: RadialBar + contadores ── */}
      <div className="flex items-center gap-3 shrink-0 pl-3 pr-5 border-r border-border-200">
        {/* Gauge radial */}
        <div className="relative flex items-center justify-center">
          <ResponsiveContainer width={120} height={120}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="58%"
              outerRadius="92%"
              startAngle={210}
              endAngle={-30}
              data={radialData}
              barSize={3}
            >
              <defs>
                <linearGradient id="radialGreen" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#4ade80" stopOpacity={1} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={1} />
                </linearGradient>
              </defs>
              <RadialBar
                dataKey="value"
                cornerRadius={8}
                background={false}
                isAnimationActive
              />
            </RadialBarChart>
          </ResponsiveContainer>
          {/* Número central */}
          <div className="absolute flex flex-col items-center pointer-events-none select-none">
            <span className="text-2xl font-bold text-text-100 leading-none">
              {pctCerrado}
              <span className="text-xs text-text-300">%</span>
            </span>
            <span className="text-[9px] text-text-300 uppercase tracking-wide">
              cerrados
            </span>
          </div>
        </div>

        {/* Contadores */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-50" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-400" />
            </span>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-bold text-green-400">
                {cerrados}
              </span>
              <span className="text-[9px] text-text-200 uppercase tracking-wide">
                Cerrados
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 shrink-0" />
            <div className="flex flex-col leading-none">
              <span className="text-xl font-bold text-red-400">{abiertos}</span>
              <span className="text-[9px] text-text-200 uppercase tracking-wide">
                Abiertos
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-border-200 shrink-0" />
            <div className="flex flex-col leading-none">
              <span className="text-xl font-bold text-text-200">{total}</span>
              <span className="text-[9px] text-text-200 uppercase tracking-wide">
                Total
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bloque derecho: BarChart por sensor ── */}
      <div className="flex flex-col flex-1 min-w-0 px-3 py-1">
        <span className="text-text-100 text-[10px] uppercase tracking-wide mb-0.5">
          Estado por sensor
        </span>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={barData}
            barCategoryGap="28%"
            margin={{ top: 4, right: 4, bottom: 0, left: -28 }}
          >
            <defs>
              <linearGradient id="sbarGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4ade80" stopOpacity={1} />
                <stop offset="100%" stopColor="#16a01a" stopOpacity={0.6} />
              </linearGradient>
              <linearGradient id="sbarRed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f87171" stopOpacity={1} />
                <stop offset="100%" stopColor="#b91c1c" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="nombre"
              tick={{ fill: "var(--color-text-300, #9ca3af)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide domain={[0, 1]} />
            <Tooltip
              content={<CustomBarTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.04)", radius: 6 }}
            />
            <Bar
              dataKey="valor"
              radius={[6, 6, 3, 3]}
              maxBarSize={10}
              isAnimationActive
            >
              {barData.map((entry, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={entry.abierto ? "url(#sbarRed)" : "url(#sbarGreen)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
