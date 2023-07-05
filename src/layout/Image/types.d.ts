import type { GridJustification } from '@material-ui/core';

import type { ILayoutCompBase } from 'src/layout/layout';

export interface IImageSrc {
  nb?: string;
  nn?: string;
  en?: string;

  [language: string]: string | undefined;
}

export interface IImage {
  src: IImageSrc;
  width: string;
  align: GridJustification;
}

type ValidTexts = 'altTextImg' | 'help';
export interface ILayoutCompImage extends ILayoutCompBase<'Image', undefined, ValidTexts> {
  image?: IImage;
}
