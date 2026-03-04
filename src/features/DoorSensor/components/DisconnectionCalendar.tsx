import React, { useState } from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconWifi,
  IconWifiOff,
  IconLoader2,
} from "@tabler/icons-react";
import type { Events } from "../types/HistorySensor.type";
import type { DoorSensorType } from "../types/DoorSensor.type";

interface DisconnectionCalendarProps {
  events?: Events[];
  doors?: DoorSensorType[];
  isLoading?: boolean;
}

const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

/**
 * Dado el historial de eventos (últimos 30 días) y la lista de sensores,
 * calcula para cada día del rango si todos, algunos o ningún sensor reportó
 * actividad. Días sin ningún evento se marcan como "desconectado".
 */
const DisconnectionCalendar: React.FC<DisconnectionCalendarProps> = ({
  events = [],
  doors = [],
  isLoading = false,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const getFirstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
    setSelectedDay(null);
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const rawFirstDay = getFirstDayOfMonth(currentDate);
  const firstDay = (rawFirstDay + 6) % 7; // Lun = 0

  const emptySlots = Array.from({ length: firstDay }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const today = new Date();

  /* Agrupar eventos por día del mes actual */
  const eventsByDay = events.reduce(
    (acc, event) => {
      const date = new Date(event.timestamp);
      if (
        date.getMonth() === currentDate.getMonth() &&
        date.getFullYear() === currentDate.getFullYear()
      ) {
        const day = date.getDate();
        if (!acc[day]) acc[day] = new Set<number>();
        acc[day].add(event.id_device);
      }
      return acc;
    },
    {} as Record<number, Set<number>>,
  );

  const totalSensors = doors.length;

  /* Determinar si un día "existe" en el rango de datos (últimos 30 días) */
  const dataStart = new Date(today);
  dataStart.setDate(today.getDate() - 30);

  const dayInRange = (day: number) => {
    const d = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );
    return d >= dataStart && d <= today;
  };

  /* Información del día seleccionado */
  const selectedDevices = selectedDay
    ? eventsByDay[selectedDay.getDate()] ?? new Set<number>()
    : new Set<number>();

  const connectedSensors = doors.filter((d) =>
    selectedDevices.has(d.id_device),
  );
  const disconnectedSensors = doors.filter(
    (d) => !selectedDevices.has(d.id_device),
  );

  return (
    <div className="bg-bg-100 rounded-lg border border-border-200 p-1 relative overflow-hidden flex flex-col min-h-64">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="p-1 hover:bg-bg-300 rounded transition-colors"
        >
          <IconChevronLeft size={16} stroke={1.5} className="text-text-100" />
        </button>
        <span className="text-xs font-semibold text-text-100 uppercase tracking-wide">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </span>
        <button
          onClick={nextMonth}
          className="p-1 hover:bg-bg-300 rounded transition-colors"
        >
          <IconChevronRight size={16} stroke={1.5} className="text-text-100" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
        {["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"].map((d) => (
          <span key={d} className="text-[9px] text-text-100 font-medium">
            {d}
          </span>
        ))}
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center gap-2 text-text-100 text-xs">
          <IconLoader2 size={14} className="animate-spin" />
          Cargando historial…
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-0.5 flex-1 content-start">
          {emptySlots.map((i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((day) => {
            const inRange = dayInRange(day);
            const devicesThisDay = eventsByDay[day];
            const connectedCount = devicesThisDay?.size ?? 0;
            const hasAnyEvent = connectedCount > 0;
            const allConnected =
              totalSensors > 0 && connectedCount >= totalSensors;
            const someDisconnected =
              inRange && !allConnected && totalSensors > 0;
            const fullyDisconnected = inRange && !hasAnyEvent;
            const isSelected = selectedDay?.getDate() === day;

            let cellClass = "text-text-100 cursor-default opacity-30";
            if (inRange) {
              if (fullyDisconnected) {
                cellClass =
                  "bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 cursor-pointer font-bold border border-orange-500/30 shadow-[0_0_8px_rgba(249,115,22,0.15)]";
              } else if (someDisconnected) {
                cellClass =
                  "bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25 cursor-pointer font-semibold border border-yellow-500/20";
              } else {
                cellClass =
                  "bg-green-500/15 text-green-400 hover:bg-green-500/25 cursor-pointer font-semibold border border-green-500/25";
              }
            }

            return (
              <button
                key={day}
                disabled={!inRange}
                onClick={() =>
                  inRange &&
                  setSelectedDay(
                    selectedDay?.getDate() === day
                      ? null
                      : new Date(
                          currentDate.getFullYear(),
                          currentDate.getMonth(),
                          day,
                        ),
                  )
                }
                className={`
                  aspect-square flex items-center justify-center text-[10px] rounded-full transition-all duration-200 relative
                  ${cellClass}
                  ${isSelected ? "ring-2 ring-brand-100 bg-brand-100/20" : ""}
                `}
              >
                {day}
                {inRange && (
                  <span
                    className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full opacity-70 ${
                      fullyDisconnected
                        ? "bg-orange-400"
                        : someDisconnected
                          ? "bg-yellow-400"
                          : "bg-green-400"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-2 flex items-center gap-3 text-[9px] text-text-100 justify-center border-t border-border-200 pt-2 flex-wrap">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-orange-500/50 border border-orange-500/50" />
          Sin señal
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-yellow-500/50 border border-yellow-500/50" />
          Parcial
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500/50 border border-green-500/50" />
          Conectado
        </span>
      </div>

      {selectedDay && (
        <div className="absolute inset-0 bg-bg-200 z-20 flex flex-col animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center bg-bg-100 justify-between w-full px-2 py-2.5 border-b border-border-200">
            <h5 className="font-semibold text-text-100 flex items-center gap-2 text-xs">
              <div className="bg-orange-500/10 p-1 rounded">
                <IconWifiOff size={13} stroke={2} className="text-orange-300" />
              </div>
              {selectedDay.toLocaleDateString("es-CL", {
                day: "numeric",
                month: "long",
              })}
            </h5>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-text-100 p-1 hover:bg-bg-300 rounded transition-colors text-[10px]"
            >
              ✕
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-2 space-y-1.5">
            {disconnectedSensors.length > 0 && (
              <div>
                <p className="text-[9px] uppercase tracking-wide text-orange-400 font-semibold mb-1 px-1">
                  Sin señal ({disconnectedSensors.length})
                </p>
                {disconnectedSensors.map((door) => (
                  <div
                    key={door.id}
                    className="p-2 bg-bg-100 border border-orange-500/20 rounded mb-1 flex items-center gap-2"
                  >
                    <span className="shrink-0">
                      <IconWifiOff
                        size={12}
                        stroke={2}
                        className="text-orange-400"
                      />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-text-100 truncate">
                        {door.name}
                      </p>
                      {door.location_description && (
                        <p className="text-[9px] text-text-200 truncate">
                          {door.location_description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {connectedSensors.length > 0 && (
              <div>
                <p className="text-[9px] uppercase tracking-wide text-green-400 font-semibold mb-1 px-1">
                  Con actividad ({connectedSensors.length})
                </p>
                {connectedSensors.map((door) => (
                  <div
                    key={door.id}
                    className="p-2 bg-bg-100 border border-green-500/20 rounded mb-1 flex items-center gap-2"
                  >
                    <span className="shrink-0">
                      <IconWifi
                        size={12}
                        stroke={2}
                        className="text-green-400"
                      />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-text-100 truncate">
                        {door.name}
                      </p>
                      {door.location_description && (
                        <p className="text-[9px] text-text-200 truncate">
                          {door.location_description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {connectedSensors.length === 0 &&
              disconnectedSensors.length === 0 && (
                <p className="text-[10px] text-text-200 text-center py-4">
                  Sin datos para este día
                </p>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DisconnectionCalendar;
