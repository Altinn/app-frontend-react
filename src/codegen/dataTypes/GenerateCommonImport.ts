import type { JSONSchema7 } from 'json-schema';

import { CG } from 'src/codegen/CG';
import { MaybeOptionalCodeGenerator } from 'src/codegen/CodeGenerator';
import { commonContainsExpressions, getCommonRealName, getPropertiesFor, isCommonKey } from 'src/codegen/Common';
import type { ValidCommonKeys } from 'src/codegen/Common';
import type { GenerateProperty } from 'src/codegen/dataTypes/GenerateProperty';

/**
 * Generates an import statement for a common type (one of those defined in Common.ts).
 * In TypeScript, this is a regular import statement, and in JSON Schema, this is a reference to the definition.
 */
export class GenerateCommonImport<T extends ValidCommonKeys> extends MaybeOptionalCodeGenerator<any> {
  constructor(public readonly key: T) {
    super();
  }

  transformToResolved(): this | GenerateCommonImport<any> {
    if (isCommonKey(this.key) && commonContainsExpressions(this.key)) {
      return new GenerateCommonImport(`${this.key}Resolved` as ValidCommonKeys);
    }

    return this;
  }

  toJsonSchema(): JSONSchema7 {
    return { $ref: `#/definitions/${getCommonRealName(this.key)}` };
  }

  getProperties(): GenerateProperty<any>[] {
    return getPropertiesFor(this.key);
  }

  _toTypeScriptDefinition(symbol: string | undefined): string {
    const _import = new CG.import({
      import: getCommonRealName(this.key),
      from: 'src/layout/common.generated',
    });

    return _import._toTypeScriptDefinition(symbol);
  }

  containsExpressions(): boolean {
    return commonContainsExpressions(this.key);
  }
}
