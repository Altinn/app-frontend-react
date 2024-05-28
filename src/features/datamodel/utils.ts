import { isDataModelReference } from 'src/utils/databindings';
import type { ILayouts } from 'src/layout/layout';
import type { IInstance } from 'src/types/shared';

export class MissingDataTypeException extends Error {
  public readonly dataType: string;

  constructor(dataType: string) {
    super(
      `Tried to reference the data type \`${dataType}\`, but no data type with this id was found in \`applicationmetadata.json\``,
    );
    this.dataType = dataType;
  }
}

export class MissingClassRefException extends Error {
  public readonly dataType: string;

  constructor(dataType: string) {
    super(
      `Tried to reference the data type \`${dataType}\`, but the data type in \`applicationmetadata.json\` was missing a \`classRef\``,
    );
    this.dataType = dataType;
  }
}

export class MissingDataElementException extends Error {
  public readonly dataType: string;

  constructor(dataType: string) {
    super(
      `Tried to reference the data type \`${dataType}\`, but no data element of this type was found in the instance data. This could be because the data type is missing a \`taskId\`, or it has \`autoCreate: false\` and no element has been created manually`,
    );
    this.dataType = dataType;
  }
}

/**
 * Looks through all layouts and returns a list of unique data types that are referenced in dataModelBindings,
 * it will also include the default data type, which is necessary in case there are string bindings
 * TODO(Datamodels): Currently does not check expressions for referenced data types, maybe it should?
 */
export function getAllReferencedDataTypes(layouts: ILayouts, defaultDataType?: string) {
  const dataTypes = new Set<string>();

  if (defaultDataType) {
    dataTypes.add(defaultDataType);
  }

  for (const layout of Object.values(layouts)) {
    for (const component of layout ?? []) {
      if ('dataModelBindings' in component && component.dataModelBindings) {
        for (const binding of Object.values(component.dataModelBindings)) {
          if (isDataModelReference(binding)) {
            dataTypes.add(binding.dataType);
          }
        }
      }
    }
  }

  return [...dataTypes];
}

/**
 * Used to determine if the data type is writable or if it is read only
 * If a data type is not writable, we cannot write to or validate it.
 * Assumes the first dataElement of the correct type is the one to use,
 * we also assume this when creating the url for loading and saving data models @see useDataModelUrl, getFirstDataElementId
 */
export function isDataTypeWritable(
  dataType: string | undefined,
  isStateless: boolean,
  instance: IInstance | undefined,
) {
  if (!dataType) {
    return false;
  }
  if (isStateless) {
    return true;
  }
  const dataElement = instance?.data.find((data) => data.dataType === dataType);
  return !!dataElement && dataElement.locked === false;
}
