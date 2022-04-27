import * as React from 'react';
import { renderWithProviders } from '../../../testUtils';
import { screen } from '@testing-library/react';

import { SummaryComponent } from './SummaryComponent';

describe('SummaryComponent', () => {
  const mockLayout = {
    layouts: {
      FormLayout: [
        ...[
          'group','Group','FileUpload','FileUploadWithTag','Checkboxes', 'default'
        ].map(t => ({id: t, type: t, dataModelBindings:{}}))
      ]
    },
    uiConfig: {
      hiddenFields: []
    },
  } as any;
  test('should render group', () => {
    renderHelper('group');
    expect(screen.getByTestId('summary-group-component')).toBeInTheDocument();
  });
  test('should render Group (spelled differently)', () => {
    renderHelper('Group');
    expect(screen.getByTestId('summary-group-component')).toBeInTheDocument();
  });
  test('should render file upload', () => {
    renderHelper('FileUpload');
    expect(screen.getByTestId('attachment-summary-component')).toBeInTheDocument();
  });
  test('should render file upload with tag', () => {
    renderHelper('FileUploadWithTag');
    expect(screen.getByTestId('attachment-with-tag-summary')).toBeInTheDocument();
  });
  test('should render checkboxes', () => {
    renderHelper('Checkboxes');
    expect(screen.getByTestId('multiple-choice-summary')).toBeInTheDocument();
  });
  test('should render default', () => {
    renderHelper('default');
    expect(screen.getByTestId('single-input-summary')).toBeInTheDocument();
  });

  const renderHelper = (componentRef: string) => {
    renderWithProviders(
      <SummaryComponent id={'test-id'}
                        pageRef={'FormLayout'}
                        componentRef={componentRef}
      />, {
        preloadedState: { formLayout: mockLayout },
      });
  }
});
