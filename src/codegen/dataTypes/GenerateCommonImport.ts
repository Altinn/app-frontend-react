import type { JSONSchema7 } from 'json-schema';

import { getCommonRealName, getPropertiesFor } from 'src/codegen/Common';
import { GenerateImportedSymbol } from 'src/codegen/dataTypes/GenerateImportedSymbol';
import type { ValidCommonKeys } from 'src/codegen/Common';
import type { GenerateProperty } from 'src/codegen/dataTypes/GenerateProperty';

export class GenerateCommonImport<T extends ValidCommonKeys> extends GenerateImportedSymbol<any> {
  constructor(
    public readonly key: T,
    public readonly type: 'unresolved' | 'resolved' = 'unresolved',
  ) {
    super({
      import: getCommonRealName(key, type),
      from: 'src/layout/common.generated',
    });
  }

  transformToResolved(): this | GenerateCommonImport<any> {
    // PRIORITY: Find resolved variant of this import, if any
    throw new Error(`Cannot transform a common import (${this.key}) to a resolved import`);
  }

  toJsonSchema(): JSONSchema7 {
    return { $ref: `#/definitions/${getCommonRealName(this.key, this.type)}` };
  }

  getProperties(): GenerateProperty<any>[] {
    return getPropertiesFor(this.key);
  }
}
