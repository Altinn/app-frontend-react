import type { IFormData } from 'src/features/formData';

export function diffModels(current: IFormData, prev: IFormData) {
  const changes: { [key: string]: string | null } = {};
  for (const key of Object.keys(current)) {
    if (current[key] !== prev[key]) {
      changes[key] = prev[key];
      if (prev[key] === undefined) {
        changes[key] = null;
      }
    }
  }
  for (const key of Object.keys(prev)) {
    if (!(key in current)) {
      changes[key] = prev[key];
    }
  }

  return changes;
}
