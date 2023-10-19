export interface DeviceData {
  id: string
}

export interface DeviceStore {
  license_plate: string,
  apk_expiry_date: string,
}

export interface Device {
  name: string;
  data: DeviceData;
  store: DeviceStore;
}
