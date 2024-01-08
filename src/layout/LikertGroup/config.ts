import { CG, Variant } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';
import type { GenerateComponentLike } from 'src/codegen/dataTypes/GenerateComponentLike';

export const Config = new CG.component({
  category: CompCategory.Form,
  rendersWithLabel: false,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
    renderInAccordion: false,
    renderInAccordionGroup: false,
  },
});

// Remove these so they're not set to undefined, as is the default for all other components. We override these anyway.
Config.inner.removeProperty('textResourceBindings');
Config.inner.removeProperty('dataModelBindings');

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
        name: 'description',
        title: 'Description (for repeating groups displayed as Likert)',
        description: 'The description text for the Likert table (when edit.mode is "likert")',
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
        name: 'questions',
        title: 'Questions',
        description: 'The questions to be displayed in each row (use a dynamic text resource)',
      }),
    )
    .addTextResource(
      new CG.trb({
        name: 'questionDescriptions',
        title: 'Question descriptions',
        description: 'The descriptions to be displayed in each row (use a dynamic text resource)',
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
    .addDataModelBinding(CG.common('IDataModelBindingsLikertSimple').optional())
    .addProperty(
      new CG.prop(
        'filter',
        new CG.arr(new CG.obj(new CG.prop('key', new CG.str()), new CG.prop('value', new CG.str())).exportAs('IFilter'))
          .optional()
          .setTitle('Filter')
          .setDescription(
            'Optionally filter specific rows within the likert group using start/stop indexes for displaying the desired ones' +
              '(in other cases use an expression in the "hiddenRow" property instead)',
          )
          .exportAs('ILikertFilter'),
      ),
    )
    .makeSelectionComponent(false);
}
