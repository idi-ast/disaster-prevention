export interface GyroscopeTypes {
  timestamp: string;
  gyro_devices: GyroDevices[];
}

export interface GyroDevices {
  dev_eui: string;
  device_name: string;
  latitude: number;
  longitude: number;
  status: string;
  alert: boolean;
  gyro_x: number | number;
  gyro_y: number | number;
  gyro_z: number;
  acc_x: number | number;
  acc_y: number | number;
  acc_z: number | number;
  mag_x: number | number;
  mag_y: number | number;
  mag_z: number | number;
  temperature: number;
  battery_percent: number;
}