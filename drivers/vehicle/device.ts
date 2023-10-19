import {DeviceStore} from "./types";
import VehicleDriver from "./driver";
import {RDWClient, Vehicle} from "../../rdw-client";
import {Device} from "homey";

/**
 * @property {VehicleDriver} driver
 */
class VehicleDevice extends Device {
  private client?: RDWClient;
  private interval?: NodeJS.Timeout;

  async onInit(): Promise<void> {
    this.log('Device has been initialized');

    this.client = new RDWClient();

    await this.initializeClient();

    this.setAvailable()
        .catch((error: Error) => {
          this.error(error);
        });
  }

  async initializeClient(): Promise<void> {
    try {
      await this.syncVehicleData();
    } catch (error) {
      this.error(error);
      console.log(error);
    }

    try {
      this.interval = this.homey.setInterval(() => {
        this.syncVehicleData();
      }, 24 * 60 * 60 * 1000); // check daily
    } catch (error) {
      this.error(error);
      console.log(error);
    }
  }

  private getLicensePlate(): string {
    const store = this.getStore() as DeviceStore;
    return store.license_plate;
  }

  async syncVehicleData(): Promise<void> {
    this.log('Fetching latest vehicle data from RDW');

    this.client
        ?.fetchVehicleData(this.getLicensePlate())
        .then((vehicle: Vehicle) => {
          this.syncVehicleToCapabilities(vehicle);
        })
        .catch((error: Error) => {
          this.error(error);
          console.log(error);
        });
  }

  async onUninit(): Promise<void> {
    this.homey.clearInterval(this.interval)
  }

  private syncVehicleToCapabilities(vehicle: Vehicle) {
    this.log('Syncing vehicle data to capabilities');

    this.setCapabilityValue('license_plate', vehicle.kenteken);
    this.setCapabilityValue('vehicle_type', vehicle.voertuigsoort);
    this.setCapabilityValue('brand', vehicle.merk);
    this.setCapabilityValue('trade_name', vehicle.handelsbenaming);
    this.setCapabilityValue('is_insured', vehicle.wam_verzekerd);
    this.setCapabilityValue('apk_expiry_date', this.formatDate(vehicle.vervaldatum_apk));

    this.getVehicleDriver().triggerAPKExpiryTriggers(this, {
      date: vehicle.vervaldatum_apk,
    });

    this.setStoreValue('apk_expiry_date', vehicle.vervaldatum_apk);
  }

  private getVehicleDriver(): VehicleDriver {
    return this.driver as VehicleDriver;
  }

  private formatDate(input: string) {
    // Convert the input string to a Date object
    let year = input.substring(0, 4);
    let month = input.substring(4, 6);
    let day = input.substring(6, 8);

    return `${year}-${month}-${day}`;
  }
}

module.exports = VehicleDevice;

export default VehicleDevice;
