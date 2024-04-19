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
            .exportAs('CardSrcImage'),
        ),
        new CG.prop('width', new CG.str().setTitle('Image width').addExample('100%').optional({ default: '100%' })),
        new CG.prop(
          'altText',
          new CG.str().setTitle('Alt text').setDescription('Alternative text for the image (for screen readers)'),
        ),
      )
        .optional()
        .exportAs('CardImage'),
    ),
  )
  .addProperty(
    new CG.prop(
      'position',
      new CG.enum('top', 'bottom')
        .optional({ default: 'top' })
        .setTitle('ImagePosition')
        .setDescription('Position of the image/video/audio in the card')
        .exportAs('CardMediaPosition'),
    ),
  )
  .addProperty(
    new CG.prop(
      'minMediaHeight',
      new CG.str()
        .setTitle('minMediaHeight')
        .setDescription('Fixed minimum height of media')
        .exportAs('MinMediaHeight')
        .optional()
        .addExample('100px', '100%', '100rem'),
    ),
  )
  .addProperty(
    new CG.prop(
      'video',
      new CG.obj(
        new CG.prop(
          'src',
          new CG.obj(
            new CG.prop('nb', new CG.str().optional().setTitle('Video source (when using norwegian bokmål language)')),
            new CG.prop('nn', new CG.str().optional().setTitle('Video source (when using norwegian nynorsk language)')),
            new CG.prop('en', new CG.str().optional().setTitle('Video source (when using english language)')),
          )
            .additionalProperties(new CG.str().optional().setTitle('Video source (when using other languages)'))
            .addExample({
              nb: 'https://example.com/video.mp4',
              nn: 'https://example.com/video.mp4',
              en: 'https://example.com/video.mp4',
            })
            .exportAs('CardVideoSrc'),
        ),
      )
        .optional()
        .exportAs('CardVideo'),
    ),
  )
  .addProperty(
    new CG.prop(
      'audio',
      new CG.obj(
        new CG.prop(
          'src',
          new CG.obj(
            new CG.prop('nb', new CG.str().optional().setTitle('Audio source (when using norwegian bokmål language)')),
            new CG.prop('nn', new CG.str().optional().setTitle('Audio source (when using norwegian nynorsk language)')),
            new CG.prop('en', new CG.str().optional().setTitle('Audio source (when using english language)')),
          )
            .additionalProperties(new CG.str().optional().setTitle('Audio source (when using other languages)'))
            .addExample({
              nb: 'https://example.com/audio.mp3',
              nn: 'https://example.com/audio.mp3',
              en: 'https://example.com/audio.mp3',
            })
            .exportAs('CardAudioSrc'),
        ),
      )
        .optional()
        .exportAs('CardAudio'),
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
