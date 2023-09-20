import type { IOption } from 'src/layout/common.generated';
import type { IOptionsMetaData } from 'src/types';

/**
 * @deprecated
 */
export function getOptionLookupKey({ id, mapping, fixedQueryParameters }: IOptionsMetaData) {
  if (!mapping && !fixedQueryParameters) {
    return id;
  }

  const keyObject: any = { id };
  if (mapping) {
    keyObject.mapping = mapping;
  }
  if (fixedQueryParameters) {
    keyObject.fixedQueryParameters = fixedQueryParameters;
  }
  return JSON.stringify(keyObject);
}

export function duplicateOptionFilter(currentOption: IOption, currentIndex: number, options: IOption[]): boolean {
  for (let i = 0; i < currentIndex; i++) {
    if (currentOption.value === options[i].value) {
      return false;
    }
  }
  return true;
}
