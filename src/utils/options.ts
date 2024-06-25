import type { IOptionInternal } from 'src/features/options/castOptionsToStrings';

/**
 * Fast method for removing duplicate option values
 */
export function filterDuplicateOptions(options: IOptionInternal[]): IOptionInternal[] {
  const seen = new Set<string>();
  const out: IOptionInternal[] = [];
  let j = 0;
  for (let i = 0; i < options.length; i++) {
    if (!seen.has(options[i].value)) {
      seen.add(options[i].value);
      out[j++] = options[i];
    }
  }
  return out;
}

export function verifyOptions(options: IOptionInternal[] | undefined): void {
  if (!options) {
    return;
  }

  for (const option of options) {
    if (!option.value?.length) {
      window.logErrorOnce('Option has a null or empty value\n', JSON.stringify(option, null, 2));
    }
    if (option.label == null) {
      window.logErrorOnce('Option has a null label\n', JSON.stringify(option, null, 2));
    }
    if (option.value?.includes(',')) {
      window.logErrorOnce(
        'Option has a value containing a "," since selected values are stored as a comma-separated list this will not work as expected!\n',
        JSON.stringify(option, null, 2),
      );
    }
  }
}
