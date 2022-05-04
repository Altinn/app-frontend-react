import { mount } from 'enzyme';
import React from 'react';
import NavBar from './NavBar';

describe('components/presentation/NavBar.tsx', () => {
  it('should render back button by default', () => {
    const wrapper = mount(
      <NavBar
        language={{}}
        handleClose={null}
        handleBack={null}
        appLanguages={null}
        onAppLanguageChange={jest.fn}
        selectedAppLanguage={null}
      />,
    );
    expect(wrapper.find('div.a-modal-navbar')).toHaveLength(1);
    expect(wrapper.find('button.a-modal-close')).toHaveLength(1);
  });

  it('should not render back button when hideBackButton is supplied', () => {
    const wrapper = mount(
      <NavBar
        language={{}}
        handleClose={null}
        handleBack={null}
        hideCloseButton={true}
        appLanguages={null}
        onAppLanguageChange={jest.fn}
        selectedAppLanguage={null}
      />,
    );
    expect(wrapper.find('div.a-modal-navbar')).toHaveLength(1);
    expect(wrapper.find('button.a-modal-close')).toHaveLength(0);
  });
});
