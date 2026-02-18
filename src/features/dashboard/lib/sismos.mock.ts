import type { SismoData, SismoResumenStats } from "../types/sismo.types";

/**
 * Mock data de eventos sísmicos detectados en el radio del sensor principal.
 * Coordenadas base del sensor: lat 5.804, lng -76.766 (zona Pacífico colombiano)
 */
export const SISMOS_MOCK: SismoData[] = [
  {
    id: "sismo-001",
    zona: "Golfo de Urabá",
    descripcionZona: "Costa noroccidental, zona de alta actividad tectónica",
    magnitud: 5.7,
    intensidad: "fuerte",
    nivel: "alto",
    profundidad: 12,
    movimientos: 34,
    coordenadas: { latitude: 8.12, longitude: -76.93 },
    ultimoRegistro: "2026-02-18T08:14:00Z",
  },
  {
    id: "sismo-002",
    zona: "Serranía de la Macarena",
    descripcionZona: "Región centro-sur con actividad intermedia",
    magnitud: 3.4,
    intensidad: "débil",
    nivel: "bajo",
    profundidad: 25,
    movimientos: 9,
    coordenadas: { latitude: 3.35, longitude: -73.91 },
    ultimoRegistro: "2026-02-18T06:45:00Z",
  },
  {
    id: "sismo-003",
    zona: "Costa Pacífica Nariño",
    descripcionZona: "Límite de placas Nazca y Sudamericana",
    magnitud: 6.2,
    intensidad: "severo",
    nivel: "crítico",
    profundidad: 8,
    movimientos: 61,
    coordenadas: { latitude: 1.28, longitude: -78.85 },
    ultimoRegistro: "2026-02-18T09:01:00Z",
  },
  {
    id: "sismo-004",
    zona: "Valle del Cauca Norte",
    descripcionZona: "Área andina con actividad volcánica asociada",
    magnitud: 4.1,
    intensidad: "moderado",
    nivel: "medio",
    profundidad: 18,
    movimientos: 17,
    coordenadas: { latitude: 4.72, longitude: -75.53 },
    ultimoRegistro: "2026-02-17T22:30:00Z",
  },
  {
    id: "sismo-005",
    zona: "Cordillera Central",
    descripcionZona: "Zona volcánica activa, falla del Romeral",
    magnitud: 4.8,
    intensidad: "moderado",
    nivel: "medio",
    profundidad: 30,
    movimientos: 23,
    coordenadas: { latitude: 5.06, longitude: -75.51 },
    ultimoRegistro: "2026-02-18T03:20:00Z",
  },
  {
    id: "sismo-006",
    zona: "Chocó Biogeográfico",
    descripcionZona: "Zona de alta pluviosidad y actividad sísmica moderada",
    magnitud: 2.9,
    intensidad: "débil",
    nivel: "bajo",
    profundidad: 40,
    movimientos: 5,
    coordenadas: { latitude: 6.55, longitude: -77.35 },
    ultimoRegistro: "2026-02-17T18:05:00Z",
  },
  {
    id: "sismo-007",
    zona: "Antioquia Sur",
    descripcionZona: "Región con microsismicidad frecuente",
    magnitud: 3.1,
    intensidad: "débil",
    nivel: "bajo",
    profundidad: 22,
    movimientos: 7,
    coordenadas: { latitude: 5.30, longitude: -78.94 },
    ultimoRegistro: "2026-02-18T01:10:00Z",
  },
];

export const SISMO_RESUMEN_MOCK: SismoResumenStats = {
  totalEventos: SISMOS_MOCK.reduce((acc, s) => acc + s.movimientos, 0),
  magnitudPromedio:
    Math.round(
      (SISMOS_MOCK.reduce((acc, s) => acc + s.magnitud, 0) /
        SISMOS_MOCK.length) *
        10,
    ) / 10,
  magnitudMaxima: Math.max(...SISMOS_MOCK.map((s) => s.magnitud)),
  zonasMasActiva: SISMOS_MOCK.reduce((prev, curr) =>
    curr.movimientos > prev.movimientos ? curr : prev,
  ).zona,
  nivelAlerta: "crítico",
};
