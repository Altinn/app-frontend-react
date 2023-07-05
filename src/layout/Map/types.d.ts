import type { Location, MapLayer } from '@altinn/altinn-design-system';

import type { IDataModelBindingsSimple, ILayoutCompBase, TextBindingsForLabel } from 'src/layout/layout';

type ValidTexts = TextBindingsForLabel;
export interface ILayoutCompMap extends ILayoutCompBase<'Map', IDataModelBindingsSimple, ValidTexts> {
  layers?: MapLayer[];
  centerLocation?: Location;
  zoom?: number;
}
