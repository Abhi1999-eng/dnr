export type SupportedCoverageState = {
  stateId: string;
  mapName: string;
  defaultLabel: string;
  defaultDescription: string;
};

export const SUPPORTED_COVERAGE_STATES: SupportedCoverageState[] = [
  {
    stateId: 'andhra-pradesh',
    mapName: 'Andhra Pradesh',
    defaultLabel: 'Andhra Pradesh',
    defaultDescription: 'Support for coastal manufacturing, machining, and automation programs.',
  },
  {
    stateId: 'gujarat',
    mapName: 'Gujarat',
    defaultLabel: 'Gujarat',
    defaultDescription: 'Coverage across casting, foundry, and machine tool clusters.',
  },
  {
    stateId: 'haryana',
    mapName: 'Haryana',
    defaultLabel: 'Haryana',
    defaultDescription: 'Fast access to OEM belts and maintenance-heavy industrial sites.',
  },
  {
    stateId: 'jammu-and-kashmir',
    mapName: 'Jammu and Kashmir',
    defaultLabel: 'Jammu and Kashmir',
    defaultDescription: 'Regional support through partner-led response coverage.',
  },
  {
    stateId: 'west-bengal',
    mapName: 'West Bengal',
    defaultLabel: 'West Bengal',
    defaultDescription: 'Eastern coverage for processing, fabrication, and plant engineering.',
  },
  {
    stateId: 'madhya-pradesh',
    mapName: 'Madhya Pradesh',
    defaultLabel: 'Madhya Pradesh',
    defaultDescription: 'Central India response for machining and industrial support needs.',
  },
  {
    stateId: 'maharashtra',
    mapName: 'Maharashtra',
    defaultLabel: 'Maharashtra',
    defaultDescription: 'Strong footprint across automotive, tooling, and manufacturing plants.',
  },
  {
    stateId: 'delhi',
    mapName: 'Delhi',
    defaultLabel: 'Delhi NCR',
    defaultDescription: 'Commercial, technical, and rapid-response access for NCR customers.',
  },
  {
    stateId: 'punjab',
    mapName: 'Punjab',
    defaultLabel: 'Punjab',
    defaultDescription: 'Industrial support for machine shops, fabrication, and component plants.',
  },
  {
    stateId: 'rajasthan',
    mapName: 'Rajasthan',
    defaultLabel: 'Rajasthan',
    defaultDescription: 'Coverage for process industries, castings, and factory projects.',
  },
  {
    stateId: 'telangana',
    mapName: 'Telangana',
    defaultLabel: 'Telangana',
    defaultDescription: 'Support across Hyderabad-region machining and automation demand.',
  },
  {
    stateId: 'uttar-pradesh',
    mapName: 'Uttar Pradesh',
    defaultLabel: 'Uttar Pradesh',
    defaultDescription: 'Large manufacturing corridor support with field-service reach.',
  },
  {
    stateId: 'uttarakhand',
    mapName: 'Uttarakhand',
    defaultLabel: 'Uttarakhand',
    defaultDescription: 'Access to hill-state industrial hubs and OEM supply chains.',
  },
  {
    stateId: 'bihar',
    mapName: 'Bihar',
    defaultLabel: 'Bihar',
    defaultDescription: 'Coverage through eastern network partners and service coordination.',
  },
  {
    stateId: 'chhattisgarh',
    mapName: 'Chhattisgarh',
    defaultLabel: 'Chhattisgarh',
    defaultDescription: 'Central-east support for heavy industry and engineering sites.',
  },
  {
    stateId: 'goa',
    mapName: 'Goa',
    defaultLabel: 'Goa',
    defaultDescription: 'Small-footprint coastal support tied to west-region response teams.',
  },
  {
    stateId: 'himachal-pradesh',
    mapName: 'Himachal Pradesh',
    defaultLabel: 'Himachal Pradesh',
    defaultDescription: 'North-zone service access for dispersed production locations.',
  },
  {
    stateId: 'jharkhand',
    mapName: 'Jharkhand',
    defaultLabel: 'Jharkhand',
    defaultDescription: 'Coverage for metals, fabrication, and heavy engineering customers.',
  },
  {
    stateId: 'karnataka',
    mapName: 'Karnataka',
    defaultLabel: 'Karnataka',
    defaultDescription: 'Support for precision machining, OEM supply, and industrial automation.',
  },
  {
    stateId: 'kerala',
    mapName: 'Kerala',
    defaultLabel: 'Kerala',
    defaultDescription: 'Southern response coverage for plant maintenance and project support.',
  },
  {
    stateId: 'odisha',
    mapName: 'Odisha',
    defaultLabel: 'Odisha',
    defaultDescription: 'East-coast service support for engineering and processing sectors.',
  },
  {
    stateId: 'tamil-nadu',
    mapName: 'Tamil Nadu',
    defaultLabel: 'Tamil Nadu',
    defaultDescription: 'Coverage for OEMs, machining clusters, and production plants.',
  },
];

export const COVERAGE_STATE_BY_MAP_NAME = Object.fromEntries(
  SUPPORTED_COVERAGE_STATES.map((state) => [state.mapName, state])
) as Record<string, SupportedCoverageState>;
