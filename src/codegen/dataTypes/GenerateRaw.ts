import type { JSONSchema7 } from 'json-schema';

import { CodeGenerator, MaybeOptionalCodeGenerator } from 'src/codegen/CodeGenerator';

type RawTypeScript = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typeScript: string | (() => string) | CodeGenerator<any>;
};

type RawJsonSchema = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jsonSchema: JSONSchema7 | (() => JSONSchema7) | CodeGenerator<any>;
};

type RawPropList = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  propList: unknown | (() => unknown) | CodeGenerator<any>;
};

type RawDef =
  | RawTypeScript
  | RawJsonSchema
  | RawPropList
  | (RawTypeScript & RawJsonSchema)
  | (RawTypeScript & RawPropList)
  | (RawJsonSchema & RawPropList)
  | (RawTypeScript & RawJsonSchema & RawPropList);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class GenerateRaw extends MaybeOptionalCodeGenerator<any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private realJsonSchema?: JSONSchema7 | CodeGenerator<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private realTypeScript?: string | CodeGenerator<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private realPropList?: unknown | CodeGenerator<any>;

  constructor(private readonly raw: RawDef) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getRealJsonSchema(fail = true): JSONSchema7 | CodeGenerator<any> {
    if (!this.realJsonSchema) {
      if (fail && !('jsonSchema' in this.raw)) {
        throw new Error('Raw type does not have a jsonSchema');
      } else if (!('jsonSchema' in this.raw)) {
        return {};
      }

      this.realJsonSchema = typeof this.raw.jsonSchema === 'function' ? this.raw.jsonSchema() : this.raw.jsonSchema;
    }

    return this.realJsonSchema;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getRealTypeScript(fail = true): string | CodeGenerator<any> {
    if (!this.realTypeScript) {
      if (fail && !('typeScript' in this.raw)) {
        throw new Error('Raw type does not have a typeScript');
      } else if (!('typeScript' in this.raw)) {
        return '';
      }

      this.realTypeScript = typeof this.raw.typeScript === 'function' ? this.raw.typeScript() : this.raw.typeScript;
    }

    return this.realTypeScript;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getRealPropList(fail = true): unknown | CodeGenerator<any> {
    if (!this.realPropList) {
      if (fail && !('propList' in this.raw)) {
        throw new Error('Raw type does not have a propList');
      } else if (!('propList' in this.raw)) {
        return undefined;
      }

      this.realPropList = typeof this.raw.propList === 'function' ? this.raw.propList() : this.raw.propList;
    }

    return this.realPropList;
  }

  toJsonSchema(): JSONSchema7 {
    const real = this.getRealJsonSchema();
    if (real instanceof CodeGenerator) {
      return real.toJsonSchema();
    }

    return real;
  }

  toTypeScript(): string {
    const real = this.getRealTypeScript();
    if (real instanceof CodeGenerator) {
      return real.toTypeScript();
    }

    return real;
  }

  toPropList(): unknown {
    const real = this.getRealPropList();
    if (real instanceof CodeGenerator) {
      return real.toPropList();
    }

    return real;
  }

  toJsonSchemaDefinition(): JSONSchema7 {
    throw new Error('Method not implemented.');
  }

  toTypeScriptDefinition(_symbol: string | undefined): string {
    throw new Error('Method not implemented.');
  }

  toPropListDefinition(): unknown {
    throw new Error('Method not implemented.');
  }
}
