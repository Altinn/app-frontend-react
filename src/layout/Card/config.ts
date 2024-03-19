import { CG } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: CompCategory.Presentation,
  rendersWithLabel: false,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
    renderInAccordion: true,
    renderInAccordionGroup: false,
    renderInCardGroup: true,
  },
})
  .addTextResource(
    new CG.trb({
      name: 'title',
      title: 'Title',
      description: 'The title of the Card',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'body',
      title: 'Body',
      description: 'The body of the Card',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'footer',
      title: 'Footer text',
      description: 'The footer of the Card',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'altText',
      title: 'Alt text',
      description: 'Alternative text for the image (for screen readers).',
    }),
  )
  .addProperty(
    new CG.prop(
      'image',
      new CG.obj(
        new CG.prop(
          'src',
          new CG.obj(
            new CG.prop('nb', new CG.str().optional().setTitle('Image source (when using norwegian bokmål language)')),
            new CG.prop('nn', new CG.str().optional().setTitle('Image source (when using norwegian nynorsk language)')),
            new CG.prop('en', new CG.str().optional().setTitle('Image source (when using english language)')),
          )
            .additionalProperties(new CG.str().optional().setTitle('Image source (when using other languages)'))
            .addExample({
              nb: 'https://example.com/bilde.png',
              nn: 'https://example.com/bilete.png',
              en: 'https://example.com/image.png',
            })
            .exportAs('IImageSrc'),
        ),
        new CG.prop('width', new CG.str().setTitle('Image width').addExample('100%')),
        new CG.prop(
          'align',
          new CG.enum('flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly')
            .setTitle('Justification/alignment')
            .setDescription('Justification/alignment of the image')
            .exportAs('GridJustification'),
        ),
      )
        .optional()
        .exportAs('IImage'),
    ),
  )
  .addProperty(
    new CG.prop(
      'edit',
      new CG.obj(
        new CG.prop(
          'position',
          new CG.enum('top', 'bottom')
            .setTitle('ImagePosition')
            .setDescription('Positon of the image')
            .exportAs('Position'),
        ),
      ),
    ),
  )
  .addProperty(
    new CG.prop(
      'media',
      new CG.obj(
        new CG.prop(
          'src',
          new CG.obj(
            new CG.prop('nb', new CG.str().optional().setTitle('Media source (when using norwegian bokmål language)')),
            new CG.prop('nn', new CG.str().optional().setTitle('Media source (when using norwegian nynorsk language)')),
            new CG.prop('en', new CG.str().optional().setTitle('Media source (when using english language)')),
          )
            .additionalProperties(new CG.str().optional().setTitle('Media source (when using other languages)'))
            .addExample({
              nb: 'https://example.com/video.mp4',
              nn: 'https://example.com/video.mp4',
              en: 'https://example.com/video.mp4',
            })
            .exportAs('IMediaSrc'),
        ),
      )
        .optional()
        .exportAs('IMedia'),
    ),
  )
  .addProperty(
    new CG.prop(
      'color',
      new CG.enum('neutral', 'subtle')
        .setTitle('Card color')
        .setDescription('The colorstyle of the card')
        .exportAs('CardColor'),
    ),
  );
