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
  AreaChart,
  Area,
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
import DisconnectionCalendar from "@/features/DoorSensor/components/DisconnectionCalendar";
import { useHistorySensor } from "@/features/DoorSensor/hooks/useHistorySensor";
import type { Events } from "@/features/DoorSensor/types/HistorySensor.type";

function Dashboard() {
  const { isMobile } = useBreakpoint();
  const [isOpenRightBar, setOpenRightBar] = useState(false);
  const { data: servicesSensor } = useServices();
  const { data: statusDoors = [] as DoorSensorType[], isLoading } =
    useDoorSensor();
  const { data: historyEvents = [], isLoading: loadingHistory } =
    useHistorySensor();
  const mapRef = useRef<MapRef | null>(null);
  const [hasCentered, setHasCentered] = useState(false);
  const [selectedDoorId, setSelectedDoorId] = useState<number | null>(null);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<Date | null>(
    null,
  );

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
      className={`w-full h-full  ${isMobile ? "flex flex-row" : "grid grid-cols-12 overflow-hidden max-h-screen"}`}
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
            {status[0] && <PopUpDoor data={statusDoors[0]} />}
          </BaseMap>
        )}
        <BottomBar
          title={
            selectedCalendarDay
              ? `Historial — ${selectedCalendarDay.toLocaleDateString("es-CL", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}`
              : ""
          }
        >
          <div className="grid grid-cols-2 divide-x divide-border-200">
            <ServiceStatusChart />
            <SensorStatusChart
              doors={statusDoors}
              selectedDay={selectedCalendarDay}
              historyEvents={historyEvents}
            />
          </div>
        </BottomBar>
      </div>
      {!isMobile ? (
        <RightBarDashboard
          data={statusDoors}
          selectedDoorId={selectedDoorId}
          onSelectDoor={flyToSensor}
          historyEvents={historyEvents}
          loadingHistory={loadingHistory}
          onCalendarDaySelect={setSelectedCalendarDay}
        />
      ) : isOpenRightBar ? (
        <RightBarDashboard
          setOpenRightBar={setOpenRightBar}
          data={statusDoors}
          selectedDoorId={selectedDoorId}
          onSelectDoor={flyToSensor}
          historyEvents={historyEvents}
          loadingHistory={loadingHistory}
          onCalendarDaySelect={setSelectedCalendarDay}
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
  historyEvents,
  loadingHistory,
  onCalendarDaySelect,
}: {
  setOpenRightBar?: (isOpen: boolean) => void;
  data: DoorSensorType[];
  selectedDoorId: number | null;
  onSelectDoor: (door: DoorSensorType) => void;
  historyEvents: Events[];
  loadingHistory: boolean;
  onCalendarDaySelect: (day: Date | null) => void;
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
      <RightBar title="Actividad" subTitle="Monitoreo de sensores">
        <ContentRightBar
          data={data}
          selectedDoorId={selectedDoorId}
          onSelectDoor={onSelectDoor}
          historyEvents={historyEvents}
          loadingHistory={loadingHistory}
          onCalendarDaySelect={onCalendarDaySelect}
        />
      </RightBar>
    </div>
  );
};

