import type { JSONSchema7 } from 'json-schema';

import { getPropertiesFor } from 'src/codegen/Common';
import { GenerateImportedSymbol } from 'src/codegen/dataTypes/GenerateImportedSymbol';
import type { ValidCommonKeys } from 'src/codegen/Common';
import type { GenerateProperty } from 'src/codegen/dataTypes/GenerateProperty';

export class GenerateCommonImport<T extends ValidCommonKeys> extends GenerateImportedSymbol<any> {
  constructor(public readonly key: T) {
    super({
      import: key,
      from: 'src/layout/common.generated',
    });
  }

  toJsonSchema(): JSONSchema7 {
    return { $ref: `#/definitions/${this.key}` };
  }

  getProperties(): GenerateProperty<any>[] {
    return getPropertiesFor(this.key);
  }
}
