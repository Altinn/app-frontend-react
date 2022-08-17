export type ErrorList = { [path: string]: string[] };

interface In {
  obj: any;
  errors: ErrorList;
  indentation: number;
  path: string[];
  insideArray?: boolean;
  objectKeyLength?: number;
}

interface Out {
  value: string;
  isOneLiner: boolean;
  isObject?: boolean;
}

// TODO: Add colors using CSS when printing to console

function trimTrailingComma(str: string): string {
  return str.replace(/,$/, '');
}

function errorLines({ path, errors, indentation }: In): string {
  const prefix = '  '.repeat(indentation);
  const stringPath = path.join('.');
  if (errors[stringPath] && errors[stringPath].length) {
    return errors[stringPath].map((err) => `${prefix}→ ${err}`).join('\n');
  }

  return '';
}

function prettyJsonSerializable(input: In): Out {
  const { obj, indentation, insideArray, objectKeyLength } = input;
  const value = JSON.stringify(obj);
  const err = errorLines(input);
  const prefix = '  '.repeat(indentation);

  return err
    ? {
        value: [
          `${value}${insideArray || objectKeyLength ? ',' : ''}`,
          prefix + '^'.repeat((objectKeyLength || 0) + value.length),
          err,
        ].join('\n'),
        isOneLiner: false,
      }
    : { value: `${value},`, isOneLiner: true };
}

function postProcessObjectLike(
  input: In,
  oneLiner: boolean,
  start: string,
  end: string,
  lines: string[],
): Out {
  const prefix = '  '.repeat(input.indentation);

  const returnVal: Out = oneLiner
    ? {
        value: `${start}${lines.map(trimTrailingComma).join(', ')}${end},`,
        isOneLiner: true,
      }
    : {
        value: [`${start}`, ...lines, `${prefix}${end},`].join('\n'),
        isOneLiner: false,
      };

  const errLines = errorLines(input);
  if (errLines) {
    const originalLength = returnVal.value.length;
    returnVal.value += `\n${prefix}`;
    returnVal.value += oneLiner
      ? '^'.repeat((input.objectKeyLength || 0) + originalLength - 1)
      : `^`;
    returnVal.value += `\n${errLines}`;
    returnVal.isOneLiner = false;
  }

  return returnVal;
}

function prettyArray(input: In): Out {
  const { obj, errors, indentation, path } = input;
  const innerPrefix = '  '.repeat(indentation + 1);
  const parentPath = [...path];
  const ourKey = parentPath.pop() || '';
  let lines = [];
  let oneLiner = obj.length <= 5;
  for (const idx in obj) {
    const currentPath = [...parentPath, `${ourKey}[${idx}]`];
    const { value, isOneLiner, isObject } = prettyErrorsRecursive({
      obj: obj[idx],
      errors,
      indentation: indentation + 1,
      path: currentPath,
      insideArray: true,
    });
    const wasOneLiner = oneLiner;
    oneLiner = oneLiner && isOneLiner && !isObject;
    if (wasOneLiner && !oneLiner) {
      lines = lines.map((prevLine) => `${innerPrefix}${prevLine}`);
    }

    lines.push(`${oneLiner ? '' : innerPrefix}${value}`);
  }

  return postProcessObjectLike(input, oneLiner, '[', ']', lines);
}

function prettyObject(input: In): Out {
  const { obj, errors, indentation, path } = input;
  const innerPrefix = '  '.repeat(indentation + 1);
  let lines = [];
  let oneLiner = Object.keys(obj).length <= 3;
  for (const key of Object.keys(obj)) {
    const currentPath = [...path, key];
    const { value, isOneLiner, isObject } = prettyErrorsRecursive({
      obj: obj[key],
      errors,
      indentation: indentation + 1,
      path: currentPath,
      objectKeyLength: key.length + 2,
    });
    const wasOneLiner = oneLiner;
    oneLiner = oneLiner && isOneLiner && !isObject;
    if (wasOneLiner && !oneLiner) {
      lines = lines.map((prevLine) => `${innerPrefix}${prevLine}`);
    }

    lines.push(`${oneLiner ? '' : innerPrefix}${key}: ${value}`);
  }

  return postProcessObjectLike(input, oneLiner, '{', '}', lines);
}

function prettyErrorsRecursive(input: In): Out {
  if (typeof input.obj === 'object') {
    if (input.obj === null) {
      return prettyJsonSerializable(input);
    }

    if (Array.isArray(input.obj)) {
      return prettyArray(input);
    }

    return prettyObject(input);
  }

  return prettyJsonSerializable(input);
}

/**
 * Pretty-prints errors tied to some keys/values in any object
 */
export function prettyErrors(
  obj: any,
  errors?: ErrorList,
  indentation = 0,
): string {
  const { value } = prettyErrorsRecursive({
    obj,
    errors: errors || {},
    indentation,
    path: [],
  });

  return trimTrailingComma(value);
}
