import type { ILayoutCompBase } from 'src/layout/layout';

export interface SummaryDisplayProperties {
  hideChangeButton?: boolean;
  hideValidationMessages?: boolean;
  useComponentGrid?: boolean;
  hideBottomBorder?: boolean;
}

type ValidTexts = undefined;
export interface ILayoutCompSummary extends ILayoutCompBase<'Summary', undefined, ValidTexts> {
  componentRef?: string;
  pageRef?: string;
  display?: SummaryDisplayProperties;
  largeGroup?: boolean;
  excludedChildren?: string[];
}
