export interface DoorSensorType {
    nombre: string;
    status: string;
    latitud: number;
    longitud: number;
    estado: string;
    timestamp: Date;
}

// nombre: nombre_centro,
// status: msg.payload,
// latitud: latitud,
// longitud: longitud,
// estado: estado,
// timestamp: new Date()