import { useMemo } from 'react';

import { pick } from 'dot-object';

import { evalExpr, isExpression } from 'src/features/expressions';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { convertDataBindingToModel, getKeyWithoutIndexIndicators } from 'src/utils/databindings';
import { transposeDataBinding } from 'src/utils/databindings/DataBinding';
import { selectDataSourcesFromState } from 'src/utils/layout/hierarchy';
import type { IOption, IOptionSource } from 'src/layout/common.generated';
import type { HierarchyDataSources } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface IUseSourceOptionsArgs {
  source: IOptionSource | undefined;
  node: LayoutNode;
}

export const useSourceOptions = ({ source, node }: IUseSourceOptionsArgs): IOption[] | undefined => {
  const dataSources = useAppSelector(selectDataSourcesFromState);

  return useMemo(() => getSourceOptions({ source, node, dataSources }), [source, node, dataSources]);
};

interface IGetSourceOptionsArgs extends IUseSourceOptionsArgs {
  dataSources: HierarchyDataSources;
}

export function getSourceOptions({ source, node, dataSources }: IGetSourceOptionsArgs): IOption[] | undefined {
  if (!source) {
    return undefined;
  }

  const { formData, langTools } = dataSources;
  const { group, value, label, helpText, description } = source;
  const cleanValue = getKeyWithoutIndexIndicators(value);
  const cleanGroup = getKeyWithoutIndexIndicators(group);
  const groupPath = node.transposeDataModel(cleanGroup) || group;
  const formDataAsObject = convertDataBindingToModel(formData);
  const output: IOption[] = [];

  if (groupPath) {
    const groupData = pick(groupPath, formDataAsObject);
    if (groupData && Array.isArray(groupData)) {
      for (const idx in groupData) {
        const path = `${groupPath}[${idx}]`;
        const valuePath = transposeDataBinding({ subject: cleanValue, currentLocation: path });

        /**
         * Running evalExpression is all that is needed to support dynamic expressions in
         * source options. However, since there are multiple rows of content which might
         * contain text variables, evalExpr needs to be able to resolve these values at
         * the correct path in the data model i.e. use langAsStringUsingPathInDataModel.
         *
         * To coerce the text-function in dynamic expressions to use the correct function
         * (langAsStringUsingPathInDataModel), this modified dataSources modifies the
         * langAsString function to actually be langAsStringUsingPathInDataModel partially
         * applied with the correct path in the data model.
         */
        const modifiedDataSources = {
          ...dataSources,
          langTools: {
            ...langTools,
            langAsString: (key: string) => langTools.langAsStringUsingPathInDataModel(key, path),
          },
        };
        output.push({
          value: pick(valuePath, formDataAsObject),
          label: isExpression(label)
            ? evalExpr(label, node, modifiedDataSources)
            : langTools.langAsStringUsingPathInDataModel(label, path),
          description: isExpression(description)
            ? evalExpr(description, node, modifiedDataSources)
            : langTools.langAsStringUsingPathInDataModel(description, path),
          helpText: isExpression(helpText)
            ? evalExpr(helpText, node, modifiedDataSources)
            : langTools.langAsStringUsingPathInDataModel(helpText, path),
        });
      }
    }
  }

  return output;
}
