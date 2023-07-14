import { CodeGenerator } from 'src/codegen/CodeGenerator';
import { CodeGeneratorContext } from 'src/codegen/CodeGeneratorContext';

const knownValues = {
  grid: {
    symbol: 'IGrid',
    importFrom: 'src/layout/layout',
  },
  pageBreak: {
    symbol: 'IPageBreak',
    importFrom: 'src/layout/layout',
  },
  triggers: {
    symbol: 'Triggers[]',
    importSymbol: 'Triggers',
    importFrom: 'src/types/index',
  },
  labelSettings: {
    symbol: 'ILabelSettings',
    importFrom: 'src/types/index',
  },
};

export class GenerateKnownValue extends CodeGenerator {
  public readonly value: keyof typeof knownValues;

  constructor(value: keyof typeof knownValues) {
    super();
    this.value = value;
  }

  toTypeScript() {
    const val = knownValues[this.value];
    const importSymbol = 'importSymbol' in val ? val.importSymbol : val.symbol;
    CodeGeneratorContext.getInstance().addImport(importSymbol, val.importFrom);
    return val.symbol;
  }
}
