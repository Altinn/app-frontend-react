
// Apps are running in a subpath of `/{org}/{app}` both locally and in deployed environments
// some features make use of relative paths that should resolve relative to this subpath.
// * `image.src` on the `ImageComponent` might have `some-image.jpg` which we expect to then exist in the `wwwroot/`
//   folder of the app.
// The `base` element in the HTML head will make relative references resolve from `base.href`.
// Bugreport: https://github.com/Altinn/app-frontend-react/issues/2257
const heads = document.getElementsByTagName('head');
if (heads && heads.length > 0) {
  const head = heads[0];
  const base = document.createElement('base');
  base.href = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
  base.href += `${window.org}/${window.app}/`;
  head.appendChild(base);
}
