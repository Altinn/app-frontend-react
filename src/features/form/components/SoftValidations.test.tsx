import React from 'react';

import { screen } from '@testing-library/react';

import { getInitialStateMock } from 'src/__mocks__/initialStateMock';
import { getPanelTitle, SoftValidations } from 'src/features/form/components/SoftValidations';
import { nb } from 'src/language/texts/nb';
import { FormComponentContext } from 'src/layout';
import { renderWithProviders } from 'src/testUtils';
import type { ISoftValidationProps, SoftValidationVariant } from 'src/features/form/components/SoftValidations';
import type { IFormComponentContext } from 'src/layout';
import type { IRuntimeState, ITextResource } from 'src/types';

const render = (
  props: Partial<ISoftValidationProps> = {},
  suppliedState: Partial<IRuntimeState> = {},
  suppliedContext: Partial<IFormComponentContext> = {},
) => {
  const allProps: ISoftValidationProps = {
    variant: 'info',
    children: (
      <ol>
        <li>Some message</li>
      </ol>
    ),
    ...props,
  };

  renderWithProviders(
    <FormComponentContext.Provider value={suppliedContext}>
      <SoftValidations {...allProps} />
    </FormComponentContext.Provider>,
    {
      preloadedState: {
        ...getInitialStateMock(),
        ...suppliedState,
      },
    },
  );
};

describe('SoftValidations', () => {
  it.each(['info', 'warning', 'success'])(
    'for variant %p it should render the message with correct title',
    (variant: SoftValidationVariant) => {
      render({ variant });

      const message = screen.getByText('Some message');
      expect(message).toBeInTheDocument();

      const title = screen.getByText(getPanelTitle({ variant, textResources: [], language: nb() }));
      expect(title).toBeInTheDocument();
    },
  );

  it.each(['info', 'warning', 'success'])(
    'for variant %p it should render the message with overridden title if supplied by app',
    (variant: SoftValidationVariant) => {
      const suppliedTextResources: ITextResource[] = [
        {
          id: 'soft_validation.warning_title',
          value: 'Overridden warning title',
        },
        { id: 'soft_validation.info_title', value: 'Overridden info title' },
        {
          id: 'soft_validation.success_title',
          value: 'Overridden success title',
        },
      ];
      render(
        { variant },
        {
          textResources: {
            language: 'nb',
            resources: suppliedTextResources,
            error: null,
          },
        },
      );

      const message = screen.getByText('Some message');
      expect(message).toBeInTheDocument();

      const title = screen.getByText(
        getPanelTitle({
          variant,
          textResources: suppliedTextResources,
          language: nb(),
        }),
      );
      expect(title).toBeInTheDocument();
    },
  );
});
