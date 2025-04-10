import { CG } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: CompCategory.Action,
  capabilities: {
    renderInTable: true,
    renderInButtonGroup: false,
    renderInAccordion: true,
    renderInAccordionGroup: false,
    renderInCards: true,
    renderInCardsMedia: false,
    renderInTabs: true,
  },
  functionality: {
    customExpressions: false,
  },
})
  .addTextResource(
    new CG.trb({
      name: 'target',
      title: 'Target',
      description: 'The target of the link',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'title',
      title: 'Title',
      description: 'The title/text of the link',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'download',
      title: 'Download',
      description:
        'Download target instead of navigating to it. Non-blank value is passed to the download attribute and becomes the filename of the downloaded file. Blank value means default filename is used.',
    }),
  )
  .addProperty(
    new CG.prop(
      'style',
      new CG.enum('primary', 'secondary', 'link')
        .exportAs('LinkStyle')
        .setTitle('Style')
        .setDescription('The style of the link (a primary/secondary button, or an actual link)'),
    ),
  )
  .addProperty(
    new CG.prop(
      'size',
      new CG.enum('sm', 'md', 'lg')
        .optional({ default: 'md' })
        .setTitle('Size')
        .setDescription('The size of the button. Only effective using style of primary or secondary')
        .exportAs('LinkButtonSize'),
    ),
  )
  .addProperty(
    new CG.prop(
      'linkButtonTextAlign',
      new CG.enum('left', 'center', 'right')
        .optional({ default: 'center' })
        .setTitle('Text Align')
        .setDescription('Text align when using style of primary or secondary.')
        .exportAs('LinkButtonTextAlign'),
    ),
  )
  .addProperty(
    new CG.prop(
      'fullWidth',
      new CG.bool()
        .optional()
        .setTitle('Full width')
        .setDescription('Whether a link button should expand to full width'),
    ),
  )
  .addProperty(
    new CG.prop(
      'openInNewTab',
      new CG.bool().optional().setTitle('Open in new tab').setDescription('Open the link in a new tab'),
    ),
  );
