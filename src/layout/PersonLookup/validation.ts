import { Ajv, type JSONSchemaType } from 'ajv';
import addErrors from 'ajv-errors';

import type { Person } from 'src/layout/PersonLookup/PersonLookupComponent';

/**
 * @see https://github.com/navikt/k9-punsj-frontend/blob/435a445a14797dee5c19fb1c1a70c323c3f4187c/src/app/rules/IdentRules.ts
 */
const REGEX_FNR =
  /^((((0[1-9]|[12]\d|30)(0[469]|11)|(0[1-9]|[12]\d|3[01])(0[13578]|1[02])|((0[1-9]|1\d|2[0-8])02))\d{2})|2902([02468][048]|[13579][26]))\d{5}$/;
/**
 * @see https://github.com/navikt/k9-punsj-frontend/blob/435a445a14797dee5c19fb1c1a70c323c3f4187c/src/app/rules/IdentRules.ts
 */
const REGEX_DNR =
  /^((((4[1-9]|[56]\d|70)(0[469]|11)|(4[1-9]|[56]\d|7[01])(0[13578]|1[02])|((4[1-9]|5\d|6[0-8])02))\d{2})|6902([02468][048]|[13579][26]))\d{5}$/;

const ajv = new Ajv({ allErrors: true });
addErrors(ajv);

const ssnSchema: JSONSchemaType<Pick<Person, 'ssn'>> = {
  type: 'object',
  properties: {
    ssn: {
      type: 'string',
      pattern: new RegExp(`((${REGEX_FNR.source}))|((${REGEX_DNR.source}))`).source,
      errorMessage: 'person_lookup.validation_error_ssn',
    },
  },
  required: ['ssn'],
};

const nameSchema: JSONSchemaType<Pick<Person, 'name'>> = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 2, errorMessage: 'person_lookup.validation_error_name_too_short' },
  },
  required: ['name'],
};

export const validateSsn = ajv.compile(ssnSchema);
export const validateName = ajv.compile(nameSchema);
