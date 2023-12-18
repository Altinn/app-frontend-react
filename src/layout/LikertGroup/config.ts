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
}).addProperty(
  new CG.prop(
    'children',
    new CG.arr(new CG.str())
      .setTitle('Children')
      .setDescription('Array of component IDs that should be displayed in the LikertGroup'),
  ).onlyIn(Variant.External),
);

// Remove these so they're not set to undefined, as is the default for all other components. We override these anyway.
Config.inner.removeProperty('textResourceBindings');
Config.inner.removeProperty('dataModelBindings');

const commonRepGroupDataModelBinding = new CG.obj(
  new CG.prop(
    'group',
    new CG.str()
      .setTitle('Group')
      .setDescription(
        'Dot notation location for a repeating group structure (array of objects), where the data ' + 'is stored',
      ),
  ),
)
  .exportAs('IDataModelBindingsForGroup')
  .optional({ onlyIn: Variant.Internal });

function commonExtensions(subType: GenerateComponentLike) {
  return subType
    .extends(Config)
    .extends(CG.common('SummarizableComponentProps'))
    .extendTextResources(CG.common('TRBSummarizable'));
}

Config.overrideExported(new CG.union(commonExtensions(makeRepeatingLikertGroup()).inner.exportAs('LikertGroup')));

function makeRepeatingLikertGroup() {
  return new CG.componentLike()
    .addTextResource(
      new CG.trb({
        name: 'title',
        title: 'Title',
        description: 'The title of the group',
      }),
    )
    .addTextResource(
      new CG.trb({
        name: 'leftColumnHeader',
        title: 'Left column header (for repeating groups displayed as Likert)',
        description: 'The header text for the left column in the Likert table (when edit.mode is "likert")',
      }),
    )
    .addTextResource(
      new CG.trb({
        name: 'description',
        title: 'Description (for repeating groups displayed as Likert)',
        description: 'The description text for the Likert table (when edit.mode is "likert")',
      }),
    )
    .addProperty(
      new CG.prop(
        'rows',
        new CG.arr(
          new CG.obj(
            new CG.prop('index', new CG.num()),
            new CG.prop('items', new CG.arr(CG.layoutNode)),
            new CG.prop(
              'likertGroupExpressions',
              new CG.import({
                import: 'HLikertGroupExpressions',
                from: 'src/layout/LikertGroup/types',
              }).optional(),
            ),
          ).exportAs('HLikertGroupRow'),
        ).exportAs('HLikertGroupRows'),
      ).onlyIn(Variant.Internal),
    )
    .addDataModelBinding(commonRepGroupDataModelBinding)
    .addProperty(
      new CG.prop(
        'edit',
        new CG.obj(
          new CG.prop(
            'filter',
            new CG.arr(
              new CG.obj(new CG.prop('key', new CG.str()), new CG.prop('value', new CG.str())).exportAs('IGroupFilter'),
            )
              .optional()
              .setTitle('Filter')
              .setDescription(
                'Optionally filter specific rows within the likert group using start/stop indexes for displaying the desired ones' +
                  '(in other cases use an expression in the "hiddenRow" property instead)',
              ),
          ),
        )
          .exportAs('ILikertGroupEditProperties')
          .optional(),
      ),
    );
}
