import React from 'react';
import { render } from '@testing-library/react';

import Header from './altinnAppHeader';
import { IProfile } from 'altinn-shared/types';

describe('AltinnAppHeader', () => {
  let mockLanguage: any;
  let mockProfile: any;
  beforeEach(() => {
    mockLanguage = {
      language: {
        instantiate: {
          all_forms: 'alle skjema',
          inbox: 'innboks',
          profile: 'profil',
        },
      },
    };
    mockProfile = {
      error: null,
      profile: {
        party: {
          person: {
            firstName: 'Ola',
            middleName: null,
            lastName: 'Privatperson',
          },
          partyId: '123456',
          organisation: null,
        },
      },
    };
  });

  it('should match snapshot', () => {
    const { container } = render(
      <Header
        type='partyChoice'
        language={mockLanguage}
        profile={mockProfile.profile as IProfile}
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should not render linklist if no type', () => {
    const { container } = render(
      <Header language={mockLanguage} profile={mockProfile} />,
    );

    expect(container.querySelector('ul')).not.toBeInTheDocument();
  });
});
