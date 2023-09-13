import type { SchemaLookupError } from 'src/features/datamodel/SimpleSchemaTraversal.tools';
import type { IUseLanguage } from 'src/hooks/useLanguage';

type ErrorUnion = SchemaLookupError['error'];
type ErrorFromType<T extends ErrorUnion> = Extract<SchemaLookupError, { error: T }>;

type Mapping = { [key in ErrorUnion]: (err: ErrorFromType<key>) => string };

export function lookupErrorAsText(error: SchemaLookupError, langTools: IUseLanguage): string {
  const mapping: Mapping = {
    referenceError: (err) =>
      langTools.langAsString('data_model_errors.referenceError', [
        err.fullDotNotation,
        err.stoppedAtDotNotation,
        err.reference,
      ]),
    misCasedProperty: (err) =>
      langTools.langAsString('data_model_errors.missingPropertyWithCorrection', [
        err.fullDotNotation,
        err.referencedName,
        err.actualName,
      ]),
    missingProperty: (err) => {
      const { property, mostLikelyProperty, validProperties } = err;
      if (mostLikelyProperty) {
        return langTools.langAsString('data_model_errors.missingPropertyWithCorrection', [
          err.fullDotNotation,
          property,
          mostLikelyProperty,
        ]);
      }
      return langTools.langAsString('data_model_errors.missingProperty', [
        err.fullDotNotation,
        property,
        validProperties.join(', '),
      ]);
    },
    missingRepeatingGroup: (err) =>
      langTools.langAsString('data_model_errors.missingRepeatingGroup', [
        err.fullDotNotation,
        err.stoppedAtDotNotation,
      ]),
    notAnArray: (err) =>
      langTools.langAsString('data_model_errors.notAnArray', [
        err.fullDotNotation,
        err.stoppedAtDotNotation,
        err.actualType,
      ]),
  };

  return mapping[error.error](error as any);
}
