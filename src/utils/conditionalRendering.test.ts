import { runConditionalRenderingRules } from 'src/utils/conditionalRendering';
import type { IConditionalRenderingRules } from 'src/features/form/dynamics';
import type { ILayout } from 'src/layout/layout';

describe('conditionalRendering', () => {
  beforeAll(() => {
    const mockRuleHandlerHelper = {
      biggerThan10: () => ({
        number: 'number',
      }),
      lengthBiggerThan4: () => ({
        value: 'value',
      }),
    };
    const mockRuleHandler = {
      biggerThan10: (obj) => {
        obj.number = +obj.number;
        return obj.number > 10;
      },
      lengthBiggerThan4: (obj) => {
        if (obj.value == null) {
          return false;
        }
        return obj.value.length >= 4;
      },
    };

    window.conditionalRuleHandlerHelper = mockRuleHandlerHelper;
    window.conditionalRuleHandlerObject = mockRuleHandler;
  });

  const layout: ILayout = [
    {
      id: 'group_1',
      type: 'Group',
      dataModelBindings: {
        group: 'parentGroup',
      },
      maxCount: 3,
      children: ['group_2'],
    },
    {
      id: 'group_2',
      type: 'Group',
      dataModelBindings: {
        group: 'parentGroup.childGroup',
      },
      maxCount: 3,
      children: [],
    },
  ];

  function makeNodes(formData: object) {}

  it('conditional rendering rules should run as expected for repeating groups', () => {
    const showRules: IConditionalRenderingRules = {
      ruleId: {
        selectedFunction: 'biggerThan10',
        inputParams: {
          number: 'mockGroup{0}.mockField',
        },
        selectedFields: {
          selectedField_1: 'layoutElement_2{0}',
          selectedField_2: 'layoutElement_3{0}',
        },
        selectedAction: 'Show',
        repeatingGroup: {
          groupId: 'group_1',
        },
      },
    };
    const repeatingGroups = {
      group_1: {
        index: 0,
      },
    };

    const formData = {
      'parentGroup[0].mockField': '8',
    };
    const formDataAsObj = { parentGroup: [{ mockField: '8' }] };

    // eslint-disable-next-line testing-library/render-result-naming-convention
    const result = runConditionalRenderingRules(showRules, formData, repeatingGroups);
    expect([...result.values()]).toEqual(['layoutElement_2-0', 'layoutElement_3-0']);
  });

  it('conditional rendering rules should run as expected for nested repeating groups', () => {
    const showRules: IConditionalRenderingRules = {
      ruleId: {
        selectedFunction: 'biggerThan10',
        inputParams: {
          number: 'parentGroup{0}.childGroup{1}.mockField',
        },
        selectedFields: {
          selectedField_1: 'someField{0}{1}',
          selectedField_2: 'someOtherField{0}{1}',
        },
        selectedAction: 'Hide',
        repeatingGroup: {
          groupId: 'group_1',
          childGroupId: 'group_2',
        },
      },
    };
    const repeatingGroups = {
      group_1: {
        index: 1,
      },
      'group_2-0': {
        index: 2,
      },
      'group_2-1': {
        index: 2,
      },
    };

    const formData = {
      'parentGroup[0].childGroup[0].mockField': '11',
      'parentGroup[0].childGroup[1].mockField': '8',
      'parentGroup[0].childGroup[2].mockField': '8',
      'parentGroup[1].childGroup[0].mockField': '8',
      'parentGroup[1].childGroup[1].mockField': '8',
      'parentGroup[1].childGroup[2].mockField': '11',
    };

    const formDataAsObj = {
      parentGroup: [
        { childGroup: [{ mockField: '11' }, { mockField: '8' }, { mockField: '8' }] },
        { childGroup: [{ mockField: '8' }, { mockField: '8' }, { mockField: '11' }] },
      ],
    };

    // eslint-disable-next-line testing-library/render-result-naming-convention
    const result = runConditionalRenderingRules(showRules, formData, repeatingGroups);

    expect([...result.values()]).toEqual([
      'someField-0-0',
      'someOtherField-0-0',
      'someField-1-2',
      'someOtherField-1-2',
    ]);
  });
});
