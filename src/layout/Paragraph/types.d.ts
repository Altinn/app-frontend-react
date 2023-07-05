import type { ILayoutCompBase } from 'src/layout/layout';

type ValidTexts = 'title' | 'help';
export type ILayoutCompParagraph = ILayoutCompBase<'Paragraph', undefined, ValidTexts>;