const ContentRightBar = ({
  data,
  selectedDoorId,
  onSelectDoor,
  historyEvents,
  loadingHistory,
  onCalendarDaySelect,
}: {
  data: DoorSensorType[];
  selectedDoorId: number | null;
  onSelectDoor: (door: DoorSensorType) => void;
  historyEvents: Events[];
  loadingHistory: boolean;
  onCalendarDaySelect: (day: Date | null) => void;
}) => {
  const [activeTab, setActiveTab] = useState<"calendarios" | "sensores">(
    "calendarios",
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-border-200 shrink-0">
        <button
          onClick={() => setActiveTab("calendarios")}
          className={`flex-1 py-2 text-[11px] font-semibold uppercase tracking-wide transition-colors duration-200 ${
            activeTab === "calendarios"
              ? "text-text-100 border-b-2 border-brand-100 -mb-px"
              : "text-text-200 hover:text-text-100"
          }`}
        >
          Calendarios
        </button>
        <button
          onClick={() => setActiveTab("sensores")}
          className={`flex-1 py-2 text-[11px] font-semibold uppercase tracking-wide transition-colors duration-200 ${
            activeTab === "sensores"
              ? "text-text-100 border-b-2 border-brand-100 -mb-px"
              : "text-text-200 hover:text-text-100"
          }`}
        >
          Sensores
        </button>
      </div>

      {activeTab === "calendarios" && (
        <div className="flex flex-col gap-4 p-2">
          <div>
            <p className="text-text-100 text-xs uppercase tracking-wide px-1 mb-2">
              Calendario de eventos recientes
            </p>
            <AlertsCalendar
              events={historyEvents}
              isLoading={loadingHistory}
              onDaySelect={onCalendarDaySelect}
            />
          </div>
          <div>
            <p className="text-text-100 text-xs uppercase tracking-wide px-1 mb-2">
              Calendario de conexión
            </p>
            <DisconnectionCalendar
              events={historyEvents}
              doors={data}
              isLoading={loadingHistory}
            />
          </div>
        </div>
      )}

      {activeTab === "sensores" && (
        <div className="flex flex-col gap-1 p-2">
          {data.map((door) => {
            const isOpen = door.open_status === "abierto";
            const isSelected = selectedDoorId === door.id;
            return (
              <button
                key={door.id}
                onClick={() => onSelectDoor(door)}
                className={`bg-bg-200 relative overflow-hidden transition-all duration-300 rounded py-0.5 px-4 flex justify-between items-center text-left w-full
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
      )}

      <div className="flex flex-col justify-center items-center">
        <h5 className="text-xl">Creado para</h5>
        <img
          src="https://www.ast.cl/img/inicio/clientes-ast/salmonesautralpng.png"
          alt="salmonesautral"
          className=" max-w-50  rounded-full"
        />
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
          {data.open_status === "abierto" ? "Abierto" : "Cerrado"}
        </small>
      </div>
    </div>
  );
};

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
      <div className="flex items-center gap-3 shrink-0 pl-3 pr-5 border-r border-border-200">
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

      <div className="flex flex-col flex-1 min-w-0 px-3 py-1">
        <span className="text-text-100 text-[13px] uppercase tracking-wide mb-0.5">
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

const ECG_COLORS = ["#f87171", "#60a5fa", "#a78bfa", "#fb923c", "#34d399"];

const CustomEcgTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-100/95 border border-border-200 rounded-lg px-3 py-2 shadow-xl backdrop-blur-sm">
      <p className="text-text-100 text-xs font-semibold mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-[11px]">
          <span style={{ color: p.color }}>●</span>
          <span className="text-text-200">
            {p.name}:{" "}
            <span className="font-bold" style={{ color: p.color }}>
              {p.value === 1 ? "Abierto" : "Cerrado"}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
};

const SensorStatusChart = ({
  doors,
  selectedDay = null,
  historyEvents = [],
}: {
  doors: DoorSensorType[];
  selectedDay?: Date | null;
  historyEvents?: Events[];
}) => {
  if (selectedDay) {
    const dayEvents = historyEvents.filter((e) => {
      const d = new Date(e.timestamp);
      return (
        d.getDate() === selectedDay.getDate() &&
        d.getMonth() === selectedDay.getMonth() &&
        d.getFullYear() === selectedDay.getFullYear()
      );
    });

    const isOpen = (e: Events) =>
      e.status === 1 || e.estado?.toLowerCase() === "open";

    const totalAperturas = dayEvents.filter(isOpen).length;
    const totalCierres = dayEvents.length - totalAperturas;
    const total = dayEvents.length;
    const pctAper = total > 0 ? Math.round((totalAperturas / total) * 100) : 0;

    const radialHistData = [
      { name: "bg", value: 100, fill: "#4ade8022" },
      { name: "Aperturas", value: pctAper, fill: "url(#radialHistRed)" },
    ];

    const daySorted = [...dayEvents].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    const daySensorKeys = [
      ...new Set(daySorted.map((e) => String(e.id_device))),
    ];
    const daySensorLabel: Record<string, string> = {};
    daySorted.forEach((e) => {
      daySensorLabel[String(e.id_device)] = e.nombre;
    });
    const dayCurState: Record<string, number> = {};
    daySensorKeys.forEach((k) => (dayCurState[k] = 0));
    const dayEcgData = daySorted.map((e) => {
      const k = String(e.id_device);
      dayCurState[k] = isOpen(e) ? 1 : 0;
      const t = new Date(e.timestamp);
      const label = `${t.getHours().toString().padStart(2, "0")}:${t.getMinutes().toString().padStart(2, "0")}`;
      return {
        t: label,
        ...Object.fromEntries(daySensorKeys.map((sk) => [sk, dayCurState[sk]])),
      };
    });

    return (
      <div className="flex items-stretch gap-0 h-full w-full overflow-hidden">
        <div className="flex items-center gap-3 shrink-0 pl-3 pr-5 border-r border-border-200">
          <div className="relative flex items-center justify-center">
            <ResponsiveContainer width={120} height={120}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="58%"
                outerRadius="92%"
                startAngle={210}
                endAngle={-30}
                data={radialHistData}
                barSize={3}
              >
                <defs>
                  <linearGradient
                    id="radialHistRed"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="#f87171" stopOpacity={1} />
                    <stop offset="100%" stopColor="#fb923c" stopOpacity={1} />
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
            <div className="absolute flex flex-col items-center pointer-events-none select-none">
              <span className="text-2xl font-bold text-text-100 leading-none">
                {pctAper}
                <span className="text-xs text-text-300">%</span>
              </span>
              <span className="text-[9px] text-text-300 uppercase tracking-wide">
                apert.
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 shrink-0" />
              <div className="flex flex-col leading-none">
                <span className="text-xl font-bold text-red-400">
                  {totalAperturas}
                </span>
                <span className="text-[9px] text-text-200 uppercase tracking-wide">
                  Apert.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500 shrink-0" />
              <div className="flex flex-col leading-none">
                <span className="text-xl font-bold text-green-400">
                  {totalCierres}
                </span>
                <span className="text-[9px] text-text-200 uppercase tracking-wide">
                  Cierres
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

        <div className="flex flex-col flex-1 min-w-0 px-3 py-1">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-text-100 text-[10px] uppercase tracking-wide">
              Actividad del día
            </span>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {daySensorKeys.map((k, i) => (
                <span
                  key={k}
                  className="text-[9px] truncate max-w-20"
                  style={{ color: ECG_COLORS[i % ECG_COLORS.length] }}
                >
                  ● {daySensorLabel[k]}
                </span>
              ))}
            </div>
          </div>
          {dayEcgData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-text-300 text-xs">
              Sin eventos ese día
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dayEcgData}
                margin={{ top: 6, right: 4, bottom: 0, left: -28 }}
              >
                <defs>
                  {daySensorKeys.map((k, i) => (
                    <linearGradient
                      key={k}
                      id={`dayEcgFill${i}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={ECG_COLORS[i % ECG_COLORS.length]}
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="100%"
                        stopColor={ECG_COLORS[i % ECG_COLORS.length]}
                        stopOpacity={0.03}
                      />
                    </linearGradient>
                  ))}
                </defs>
                <XAxis
                  dataKey="t"
                  tick={{ fill: "var(--color-text-300, #9ca3af)", fontSize: 8 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  hide
                  domain={[0, 1]}
                  allowDecimals={false}
                  ticks={[0, 1]}
                />
                <Tooltip
                  content={<CustomEcgTooltip />}
                  cursor={{ stroke: "rgba(255,255,255,0.12)", strokeWidth: 1 }}
                />
                {daySensorKeys.map((k, i) => (
                  <Area
                    key={k}
                    type="stepAfter"
                    dataKey={k}
                    name={daySensorLabel[k]}
                    stroke={ECG_COLORS[i % ECG_COLORS.length]}
                    strokeWidth={1.5}
                    fill={`url(#dayEcgFill${i})`}
                    dot={false}
                    activeDot={{
                      r: 3,
                      fill: ECG_COLORS[i % ECG_COLORS.length],
                      strokeWidth: 0,
                    }}
                    isAnimationActive
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    );
  }

  const isOpenEvent30d = (e: Events) =>
    e.status === 1 ||
    e.estado?.toLowerCase() === "abierto" ||
    e.estado?.toLowerCase() === "open";
  const totalApert = historyEvents.filter(isOpenEvent30d).length;
  const totalCierr = historyEvents.length - totalApert;
  const totalEvts = historyEvents.length;
  const pctAbierto =
    totalEvts > 0 ? Math.round((totalApert / totalEvts) * 100) : 0;

  /* Estado live actual de puertas (para el ping de alerta) */
  const isOpenDoor = (d: DoorSensorType) => {
    const s = d.open_status?.toLowerCase();
    return s === "abierto" || s === "open";
  };
  const hayAbiertoAhora = doors.some(isOpenDoor);

  const radialData = [
    { name: "bg", value: 100, fill: "#4ade8022" },
    { name: "Aperturas", value: pctAbierto, fill: "url(#radialGreen)" },
  ];

  return (
    <div className="flex items-stretch gap-0 h-full w-full overflow-hidden">
      <div className="flex items-center gap-3 shrink-0 pl-3 pr-5 border-r border-border-200">
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
                  <stop offset="0%" stopColor="#f87171" stopOpacity={1} />
                  <stop offset="100%" stopColor="#fb923c" stopOpacity={1} />
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
          <div className="absolute flex flex-col items-center pointer-events-none select-none">
            <span className="text-2xl font-bold text-text-100 leading-none">
              {pctAbierto}
              <span className="text-xs text-text-300">%</span>
            </span>
            <span className="text-[9px] text-text-300 uppercase tracking-wide">
              apert. 30d
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              {hayAbiertoAhora && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-50" />
              )}
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-400" />
            </span>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-bold text-red-400">
                {totalApert}
              </span>
              <span className="text-[9px] text-text-200 uppercase tracking-wide">
                Apert.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500 shrink-0" />
            <div className="flex flex-col leading-none">
              <span className="text-xl font-bold text-green-400">
                {totalCierr}
              </span>
              <span className="text-[9px] text-text-200 uppercase tracking-wide">
                Cierres
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-border-200 shrink-0" />
            <div className="flex flex-col leading-none">
              <span className="text-xl font-bold text-text-200">
                {totalEvts}
              </span>
              <span className="text-[9px] text-text-200 uppercase tracking-wide">
                Eventos
              </span>
            </div>
          </div>
        </div>
      </div>

      {(() => {
        const sorted = [...historyEvents].sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        );
        const sensorKeys = [...new Set(sorted.map((e) => String(e.id_device)))];
        const sensorLabel: Record<string, string> = {};
        sorted.forEach((e) => {
          sensorLabel[String(e.id_device)] = e.nombre;
        });
        const curState: Record<string, number> = {};
        sensorKeys.forEach((k) => (curState[k] = 0));
        const ecgData = sorted.map((e) => {
          const k = String(e.id_device);
          curState[k] =
            e.status === 1 || e.estado?.toLowerCase() === "open" ? 1 : 0;
          const t = new Date(e.timestamp);
          const label = `${t.getDate().toString().padStart(2, "0")}/${(t.getMonth() + 1).toString().padStart(2, "0")} ${t
            .getHours()
            .toString()
            .padStart(2, "0")}:${t.getMinutes().toString().padStart(2, "0")}`;
          return {
            t: label,
            ...Object.fromEntries(sensorKeys.map((sk) => [sk, curState[sk]])),
          };
        });

        return (
          <div className="flex flex-col flex-1 min-w-0 px-3 py-1">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-text-100 text-[13px] uppercase tracking-wide">
                Aperturas y cierres recientes
              </span>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {sensorKeys.map((k, i) => (
                  <span
                    key={k}
                    className="text-[9px] truncate max-w-20"
                    style={{ color: ECG_COLORS[i % ECG_COLORS.length] }}
                  >
                    ● {sensorLabel[k]}
                  </span>
                ))}
              </div>
            </div>
            {ecgData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-text-300 text-xs">
                Sin historial registrado
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={ecgData}
                  margin={{ top: 6, right: 4, bottom: 0, left: -28 }}
                >
                  <defs>
                    {sensorKeys.map((k, i) => (
                      <linearGradient
                        key={k}
                        id={`ecgFill${i}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={ECG_COLORS[i % ECG_COLORS.length]}
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="100%"
                          stopColor={ECG_COLORS[i % ECG_COLORS.length]}
                          stopOpacity={0.03}
                        />
                      </linearGradient>
                    ))}
                  </defs>
                  <XAxis
                    dataKey="t"
                    tick={{
                      fill: "var(--color-text-300, #9ca3af)",
                      fontSize: 8,
                    }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    hide
                    domain={[0, 1]}
                    allowDecimals={false}
                    ticks={[0, 1]}
                  />
                  <Tooltip
                    content={<CustomEcgTooltip />}
                    cursor={{
                      stroke: "rgba(255,255,255,0.12)",
                      strokeWidth: 1,
                    }}
                  />
                  {sensorKeys.map((k, i) => (
                    <Area
                      key={k}
                      type="stepAfter"
                      dataKey={k}
                      name={sensorLabel[k]}
                      stroke={ECG_COLORS[i % ECG_COLORS.length]}
                      strokeWidth={1.5}
                      fill={`url(#ecgFill${i})`}
                      dot={false}
                      activeDot={{
                        r: 3,
                        fill: ECG_COLORS[i % ECG_COLORS.length],
                        strokeWidth: 0,
                      }}
                      isAnimationActive
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        );
      })()}
    </div>
  );
};

export default Dashboard;
