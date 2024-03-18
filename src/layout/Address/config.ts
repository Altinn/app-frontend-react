import { CG } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: CompCategory.Form,
  rendersWithLabel: false,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
    renderInAccordion: false,
    renderInAccordionGroup: false,
  },
})
  .addTextResource(
    new CG.trb({
      name: 'title',
      title: 'Title',
      description: 'Title of the component',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'careOfTitle',
      title: 'Care Of Title',
      description: 'Title for care-of',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'zipCodeTitle',
      title: 'Zip Code Title',
      description: 'Title for the zip code',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'postPlaceTitle',
      title: 'Post place Title',
      description: 'Title for post place',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'houseNumberTitle',
      title: 'House number Title',
      description: 'Title for house number',
    }),
  )
  .addDataModelBinding(
    new CG.obj(
      new CG.dmb({
        name: 'address',
        title: 'Data model binding for address',
        description: 'Describes the location in the data model where the component should store the address.',
      }),
      new CG.dmb({
        name: 'zipCode',
        title: 'Data model binding for zip code',
        description: 'Describes the location in the data model where the component should store the zip code.',
      }),
      new CG.dmb({
        name: 'postPlace',
        title: 'Data model binding for post place',
        description: 'Describes the location in the data model where the component should store the post place.',
      }),
      new CG.dmb({
        name: 'careOf',
        title: 'Data model binding for care of',
        description: 'Describes the location in the data model where the component should store care of.',
      }).optional(),
      new CG.dmb({
        name: 'houseNumber',
        title: 'Data model binding for house number',
        description: 'Describes the location in the data model where the component should store the house number.',
      }).optional(),
    ).exportAs('IDataModelBindingsForAddress'),
  )
  .addProperty(new CG.prop('saveWhileTyping', CG.common('SaveWhileTyping').optional({ default: true })))
  .addProperty(
    new CG.prop(
      'simplified',
      new CG.bool()
        .optional({ default: true })
        .setTitle('Simplified')
        .setDescription('Whether to use the simplified address input or not'),
    ),
  );

// Even though this component does not render a label, it's still possible to configure labelSettings on it
Config.inner.extends(CG.common('LabeledComponentProps'));
