import { CG, Variant } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';
import type { GenerateComponentLike } from 'src/codegen/dataTypes/GenerateComponentLike';

export const Config = new CG.component({
  category: CompCategory.Container,
  rendersWithLabel: false,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
    renderInAccordion: false,
    renderInAccordionGroup: false,
  },
})
  .setLayoutNodeType(
    new CG.import({
      import: 'LayoutNodeForGroup',
      from: 'src/layout/Group/LayoutNodeForGroup',
    }),
  )
  .addProperty(
    new CG.prop(
      'children',
      new CG.arr(new CG.str())
        .setTitle('Children')
        .setDescription('Array of component IDs that should be displayed in the group'),
    ).onlyIn(Variant.External),
  );

// Remove these so they're not set to undefined, as is the default for all other components. We override these anyway.
Config.inner.removeProperty('textResourceBindings');
Config.inner.removeProperty('dataModelBindings');

const commonNonRepChildComponents = new CG.prop('childComponents', new CG.arr(CG.layoutNode)).onlyIn(Variant.Internal);

const commonRepRowsProp = new CG.prop(
  'rows',
  new CG.arr(
    new CG.obj(
      new CG.prop('index', new CG.num()),
      new CG.prop('items', new CG.arr(CG.layoutNode)),
      new CG.prop(
        'groupExpressions',
        new CG.import({
          import: 'HGroupExpressions',
          from: 'src/layout/Group/types',
        }).optional(),
      ),
    ).exportAs('HRepGroupRow'),
  ).exportAs('HRepGroupRows'),
).onlyIn(Variant.Internal);

const commonShowGroupingIndicatorProp = new CG.prop(
  'showGroupingIndicator',
  new CG.bool()
    .optional({ default: false })
    .setTitle('Show grouping indicator')
    .setDescription(
      'If set to true, non-repeating groups will show an indicator to the left of the entire group contents, ' +
        'making it visually clear that the child components are grouped together.',
    ),
);

const commonUndefinedDataModelBinding = new CG.raw({ typeScript: 'undefined' }).optional();

function commonExtensions(subType: GenerateComponentLike) {
  return subType
    .extends(Config)
    .extends(CG.common('SummarizableComponentProps'))
    .extendTextResources(CG.common('TRBSummarizable'));
}

Config.overrideExported(
  new CG.union(
    commonExtensions(makeNonRepeatingGroup()).inner.exportAs('CompGroupNonRepeating'),
    commonExtensions(makeNonRepeatingPanelGroup()).inner.exportAs('CompGroupNonRepeatingPanel'),
  ),
);

function makeNonRepeatingGroup() {
  return new CG.componentLike()
    .addProperty(new CG.prop('dataModelBindings', commonUndefinedDataModelBinding).onlyIn(Variant.Internal))
    .addTextResource(
      new CG.trb({
        name: 'title',
        title: 'Title',
        description: 'The title of the group (shown above the group)',
      }),
    )
    .addTextResource(
      new CG.trb({
        name: 'body',
        title: 'Body',
        description: 'The body text shown underneath the title',
      }),
    )
    .addProperty(commonNonRepChildComponents)
    .addProperty(
      new CG.prop(
        'maxCount',
        new CG.int()
          .optional({ default: 1 })
          .setMax(1)
          .setTitle('Max number of rows')
          .setDescription(
            'Maximum number of rows that can be added. Setting this to a value ' +
              'higher than 1 turns the group into a repeating group',
          ),
      ),
    )
    .addProperty(commonShowGroupingIndicatorProp);
}

function makeNonRepeatingPanelGroup() {
  return new CG.componentLike()
    .addProperty(new CG.prop('dataModelBindings', commonUndefinedDataModelBinding).onlyIn(Variant.Internal))
    .addTextResource(
      new CG.trb({
        name: 'title',
        title: 'Title',
        description: 'The title of the group (shown above the group)',
      }),
    )
    .addTextResource(
      new CG.trb({
        name: 'add_label',
        title: 'Add button label',
        description: 'The text for the "Add" button (for adding another row to the referenced repeating group)',
      }),
    )
    .addTextResource(
      new CG.trb({
        name: 'body',
        title: 'Body',
        description: 'The body text of the Panel',
      }),
    )
    .addProperty(commonNonRepChildComponents)
    .addProperty(
      new CG.prop(
        'maxCount',
        new CG.int()
          .optional({ default: 1 })
          .setMax(1)
          .setTitle('Max number of rows')
          .setDescription(
            'Maximum number of rows that can be added. Setting this to a value ' +
              'higher than 1 turns the group into a repeating group',
          ),
      ),
    )
    .addProperty(
      new CG.prop(
        'panel',
        new CG.obj(
          new CG.prop(
            'iconUrl',
            new CG.str()
              .optional()
              .setTitle('Icon URL')
              .setDescription('URL to an icon image that overrides the default icon'),
          ),
          new CG.prop(
            'iconAlt',
            new CG.str().optional().setTitle('Icon alt text').setDescription('Alt text for the icon'),
          ),
          new CG.prop(
            'groupReference',
            new CG.obj(new CG.prop('group', new CG.str().setTitle('Repeating group component ID')))
              .optional()
              .setTitle('Group reference')
              .setDescription(
                'Reference to a repeating group ID. This will make it possible to add a row to the referenced group ' +
                  'from the current group Panel (see also the "add_label" text resource binding.',
              )
              .addExample({
                group: 'repeatingGroup1',
              }),
          ),
        )
          .extends(CG.common('IPanelBase'))
          .exportAs('IGroupPanel'),
      ),
    )
    .addProperty(commonShowGroupingIndicatorProp);
}
