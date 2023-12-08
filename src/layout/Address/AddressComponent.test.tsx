import React from 'react';

import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import mockAxios from 'jest-mock-axios';

import { AddressComponent } from 'src/layout/Address/AddressComponent';
import { renderGenericComponentTest } from 'src/test/renderWithProviders';
import type { FDAction } from 'src/features/formData/FormDataWriteStateMachine';
import type { RenderGenericComponentTestProps } from 'src/test/renderWithProviders';

const render = async ({
  component,
  genericProps,
  ...rest
}: Partial<RenderGenericComponentTestProps<'AddressComponent'>> = {}) =>
  await renderGenericComponentTest({
    type: 'AddressComponent',
    renderer: (props) => <AddressComponent {...props} />,
    component: {
      simplified: true,
      readOnly: false,
      required: false,
      textResourceBindings: {},
      dataModelBindings: {
        address: 'address',
        zipCode: 'zipCode',
        postPlace: 'postPlace',
        careOf: 'careOf',
        houseNumber: 'houseNumber',
      },
      ...component,
    },
    genericProps: {
      isValid: true,
      ...genericProps,
    },
    ...rest,
  });

describe('AddressComponent', () => {
  it('should return simplified version when simplified is true', async () => {
    await render({
      component: {
        simplified: true,
      },
    });

    expect(screen.getByRole('textbox', { name: 'Gateadresse' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Postnr' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Poststed' })).toBeInTheDocument();

    expect(screen.queryByRole('textbox', { name: 'C/O eller annen tilleggsadresse' })).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Bolignummer' })).not.toBeInTheDocument();
  });

  it('should return complex version when simplified is false', async () => {
    await render({
      component: {
        simplified: false,
      },
    });

    expect(screen.getByRole('textbox', { name: 'Gateadresse' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Postnr' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Poststed' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'C/O eller annen tilleggsadresse' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Bolignummer' })).toBeInTheDocument();
  });

  it('should fire change event when user types into field, and field is blurred', async () => {
    const { dispatchFormData } = await render({
      component: {
        simplified: false,
      },
    });

    const address = screen.getByRole('textbox', { name: 'Gateadresse' });
    await userEvent.type(address, 'Slottsplassen 1');
    await userEvent.tab();

    expect(dispatchFormData).toHaveBeenCalledWith({
      type: 'setLeafValue',
      path: 'address',
      newValue: 'Slottsplassen 1',
    } as FDAction);
  });

  it('should not fire change event when readonly', async () => {
    const { dispatchFormData } = await render({
      component: {
        simplified: false,
        readOnly: true,
      },
    });

    const address = screen.getByRole('textbox', { name: 'Gateadresse' });

    await userEvent.type(address, 'Slottsplassen 1');
    await userEvent.tab();

    expect(dispatchFormData).not.toHaveBeenCalled();
  });

  it('should show error message on blur if zipcode is invalid, and not call handleDataChange', async () => {
    const { dispatchFormData } = await render({
      component: {
        required: true,
        simplified: false,
      },
    });

    const field = screen.getByRole('textbox', { name: 'Postnr *' });

    await userEvent.type(field, '1');
    await userEvent.tab();

    const errorMessage = screen.getByText(/Postnummer er ugyldig\. Et postnummer består kun av 4 siffer\./i);

    expect(dispatchFormData).not.toHaveBeenCalled();
    expect(errorMessage).toBeInTheDocument();
  });

  it('should update postplace on mount', async () => {
    const { dispatchFormData } = await render({
      component: {
        required: true,
        simplified: false,
      },
      queries: {
        fetchFormData: async () => ({ address: 'initial address', zipCode: '0001' }),
      },
    });

    mockAxios.mockResponseFor(
      { url: 'https://api.bring.com/shippingguide/api/postalCode.json' },
      {
        data: {
          valid: true,
          result: 'OSLO',
        },
      },
    );

    await screen.findByDisplayValue('OSLO');

    expect(dispatchFormData).toHaveBeenCalledWith({
      type: 'setLeafValue',
      path: 'postPlace',
      newValue: 'OSLO',
    } as FDAction);
  });

  it('should call change event when zipcode is valid', async () => {
    const { dispatchFormData } = await render({
      component: {
        required: true,
        simplified: false,
      },
    });

    const field = screen.getByRole('textbox', { name: 'Postnr *' });
    await userEvent.clear(field);
    await userEvent.type(field, '0001');
    await userEvent.tab();

    expect(dispatchFormData).toHaveBeenCalledWith({
      type: 'setLeafValue',
      path: 'zipCode',
      newValue: '0001',
    } as FDAction);
  });

  it('should call dispatch for post place when zip code is cleared', async () => {
    const { dispatchFormData } = await render({
      queries: {
        fetchFormData: async () => ({ address: 'a', zipCode: '0001', postPlace: 'Oslo' }),
      },
    });

    expect(screen.getByDisplayValue('0001')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Oslo')).toBeInTheDocument();

    await userEvent.clear(screen.getByRole('textbox', { name: 'Postnr' }));
    await userEvent.tab();

    expect(dispatchFormData).toHaveBeenCalledWith({
      type: 'setLeafValue',
      path: 'zipCode',
      newValue: '',
    } as FDAction);
    expect(dispatchFormData).toHaveBeenCalledWith({
      type: 'setLeafValue',
      path: 'postPlace',
      newValue: '',
    } as FDAction);
  });

  it('should display error message coming from props', async () => {
    const errorMessage = 'cannot be empty;';
    await render({
      genericProps: {
        componentValidations: {
          address: {
            errors: [errorMessage],
          },
        },
      },
      component: {
        required: true,
        simplified: false,
      },
    });

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should display no extra markings when required is false, and labelSettings.optionalIndicator is not true', async () => {
    await render({
      component: {
        required: false,
        simplified: false,
      },
    });
    expect(screen.getByRole('textbox', { name: 'Gateadresse' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Postnr' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Poststed' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'C/O eller annen tilleggsadresse' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Bolignummer' })).toBeInTheDocument();
  });

  it('should display required labels when required is true', async () => {
    await render({
      component: {
        required: true,
        simplified: false,
      },
    });

    expect(screen.getByRole('textbox', { name: 'Gateadresse *' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Postnr *' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'C/O eller annen tilleggsadresse *' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Bolignummer *' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Poststed' })).toBeInTheDocument();

    expect(screen.queryByRole('textbox', { name: 'Gateadresse (Valgfri)' })).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Postnr (Valgfri)' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('textbox', { name: 'C/O eller annen tilleggsadresse (Valgfri)' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Bolignummer (Valgfri)' })).not.toBeInTheDocument();
  });

  it('should display optional labels when optionalIndicator is true', async () => {
    await render({
      component: {
        simplified: false,
        labelSettings: {
          optionalIndicator: true,
        },
      },
    });

    expect(screen.queryByRole('textbox', { name: 'Gateadresse' })).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Postnr' })).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'C/O eller annen tilleggsadresse' })).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Bolignummer' })).not.toBeInTheDocument();

    expect(screen.getByRole('textbox', { name: 'Poststed' })).toBeInTheDocument();

    expect(screen.getByRole('textbox', { name: 'Gateadresse (Valgfri)' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Postnr (Valgfri)' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'C/O eller annen tilleggsadresse (Valgfri)' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Bolignummer (Valgfri)' })).toBeInTheDocument();
  });

  it('should not display optional labels by default', async () => {
    await render({
      component: {
        simplified: false,
      },
    });

    expect(screen.queryByRole('textbox', { name: 'Gateadresse (Valgfri)' })).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Postnr (Valgfri)' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('textbox', { name: 'C/O eller annen tilleggsadresse (Valgfri)' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Bolignummer (Valgfri)' })).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Poststed' })).toBeInTheDocument();

    expect(screen.getByRole('textbox', { name: 'Gateadresse' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Postnr' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'C/O eller annen tilleggsadresse' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Bolignummer' })).toBeInTheDocument();
  });

  it('should not display optional labels when readonly is true', async () => {
    await render({
      component: {
        readOnly: true,
        simplified: false,
      },
    });

    expect(screen.getByRole('textbox', { name: 'Gateadresse' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Postnr' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'C/O eller annen tilleggsadresse' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Bolignummer' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Poststed' })).toBeInTheDocument();

    expect(screen.queryByRole('textbox', { name: 'Gateadresse (Valgfri)' })).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Postnr (Valgfri)' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('textbox', { name: 'C/O eller annen tilleggsadresse (Valgfri)' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Bolignummer (Valgfri)' })).not.toBeInTheDocument();
  });

  it('should not display optional labels when readonly is true, even when optionalIndicator is true', async () => {
    await render({
      component: {
        readOnly: true,
        simplified: false,
        labelSettings: {
          optionalIndicator: true,
        },
      },
    });

    expect(screen.getByRole('textbox', { name: 'Gateadresse' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Postnr' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'C/O eller annen tilleggsadresse' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Bolignummer' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Poststed' })).toBeInTheDocument();

    expect(screen.queryByRole('textbox', { name: 'Gateadresse (Valgfri)' })).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Postnr (Valgfri)' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('textbox', { name: 'C/O eller annen tilleggsadresse (Valgfri)' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Bolignummer (Valgfri)' })).not.toBeInTheDocument();
  });

  it('should not display optional labels when required is true, even when optionalIndicator is true', async () => {
    await render({
      component: {
        required: true,
        simplified: false,
      },
    });

    expect(screen.getByRole('textbox', { name: 'Gateadresse *' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Postnr *' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'C/O eller annen tilleggsadresse *' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Bolignummer *' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Poststed' })).toBeInTheDocument();

    expect(screen.queryByRole('textbox', { name: 'Gateadresse (Valgfri)' })).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Postnr (Valgfri)' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('textbox', { name: 'C/O eller annen tilleggsadresse (Valgfri)' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Bolignummer (Valgfri)' })).not.toBeInTheDocument();
  });
});
