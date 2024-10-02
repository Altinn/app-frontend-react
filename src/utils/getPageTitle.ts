export const getPageTitle = (appName: string, title: string, appOwner?: string) => {
  let result = `${title} - ${appName}`;
  if (appOwner) {
    result += ` - ${appOwner}`;
  }
  return result;
};
