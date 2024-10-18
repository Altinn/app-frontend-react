import type { IDataModelReference } from 'src/layout/common.generated';

export function isIDataModelReference(obj: unknown): obj is IDataModelReference {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'dataType' in obj &&
    'field' in obj &&
    typeof (obj as { dataType: unknown }).dataType === 'string' &&
    typeof (obj as { field: unknown }).field === 'string'
  );
}

export function isIDataModelReferenceArray(obj: unknown): obj is IDataModelReference[] {
  return Array.isArray(obj) && obj.every(isIDataModelReference);
}
