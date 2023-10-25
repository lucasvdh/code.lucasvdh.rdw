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

    await this.fixCapabilities();

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

  async fixCapabilities() {
    // let oldCapabilities = [
    // ];

    let newCapabilities = [
      "open_recall_indicator"
    ]

    // for (let i in oldCapabilities) {
    //   let oldCapability = oldCapabilities[i]
    //
    //   if (this.hasCapability(oldCapability)) {
    //     this.log('Removing old capability: ' + oldCapability)
    //     this.removeCapability(oldCapability)
    //         .catch(error => {
    //           this.log(error);
    //         })
    //   }
    // }

    for (let i in newCapabilities) {
      let newCapability = newCapabilities[i]

      if (!this.hasCapability(newCapability)) {
        this.log('Adding new capability: ' + newCapability)
        await this.addCapability(newCapability)
            .catch(error => {
              this.log(error);
            })
      }
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
        .then((vehicle: Vehicle | undefined) => {
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

  private syncVehicleToCapabilities(vehicle: Vehicle | undefined) {
    if (vehicle === undefined) {
      throw new Error('Vehicle not found!');
    }

    this.log('Syncing vehicle data to capabilities');

    const hasExpiryDateChanged = this.getStoreValue('apk_expiry_date') !== vehicle.vervaldatum_apk;
    const hasOpenRecallChanged = this.getStoreValue('open_recall_indicator') !== vehicle.openstaande_terugroepactie_indicator;
    const hasIsInsuredChanged = this.getStoreValue('is_insured') !== vehicle.wam_verzekerd;

    this.setCapabilityValue('license_plate', vehicle.kenteken);
    this.setCapabilityValue('vehicle_type', vehicle.voertuigsoort);
    this.setCapabilityValue('brand', vehicle.merk);
    this.setCapabilityValue('trade_name', vehicle.handelsbenaming);
    this.setCapabilityValue('is_insured', vehicle.wam_verzekerd);
    this.setCapabilityValue('apk_expiry_date', this.formatDate(vehicle.vervaldatum_apk));
    this.setCapabilityValue('open_recall_indicator', vehicle.openstaande_terugroepactie_indicator);

    const driver = this.getVehicleDriver();

    driver.triggerAPKExpiryTriggers(this, {
      date: vehicle.vervaldatum_apk,
    });

    if (hasExpiryDateChanged) {
      driver.triggerAPKExpiryDateChangedTrigger(this, {
        date: this.formatDate(vehicle.vervaldatum_apk),
      });
    }

    if (hasOpenRecallChanged && vehicle.openstaande_terugroepactie_indicator === 'Ja') {
      driver.triggerOpenRecallTrigger(this);
    }

    if (hasIsInsuredChanged && vehicle.wam_verzekerd === 'Ja') {
      driver.triggerInsuranceHasExpiredTrigger(this);
    }

    this.setStoreValue('apk_expiry_date', vehicle.vervaldatum_apk)
        .catch((error: Error) => this.error(error));
    this.setStoreValue('open_recall_indicator', vehicle.openstaande_terugroepactie_indicator)
        .catch((error: Error) => this.error(error));
    this.setStoreValue('is_insured', vehicle.wam_verzekerd)
        .catch((error: Error) => this.error(error));
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
