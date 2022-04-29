import * as React from 'react';
import { renderWithProviders } from '../../../testUtils';
import { screen } from '@testing-library/react';

import { AttachmentWithTagSummaryComponent } from './AttachmentWithTagSummaryComponent';
import {ISelectionComponentProps} from 'src/features/form/layout';

describe('AttachmentWithTagSummaryComponent', () => {
  const name = 'FileUploadWithTag'
  const mockLayout = {
    layouts: {
      FormLayout: [
        {
          id: name,
          type: name,
          dataModelBindings:{}
        }
      ]
    }
  } as any;
  test('should render file upload with tag', () => {
    renderHelper(mockLayout.layouts.FormLayout[0]);
    expect(screen.getByTestId('attachment-with-tag-summary')).toBeInTheDocument();
  });

  const renderHelper = ( options: ISelectionComponentProps ) => {
    renderWithProviders(
      <AttachmentWithTagSummaryComponent
        componentRef={name}
        component={options}
      />,
      {
        preloadedState: { formLayout: mockLayout },
      },
    );
  };
});
