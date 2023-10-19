const fetch = require('node-fetch');

export interface Vehicle {
  kenteken: string;
  voertuigsoort: string,
  merk: string,
  handelsbenaming: string,
  vervaldatum_apk: string,
  datum_tenaamstelling: string,
  bruto_bpm: string,
  inrichting: string,
  aantal_zitplaatsen: string,
  eerste_kleur: string,
  tweede_kleur: string,
  aantal_cilinders: string,
  cilinderinhoud: string,
  massa_ledig_voertuig: string,
  toegestane_maximum_massa_voertuig: string,
  massa_rijklaar: string,
  maximum_massa_trekken_ongeremd: string,
  maximum_trekken_massa_geremd: string,
  datum_eerste_toelating: string,
  datum_eerste_tenaamstelling_in_nederland: string,
  wacht_op_keuren: string,
  catalogusprijs: string,
  wam_verzekerd: string,
  aantal_deuren: string,
  aantal_wielen: string,
  afstand_hart_koppeling_tot_achterzijde_voertuig: string,
  afstand_voorzijde_voertuig_tot_hart_koppeling: string,
  lengte: string,
  breedte: string,
  europese_voertuigcategorie: string,
  plaats_chassisnummer: string,
  technische_max_massa_voertuig: string,
  type: string,
  typegoedkeuringsnummer: string,
  variant: string,
  uitvoering: string,
  volgnummer_wijziging_eu_typegoedkeuring: string,
  vermogen_massarijklaar: string,
  wielbasis: string,
  export_indicator: string,
  openstaande_terugroepactie_indicator: string,
  taxi_indicator: string,
  maximum_massa_samenstelling: string,
  aantal_rolstoelplaatsen: string,
  maximum_ondersteunende_snelheid: string,
  jaar_laatste_registratie_tellerstand: string,
  tellerstandoordeel: string,
  code_toelichting_tellerstandoordeel: string,
  tenaamstellen_mogelijk: string,
  vervaldatum_apk_dt: string,
  datum_tenaamstelling_dt: string,
  datum_eerste_toelating_dt: string,
  datum_eerste_tenaamstelling_in_nederland_dt: string,
  zuinigheidsclassificatie: string,
}

export class RDWClient {
  async fetchVehicleData(licensePlate: string): Promise<Vehicle> {
    const response = await fetch(`https://opendata.rdw.nl/api/id/m9d7-ebf2.json?$where=(UPPER(kenteken)=UPPER(%27${licensePlate}%27))`, {method: 'GET'});
    const json = await response.json() as Array<Vehicle>;
    return json[0];
  }
}

export default {
  RDWClient: RDWClient,
};
