import { GenerateImportedSymbol } from 'src/codegen/dataTypes/GenerateImportedSymbol';

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
  'dataModelBinding.simple': {
    symbol: 'IDataModelBindingsSimple',
    importFrom: 'src/layout/layout',
  },
  'dataModelBinding.list': {
    symbol: 'IDataModelBindingsList',
    importFrom: 'src/layout/layout',
  },
};

export class GenerateKnownValue extends GenerateImportedSymbol {
  constructor(value: keyof typeof knownValues) {
    const val = knownValues[value];
    super(val);
  }
}
