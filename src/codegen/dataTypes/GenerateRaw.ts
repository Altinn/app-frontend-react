import type { JSONSchema7 } from 'json-schema';

import { MaybeOptionalCodeGenerator } from 'src/codegen/CodeGenerator';

type RawTypeScript = {
  typeScript: string;
};

type RawJsonSchema = {
  jsonSchema: JSONSchema7;
};

type RawDef = RawTypeScript | RawJsonSchema | (RawTypeScript & RawJsonSchema);

export class GenerateRaw extends MaybeOptionalCodeGenerator<any> {
  constructor(private readonly raw: RawDef) {
    super();
  }

  toJsonSchemaDefinition(): JSONSchema7 {
    if (!('jsonSchema' in this.raw)) {
      throw new Error('Raw type does not have a jsonSchema');
    }

    return this.raw.jsonSchema;
  }

  toTypeScriptDefinition(symbol: string | undefined): string {
    if (!('typeScript' in this.raw)) {
      throw new Error('Raw type does not have a typeScript');
    }

    if (symbol) {
      throw new Error('Raw type does not support symbols');
    }

    return this.raw.typeScript;
  }
}
