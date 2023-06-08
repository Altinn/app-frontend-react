import React from 'react';

import { screen } from '@testing-library/react';

import { getInitialStateMock } from 'src/__mocks__/initialStateMock';
import { getPanelTitle, SoftValidations } from 'src/components/form/SoftValidations';
import { staticUseLanguage } from 'src/hooks/useLanguage';
import { FormComponentContext } from 'src/layout';
import { renderWithProviders } from 'src/testUtils';
import type { ISoftValidationProps, SoftValidationVariant } from 'src/components/form/SoftValidations';
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
      const langTools = staticUseLanguage([], null, 'nb', 'nb');
      render({ variant });

      const message = screen.getByText('Some message');
      expect(message).toBeInTheDocument();

      const title = screen.getByText(getPanelTitle({ variant, langTools }));
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
      const langTools = staticUseLanguage(suppliedTextResources, null, 'nb', 'nb');
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

      const title = screen.getByText(getPanelTitle({ variant, langTools }));
      expect(title).toBeInTheDocument();
    },
  );
});
