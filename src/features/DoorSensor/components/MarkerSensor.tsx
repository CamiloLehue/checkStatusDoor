import { IconAnalyze, IconX } from "@tabler/icons-react";
import "./style.css";
import { useEffect, useRef, useState } from "react";
import type { DoorSensorType } from "@/features/DoorSensor/types/DoorSensor.type";

interface MarkerSensorProps {
  door: DoorSensorType;
  isSelected?: boolean;
  onSelect?: () => void;
}

function MarkerSensor({ door, isSelected, onSelect }: MarkerSensorProps) {
  const [openModal, setOpenModal] = useState(false);
  const estado = door.open_status === "Open";
  const indicatorClasses = !estado
    ? "bg-linear-30 from-green-300 to-lime-300 text-green-800"
    : "bg-linear-30 from-red-400 to-rose-400 text-red-800";

  function handleClick() {
    onSelect?.();
    setOpenModal((v) => !v);
  }

  return (
    <div className="relative">
      <button
        aria-expanded={openModal}
        aria-label="Información del sensor"
        onClick={handleClick}
        className={`marker-sensor w-8 h-8 flex items-center justify-center ${
          isSelected ? "bg-brand-200/20 rounded-full" : ""
        }`}
      >
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center ${indicatorClasses}`}
        >
          <IconAnalyze size={14} stroke={3} />
        </div>
      </button>

      {openModal && (
        <div className="absolute inset-0 z-200 min-w-2xl">
          <ModalSensor door={door} onClose={() => setOpenModal(false)} />
        </div>
      )}
    </div>
  );
}

const ModalSensor = ({
  door,
  onClose,
}: {
  door: DoorSensorType;
  onClose: () => void;
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    function onMouseDown(e: MouseEvent) {
      if (!modalRef.current) return;
      if (!modalRef.current.contains(e.target as Node)) onClose();
    }

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onMouseDown);

    closeBtnRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [onClose]);

  const estado = door.open_status === "Open";
  const statusText = estado ? "Abierto" : "Cerrado";
  const statusColor = estado ? "text-red-500" : "text-green-500";

  return (
    <div className="flex items-start justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Detalles del sensor de puerta"
        ref={modalRef}
        className="w-full grid grid-cols-2 gap-5 rounded bg-linear-30 from-bg-100 to-bg-100 shadow-lg p-4"
      >
        <div className=" h-70 rounded overflow-hidden">
          <img src="/centro.png" alt="" className="object-cover" />
        </div>
        <div>
          <div className="flex justify-between items-center border-b border-border-200 pb-1">
            <h3 className="text-text-100">{door.name}</h3>
            <button
              ref={closeBtnRef}
              onClick={onClose}
              className="text-text-200 outline outline-transparent"
              aria-label="Cerrar"
            >
              <IconX size={20} stroke={1.5} />
            </button>
          </div>

          <div className="flex flex-col gap-7 mt-2">
            <div className="flex justify-between items-center">
              <p className="text-text-200 text-xs">Estado</p>
              <p className={`text-xs font-semibold ${statusColor}`}>
                {statusText}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-text-200 text-xs">Ubicación</p>
              <p className="text-text-100 text-xs">
                {door.location_description}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-text-200 text-xs">Latitud</p>
              <p className="text-text-100 text-xs">{door.center.latitude}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-text-200 text-xs">Longitud</p>
              <p className="text-text-100 text-xs">{door.center.longitude}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-text-200 text-xs">Centro</p>
              <p className="text-text-100 text-xs">{door.center.name}</p>
            </div>
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default MarkerSensor;
