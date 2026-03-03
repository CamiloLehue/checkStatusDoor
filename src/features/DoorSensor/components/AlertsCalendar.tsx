import React, { useState } from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconX,
  IconAlertTriangle,
  IconDoor,
  IconDoorOff,
  IconLoader2,
} from "@tabler/icons-react";
import type { Events } from "../types/HistorySensor.type";

interface AlertsCalendarProps {
  events?: Events[];
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

const AlertsCalendar: React.FC<AlertsCalendarProps> = ({
  events = [],
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
  // Sunday = 0 → shift so Monday = 0
  const rawFirstDay = getFirstDayOfMonth(currentDate);
  const firstDay = (rawFirstDay + 6) % 7;

  const emptySlots = Array.from({ length: firstDay }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  /* Group events by day of current month */
  const eventsByDay = events.reduce(
    (acc, event) => {
      const date = new Date(event.timestamp);
      if (
        date.getMonth() === currentDate.getMonth() &&
        date.getFullYear() === currentDate.getFullYear()
      ) {
        const day = date.getDate();
        if (!acc[day]) acc[day] = [];
        acc[day].push(event);
      }
      return acc;
    },
    {} as Record<number, Events[]>,
  );

  const selectedEvents = selectedDay
    ? (eventsByDay[selectedDay.getDate()] ?? [])
    : [];

  /* Count open events for the selected day */
  const openCount = selectedEvents.filter(
    (e) => e.status === 1 || e.estado?.toLowerCase() === "open",
  ).length;

  return (
    <div className="bg-bg-100 rounded-lg border border-border-200 p-1 relative overflow-hidden flex flex-col min-h-64">
      {/* ── Header ── */}
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

      {/* ── Day headers (Mon–Sun) ── */}
      <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
        {["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"].map((d) => (
          <span key={d} className="text-[9px] text-text-100 font-medium">
            {d}
          </span>
        ))}
      </div>

      {/* ── Loading state ── */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center gap-2 text-text-100 text-xs">
          <IconLoader2 size={14} className="animate-spin" />
          Cargando historial…
        </div>
      ) : (
        /* ── Calendar grid ── */
        <div className="grid grid-cols-7 gap-0.5 flex-1 content-start">
          {emptySlots.map((i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((day) => {
            const dayEvents = eventsByDay[day];
            const hasEvents = !!dayEvents && dayEvents.length > 0;
            const hasOpen =
              hasEvents &&
              dayEvents.some(
                (e) => e.status === 1 || e.estado?.toLowerCase() === "open",
              );
            const isSelected = selectedDay?.getDate() === day;

            return (
              <button
                key={day}
                disabled={!hasEvents}
                onClick={() =>
                  setSelectedDay(
                    new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth(),
                      day,
                    ),
                  )
                }
                className={`
                  aspect-square flex items-center justify-center text-[10px] rounded-full transition-all duration-200 relative
                  ${
                    hasOpen
                      ? "bg-red-500/60 text-red-200 hover:bg-red-500/35 cursor-pointer font-bold border border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.15)]"
                      : hasEvents
                        ? "bg-green-500/15 text-green-400 hover:bg-green-500/25 cursor-pointer font-semibold border border-green-500/25"
                        : "text-text-100 cursor-default opacity-50"
                  }
                  ${isSelected ? "ring-2 ring-brand-100 bg-brand-100/20" : ""}
                `}
              >
                {day}
                {hasEvents && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-current opacity-70" />
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-2 flex items-center gap-3 text-[9px] text-text-100 justify-center border-t border-border-200 pt-2">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500/50 border border-red-500/50" />
          Apertura
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500/50 border border-green-500/50" />
          Actividad
        </span>
      </div>

      {/* ── Detalle de día ── */}
      {selectedDay && (
        <div className="absolute inset-0 bg-bg-200 z-20 flex flex-col animate-in slide-in-from-bottom-3 duration-200">
          {/* Cabecera de detalle */}
          <div className="flex items-center bg-bg-100 justify-between w-full px-1 py-2.5 border-b border-border-200">
            <h5 className="font-semibold text-text-100 flex items-center gap-2 text-xs ">
              <div className="bg-red-500/10 p-1 rounded">
                <IconAlertTriangle
                  size={13}
                  stroke={2}
                  className="text-red-300"
                />
              </div>
              {selectedDay.toLocaleDateString("es-CL", {
                day: "numeric",
                month: "long",
              })}
              <span className="text-text-100 font-normal">
                · {selectedEvents.length} evento
                {selectedEvents.length !== 1 ? "s" : ""}
                {openCount > 0 && (
                  <span className="ml-1 text-red-400">
                    ({openCount} apertura{openCount !== 1 ? "s" : ""})
                  </span>
                )}
              </span>
            </h5>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-text-100 hover:text-text-100 p-1 hover:bg-bg-300 rounded transition-colors"
            >
              <IconX size={14} stroke={1.5} />
            </button>
          </div>

          {/* Listado de eventos */}
          <div className="overflow-y-auto flex-1 p-2 space-y-1.5 -bg-linear-30 from-bg-100">
            {selectedEvents
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.timestamp).getTime() -
                  new Date(a.timestamp).getTime(),
              )
              .map((event) => {
                const isOpen =
                  event.status === 1 || event.estado?.toLowerCase() === "open";
                return (
                  <div
                    key={event._id}
                    className={`p-2.5 bg-bg-100  border border-border-200 transition-colors `}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-mono text-text-100">
                        {new Date(event.timestamp).toLocaleTimeString("es-CL", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                      <span
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${
                          isOpen
                            ? "bg-red-500/15 text-red-400"
                            : "bg-green-500/15 text-green-400"
                        }`}
                      >
                        {isOpen ? (
                          <IconDoor size={10} stroke={2} />
                        ) : (
                          <IconDoorOff size={10} stroke={2} />
                        )}
                        {isOpen ? "Abierta" : "Cerrada"}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-text-100 truncate">
                      {event.nombre}
                    </p>
                    {event.centro_lugar && (
                      <p className="text-[10px] text-text-100 truncate mt-0.5">
                        {event.centro_lugar}
                      </p>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsCalendar;
