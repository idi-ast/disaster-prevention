// Escala Mercalli simplificada para representar la intensidad percibida
export type SismoIntensidad =
  | "imperceptible" // I   — < 2.0 Richter
  | "débil"         // II-III — 2.0 - 3.9
  | "moderado"      // IV-V — 4.0 - 4.9
  | "fuerte"        // VI-VII — 5.0 - 5.9
  | "severo"        // VIII+ — ≥ 6.0

export type SismoNivel = "bajo" | "medio" | "alto" | "crítico";

export interface SismoData {
  id: string;
  zona: string;
  descripcionZona: string;
  magnitud: number;           // Escala Richter
  intensidad: SismoIntensidad;
  nivel: SismoNivel;
  profundidad: number;        // km
  movimientos: number;        // Cantidad de eventos telúricos registrados en el sistema
  coordenadas: {
    latitude: number;
    longitude: number;
  };
  ultimoRegistro: string;     // ISO date string
}

export interface SismoResumenStats {
  totalEventos: number;
  magnitudPromedio: number;
  magnitudMaxima: number;
  zonasMasActiva: string;
  nivelAlerta: SismoNivel;
}
