import type { IFormData, IFormDataState } from 'src/features/formData';

export function getFormDataStateMock(customState?: Partial<IFormDataState>) {
  const formData: IFormDataState = {
    submittingId: '',
  };

  return { ...formData, ...customState };
}

export function getFormDataDotMapMock(): IFormData {
  return {
    'someGroup[0].labelField': 'Label for first',
    'someGroup[1].labelField': 'Label for second',
    'someGroup[0].valueField': 'Value for first',
    'someGroup[1].valueField': 'Value for second',
    'referencedGroup[0].inputField': 'Value from input field [0]',
    'referencedGroup[1].inputField': 'Value from input field [1]',
    'referencedGroup[2].inputField': 'Value from input field [2]',
  };
}
