import type { JSONSchema7 } from 'json-schema';

import { CG } from 'src/codegen/CG';
import { DescribableCodeGenerator } from 'src/codegen/CodeGenerator';
import { GenerateCommonImport } from 'src/codegen/dataTypes/GenerateCommonImport';
import { GenerateObject } from 'src/codegen/dataTypes/GenerateObject';
import type { CodeGenerator, Extract } from 'src/codegen/CodeGenerator';
import type { GenerateProperty } from 'src/codegen/dataTypes/GenerateProperty';

/**
 * Generates an array with inner items of the given type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class GenerateArray<Inner extends CodeGenerator<any>> extends DescribableCodeGenerator<Extract<Inner>[]> {
  private _minItems?: number;
  private _maxItems?: number;

  constructor(public readonly innerType: Inner) {
    super();
  }

  setMinItems(minItems: number): this {
    this.ensureMutable();
    this._minItems = minItems;
    return this;
  }

  setMaxItems(maxItems: number): this {
    this.ensureMutable();
    this._maxItems = maxItems;
    return this;
  }

  toTypeScriptDefinition(symbol: string | undefined): string {
    const out = this.innerType.shouldUseParens()
      ? `(${this.innerType.toTypeScript()})[]`
      : `${this.innerType.toTypeScript()}[]`;

    return symbol ? `type ${symbol} = ${out};` : out;
  }

  toJsonSchemaDefinition(): JSONSchema7 {
    return {
      ...this.getInternalJsonSchema(),
      type: 'array',
      items: this.innerType.toJsonSchema(),
      minItems: this._minItems,
      maxItems: this._maxItems,
    };
  }

  toPropListDefinition(): unknown {
    return {
      ...this.getInternalPropList(),
      type: 'array',
    };
  }

  canBeFlattened(): boolean {
    return !this.internal.docsLink;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toFlattened(prefix: string = ''): GenerateProperty<any>[] {
    const real = this.innerType instanceof GenerateCommonImport ? this.innerType.getSource() : this.innerType;
    if (real instanceof GenerateArray) {
      throw new Error('Arrays of arrays not yet supported');
    }
    if (real instanceof GenerateObject) {
      return real.toFlattened(`${prefix}[]`);
    }

    return [new CG.prop(`${prefix}[]`, real)];
  }
}
