export interface DesastresGlobalesTypes {
  count: number;
  data: Data[];
}

export interface Data {
  id: string;
  category: string;
  title: string;
  description: string;
  time: string;
  latitude: number;
  longitude: number | number;
  url: string;
  level: string;
}