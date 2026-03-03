import type { ServicesType } from "@/features/services/types/services.type";

interface ServiceStatusBadgeProps {
  service: ServicesType;
}

export function ServiceStatusBadge({ service }: ServiceStatusBadgeProps) {
  const isOnline = service.is_active && service.status === "online";

  return (
    <div className="flex items-center justify-between py-1.5 px-2 rounded bg-bg-100 border border-border-200">
      <div className="flex flex-col min-w-0">
        <span className="text-text-100 text-xs font-medium truncate leading-tight">
          {service.name}
        </span>
        <span className="text-text-200 text-[10px] leading-tight truncate">
          {service.type} · {service.ip_address}
        </span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 ml-2">
        <span
          className={`text-[10px] font-semibold uppercase tracking-wide ${
            isOnline ? "text-green-400" : "text-red-400"
          }`}
        >
          {isOnline ? "Activo" : "Inactivo"}
        </span>
        <span className="relative flex h-2.5 w-2.5">
          {isOnline && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
          )}
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isOnline ? "bg-green-400" : "bg-red-500"
            }`}
          />
        </span>
      </div>
    </div>
  );
}
