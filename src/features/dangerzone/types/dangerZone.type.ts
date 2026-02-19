export interface DangerZoneTypes {
  type: string;
  name: string;
  crs: Crs;
  features: Features[];
}

export interface Features {
  type: string;
  properties: Properties2;
  geometry: Geometry;
}

export interface Geometry {
  type: string;
  coordinates: number[][][][] | (number | number)[][][][];
}

export interface Properties2 {
  DPTO: string;
  DPTO_DESC: string;
  DISTRITO: string;
  DIST_DESC_: string;
  CLAVE: string;
}

export interface Crs {
  type: string;
  properties: Properties;
}

export interface Properties {
  name: string;
}