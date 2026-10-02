import React from 'react';

import { screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { defaultMockDataElementId } from 'src/__mocks__/getInstanceDataMock';
import { defaultDataTypeMock } from 'src/__mocks__/getLayoutSetsMock';
import { Form } from 'src/components/form/Form';
import { ALTINN_ROW_ID } from 'src/features/formData/types';
import { BackendValidationSeverity } from 'src/features/validation';
import { useOnComponentValidation } from 'src/features/validation/callbacks/onComponentValidation';
import { renderWithInstanceAndLayout } from 'src/test/renderWithProviders';
import type { CompExternalExact, ILayoutCollection } from 'src/layout/layout';

function ComponentGate() {
  const validate = useOnComponentValidation('lookup');
  return <button onClick={validate}>Validate lookup result</button>;
}

const lookups = [
  {
    type: 'PersonLookup',
    bindings: [
      'person_lookup_ssn',
      'person_lookup_name',
      'person_lookup_first_name',
      'person_lookup_middle_name',
      'person_lookup_last_name',
    ],
    requiredMessage: 'Du må fylle ut fødselsnummer',
    number: '08829698278',
    numberLabel: /Fødselsnummer/i,
  },
  {
    type: 'OrganisationLookup',
    bindings: ['organisation_lookup_orgnr', 'organisation_lookup_name'],
    requiredMessage: 'Du må fylle ut organisasjonsnummer og hente opplysninger',
    number: '043871668',
    numberLabel: /Organisasjonsnummer/i,
  },
] as const;

describe.each(lookups)('$type validation', ({ type, bindings, requiredMessage }) => {
  async function render({
    repeating = false,
    backend = false,
    required = true,
    showValidations = backend,
    gate = false,
  } = {}) {
    const prefix = repeating ? 'lookups.' : '';
    const lookup = {
      id: 'lookup',
      type,
      required,
      showValidations: showValidations ? ['All'] : [],
      dataModelBindings: Object.fromEntries(
        bindings.map((binding) => [binding, { dataType: defaultDataTypeMock, field: `${prefix}${binding}` }]),
      ),
      textResourceBindings: { title: 'Lookup' },
    } as CompExternalExact<'PersonLookup' | 'OrganisationLookup'>;

    const fields = Object.fromEntries(bindings.map((binding) => [binding, '']));
    const layouts: ILayoutCollection = {
      FormLayout: {
        data: {
          layout: repeating
            ? [
                {
                  id: 'group',
                  type: 'RepeatingGroup',
                  children: ['lookup'],
                  dataModelBindings: { group: { dataType: defaultDataTypeMock, field: 'lookups' } },
                  validateOnSaveRow: ['All'],
                },
                lookup,
              ]
            : [lookup],
        },
      },
    };
    return renderWithInstanceAndLayout({
      renderer: () => (
        <>
          <Form />
          {gate && <ComponentGate />}
        </>
      ),
      mockFormDataSaving: true,
      queries: {
        fetchLayouts: async () => layouts,
        fetchLayoutSettings: async () => ({ pages: { order: ['FormLayout'] } }),
        fetchFormData: async () =>
          repeating
            ? {
                lookups: [
                  { [ALTINN_ROW_ID]: 'row-0', ...fields },
                  { [ALTINN_ROW_ID]: 'row-1', ...fields },
                ],
              }
            : fields,
        fetchBackendValidations: async () =>
          backend
            ? bindings.map((binding) => ({
                field: repeating ? `lookups[0].${binding}` : binding,
                dataElementId: defaultMockDataElementId,
                source: 'Custom',
                severity: BackendValidationSeverity.Error,
                customTextKey: `Invalid ${binding}`,
              }))
            : [],
      },
    });
  }

  it('reveals backend errors through the component gate without showValidations configuration', async () => {
    await render({ backend: true, required: false, showValidations: false, gate: true });
    const lookup = within(screen.getByRole('group', { name: 'Lookup' }));
    expect(lookup.queryByText(`Invalid ${bindings[0]}`)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Validate lookup result' }));
    for (const binding of bindings) {
      await waitFor(() => expect(lookup.getByText(`Invalid ${binding}`)).toBeInTheDocument());
    }
  });

  it('shows required validation inside the edited row when saving is blocked', async () => {
    await render({ repeating: true });
    await userEvent.click(screen.getAllByRole('button', { name: /Rediger/i })[0]);
    const row = screen.getByTestId('group-edit-container');
    expect(within(row).queryByText(requiredMessage)).not.toBeInTheDocument();
    await userEvent.click(within(row).getByRole('button', { name: /Lagre og lukk/i }));
    await waitFor(() => expect(within(row).getByText(requiredMessage)).toBeInTheDocument());
    expect(screen.getByTestId('group-edit-container')).toBeInTheDocument();
  });

  it('allows saving an empty optional lookup row', async () => {
    await render({ repeating: true, required: false });
    await userEvent.click(screen.getAllByRole('button', { name: /Rediger/i })[0]);
    await userEvent.click(
      within(screen.getByTestId('group-edit-container')).getByRole('button', { name: /Lagre og lukk/i }),
    );
    await waitFor(() => expect(screen.queryByTestId('group-edit-container')).not.toBeInTheDocument());
  });

  it('displays backend validation for every data model binding', async () => {
    await render({ backend: true, required: false });
    for (const binding of bindings) {
      expect(within(screen.getByRole('group', { name: 'Lookup' })).getByText(`Invalid ${binding}`)).toBeInTheDocument();
    }
  });

  it('displays backend validation for every binding in a repeating row', async () => {
    await render({ repeating: true, backend: true, required: false, showValidations: false });
    await userEvent.click(screen.getAllByRole('button', { name: /Rediger/i })[0]);
    const row = screen.getByTestId('group-edit-container');
    await userEvent.click(within(row).getByRole('button', { name: /Lagre og lukk/i }));
    for (const binding of bindings) {
      await waitFor(() => expect(within(row).getByText(`Invalid ${binding}`)).toBeInTheDocument());
    }
  });
});
