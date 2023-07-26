import { GenerateImportedSymbol } from 'src/codegen/dataTypes/GenerateImportedSymbol';
import type {
  IDataModelBindingsList,
  IDataModelBindingsSimple,
  IGrid,
  IPageBreak,
  ITableColumnProperties,
} from 'src/layout/layout';
import type { ILabelSettings, IMapping, IOption, IOptionSource, LayoutStyle, Triggers } from 'src/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

const knownValues = {
  IGrid: {
    type: null as unknown as IGrid,
    symbol: 'IGrid',
    importFrom: 'src/layout/layout',
  },
  IPageBreak: {
    type: null as unknown as IPageBreak,
    symbol: 'IPageBreak',
    importFrom: 'src/layout/layout',
  },
  Triggers: {
    type: null as unknown as Triggers,
    symbol: 'Triggers',
    importFrom: 'src/types/index',
  },
  ILabelSettings: {
    type: null as unknown as ILabelSettings,
    symbol: 'ILabelSettings',
    importFrom: 'src/types/index',
  },
  IDataModelBindingsSimple: {
    type: null as unknown as IDataModelBindingsSimple,
    symbol: 'IDataModelBindingsSimple',
    importFrom: 'src/layout/layout',
  },
  IDataModelBindingsList: {
    type: null as unknown as IDataModelBindingsList,
    symbol: 'IDataModelBindingsList',
    importFrom: 'src/layout/layout',
  },
  LayoutNode: {
    type: null as unknown as LayoutNode,
    symbol: 'LayoutNode',
    importFrom: 'src/utils/layout/LayoutNode',
  },
  IOption: {
    type: null as unknown as IOption,
    symbol: 'IOption',
    importFrom: 'src/types/index',
  },
  IMapping: {
    type: null as unknown as IMapping,
    symbol: 'IMapping',
    importFrom: 'src/types/index',
  },
  IOptionSource: {
    type: null as unknown as IOptionSource,
    symbol: 'IOptionSource',
    importFrom: 'src/types/index',
  },
  LayoutStyle: {
    type: null as unknown as LayoutStyle,
    symbol: 'LayoutStyle',
    importFrom: 'src/types/index',
  },
  ITableColumnProperties: {
    type: null as unknown as ITableColumnProperties,
    symbol: 'ITableColumnProperties',
    importFrom: 'src/layout/layout',
  },
};

type Map = typeof knownValues;
type KnownValue = keyof Map;
type TypeOfKnownValue<T extends KnownValue> = Map[T]['type'];

export class GenerateKnownValue<T extends KnownValue> extends GenerateImportedSymbol<TypeOfKnownValue<T>> {
  constructor(key: T) {
    const val = knownValues[key];
    super(val);
  }
}
