export interface SismoTypes {
  count: number;
  data: Data[];
}

export interface Data {
  id: string;
  place: string;
  magnitude: number | number;
  time: string;
  url: string;
  latitude: number;
  longitude: number;
  depth: number | number;
  level: "bajo" | "medio" | "alto" | "crítico";
}
