import { getCookieString } from 'src/utils/cookieUtils';

describe('getCookieString', () => {
  const name = 'testCookie';
  const value = 'testValue';

  it('should have domain ".local.altinn.cloud" and not include secure if local development', () => {
    process.env.NODE_ENV = 'development';

    // Arrange
    const domain = '.local.altinn.cloud';
    const expectedCookieString = `${name}=${value}; Path=/; Domain=${domain} SameSite=None;`;

    // Act
    const cookieString = getCookieString(name, value);

    // Assert
    expect(cookieString).toBe(expectedCookieString);
  });

  it('should have domain ".altinn.no" and include secure if in production build and production env', () => {
    // Arrange
    process.env.NODE_ENV = 'production';
    window = Object.create(window);
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'https://altinn.no',
      },
      writable: true,
    });

    const domain = '.altinn.no';
    const expectedCookieString = `${name}=${value}; Path=/; Domain=${domain} SameSite=None; Secure;`;

    // Act
    const cookieString = getCookieString(name, value);

    // Assert
    expect(cookieString).toBe(expectedCookieString);
  });

  it('should have domain ".altinn.no" and include secure if in production build and tt02 env', () => {
    // Arrange
    window = Object.create(window);
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'https://ttd.apps.altinn.no',
      },
      writable: true,
    });

    const domain = '.altinn.no';
    const expectedCookieString = `${name}=${value}; Path=/; Domain=${domain} SameSite=None; Secure;`;

    // Act
    const cookieString = getCookieString(name, value);

    // Assert
    expect(cookieString).toBe(expectedCookieString);
  });
});
