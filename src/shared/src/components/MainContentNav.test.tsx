import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import type { IMainContentNavProps } from "./MainContentNav";
import { MainContentNav } from "./MainContentNav";

describe('MainContentNav.tsx', () => {
  it('should render supplied text', () => {
    renderMainContentNav();
    expect(screen.getByText('Hopp til hovedinnhold')).toBeInTheDocument();
  });

  it('should set active element to main when nav is clicked', async () => {
    renderMainContentNav();
    await userEvent.click(screen.getByRole('link'));
    expect(document.activeElement).toBe(document.getElementById('main-content'));
  });

  function renderMainContentNav(props: Partial<IMainContentNavProps> = {}) {
    const defaultProps: IMainContentNavProps = {
      navigateText: 'Hopp til hovedinnhold'
    };
    render(
      <>
        <MainContentNav {...defaultProps} {...props} />
        <main id='main-content'></main>
      </>
    );
  };
});