export function sanitizeImgSrcAndType(inputImgSrc: string): { imgSrc: string; imgType: string } {
  let imgSrc = inputImgSrc.split('/').filter(Boolean).join('/');

  const imgPathPrefix = `/${window.org}/${window.app}`;
  if (imgSrc.startsWith('wwwroot')) {
    imgSrc = imgSrc.replace('wwwroot', imgPathPrefix);
  }

  if (!imgSrc.startsWith(imgPathPrefix)) {
    imgSrc = [imgPathPrefix, imgSrc].join('/');
  }

  const imgType = imgSrc.split('.').at(-1);
  if (!imgType) {
    throw new Error('Image source is missing file type. Are you sure the image source is correct?');
  }

  return { imgSrc, imgType };
}
