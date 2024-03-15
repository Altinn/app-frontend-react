import type { LayoutPage } from 'src/utils/layout/LayoutPage';
import type { LayoutPages } from 'src/utils/layout/LayoutPages';

export interface ChildLookupRowIndexRestriction {
  onlyInRowIndex: number;
}

export interface ChildLookupRowUuidRestriction {
  onlyInRowUuid: string;
}

export type ChildLookupRestriction = ChildLookupRowUuidRestriction | ChildLookupRowIndexRestriction;

export function generateHierarchy(..._props: any[]): LayoutPage {
  return null as any;
}

export function generateEntireHierarchy(..._props: any[]): LayoutPages {
  return null as any;
}
