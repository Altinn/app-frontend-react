export type TenorOrg = {
  name: string;
  orgNr: string;
};

export type TenorUser = {
  name: string;
  ssn: string;
  role?: string;
  orgs?: string[];
};

export type TenorLoginParams = {
  appName: string;
  tenorUser: TenorUser;
  authenticationLevel: string;
};

const tenorOrgs = {
  sivilisertAvansertIsbjoernSA: {
    name: 'Sivilisert Avansert Isbjørn SA',
    orgNr: '312405091',
  },
} as const;

const tenorUsers = {
  saligBlomsterplante: {
    name: 'Salig Blomsterplante',
    ssn: '20920448276',
  },
  humanAndrefiolin: {
    name: 'Human Andrefiolin',
    ssn: '09876298713',
    role: 'CEO',
  },
  varsomDiameter: {
    name: 'Varsom Diameter',
    ssn: '03835698199',
    role: 'Chairman',
  },
  standhaftigBjornunge: {
    name: 'Standhaftig Bjørnunge',
    ssn: '23849199013',
  },
  snaalDugnad: {
    name: 'Snål Dugnad',
    ssn: '10928198958',
  },
} as const;

export const Tenor = {
  users: tenorUsers satisfies Record<keyof typeof tenorUsers, TenorUser>,
  orgs: tenorOrgs satisfies Record<keyof typeof tenorOrgs, TenorOrg>,
};
