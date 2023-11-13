import type { ITextResource } from 'src/types/shared';

export interface ITextResourcesState {
  language: string | null;
  resourceMap: TextResourceMap;
}

export interface TextResourceMap {
  [key: string]: ITextResource | undefined;
}

export interface IRawTextResource extends ITextResource {
  id: string;
}

export interface ITextResourceResult {
  language: string;
  resources: IRawTextResource[];
}
