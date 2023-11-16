import { initialState, ValidationActions, validationSlice } from 'src/features/validation/validationSlice';
import type { IComponentValidations, IValidations } from 'src/utils/validation/types';

describe('validationSlice', () => {
  let mockValidations: IValidations;

  const slice = validationSlice();

  beforeEach(() => {
    mockValidations = {
      formLayout: {
        mockComponent: {
          simpleBinding: {
            errors: ['Error message'],
            warnings: [],
          },
        },
      },
    };
  });

  it('handles updateComponentValidations action', () => {
    const componentValidations: IComponentValidations = {
      simpleBinding: {
        errors: ['Something went wrong...'],
        warnings: ['Warning'],
      },
    };
    const componentId = 'testComponent';
    const invalidDataTypes: string[] = [componentId];
    const nextState = slice.reducer(
      {
        ...initialState,
        validations: mockValidations,
      },
      ValidationActions.updateComponentValidations({
        pageKey: 'formLayout',
        componentId,
        validationResult: {
          validations: componentValidations,
          invalidDataTypes: true,
        },
        invalidDataTypes,
      }),
    );
    const expectedValidations: IValidations = {
      formLayout: {
        ...mockValidations.formLayout,
        [componentId]: componentValidations,
      },
    };

    expect(nextState.validations).toEqual(expectedValidations);
    expect(nextState.invalidDataTypes).toEqual(invalidDataTypes);
  });
});
