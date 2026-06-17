/**
 * Replaces the frontend version in the given HTML string with the selected version.
 */
export function replaceFrontendVersion(html: string, selectedVersion: string): string {
  return (
    html
      .replace(/src=".*\/altinn-app-frontend.js"/g, `src="${selectedVersion}/altinn-app-frontend.js"`)
      .replace(/href=".*\/altinn-app-frontend.css"/g, `href="${selectedVersion}/altinn-app-frontend.css"`)
      // Remove the bootstrap's `const appId = ...` line (it may be indented). document.write() reuses
      // the current JavaScript realm, so this `const` was already declared on the initial page load,
      // and re-running it throws "Identifier 'appId' has already been declared". Dropping the line lets
      // the existing binding be reused; it holds the same value since the URL is unchanged.
      .replace(/^[ \t]*const appId.*\r?\n?/m, '')
  );
}
