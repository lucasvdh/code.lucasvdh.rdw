import Homey from "homey";

class RDWApp extends Homey.App {
  /**
   * onInit is called when the app is initialized.
   */
  async onInit(): Promise<void> {
    this.log("App has been initialized");

    this.log('Flow card listeners have been registered')
  }
}

module.exports = RDWApp;
