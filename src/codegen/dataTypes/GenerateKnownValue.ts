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
    CodeGeneratorContext.getInstance().addImport(knownValues[this.value].symbol, knownValues[this.value].importFrom);
    return knownValues[this.value].symbol;
  }
}
