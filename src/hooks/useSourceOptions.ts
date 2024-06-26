import { evalExpr } from 'src/features/expressions';
import { ExprVal } from 'src/features/expressions/types';
import { ExprValidation } from 'src/features/expressions/validation';
import { useMemoDeepEqual } from 'src/hooks/useStateDeepEqual';
import { getKeyWithoutIndexIndicators } from 'src/utils/databindings';
import { transposeDataBinding } from 'src/utils/databindings/DataBinding';
import { useExpressionDataSources } from 'src/utils/layout/hierarchy';
import type { ExpressionDataSources } from 'src/features/expressions/ExprContext';
import type { IOptionInternal } from 'src/features/options/castOptionsToStrings';
import type { IOptionSource } from 'src/layout/common.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface IUseSourceOptionsArgs {
  source: IOptionSource | undefined;
  node: LayoutNode;
}

export const useSourceOptions = ({ source, node }: IUseSourceOptionsArgs): IOptionInternal[] | undefined => {
  const dataSources = useExpressionDataSources();

  return useMemoDeepEqual(() => getSourceOptions({ source, node, dataSources }), [source, node, dataSources]);
};

interface IGetSourceOptionsArgs extends IUseSourceOptionsArgs {
  dataSources: ExpressionDataSources;
}

export function getSourceOptions({ source, node, dataSources }: IGetSourceOptionsArgs): IOptionInternal[] | undefined {
  if (!source) {
    return undefined;
  }

  const { formDataSelector, langToolsSelector } = dataSources;
  const langTools = langToolsSelector(node);
  const { group, value, label, helpText, description } = source;
  const cleanValue = getKeyWithoutIndexIndicators(value);
  const cleanGroup = getKeyWithoutIndexIndicators(group);
  const groupPath = dataSources.transposeSelector(node, cleanGroup) || group;
  const output: IOptionInternal[] = [];

  if (groupPath) {
    const groupData = formDataSelector(groupPath);
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
        const modifiedDataSources: ExpressionDataSources = {
          ...dataSources,
          langToolsSelector: () => ({
            ...langTools,
            langAsString: (key: string) => langTools.langAsStringUsingPathInDataModel(key, path),
            langAsNonProcessedString: (key: string) =>
              langTools.langAsNonProcessedStringUsingPathInDataModel(key, path),
          }),
        };

        output.push({
          value: String(formDataSelector(valuePath)),
          label:
            label && ExprValidation.isNotValid(label, ExprVal.String)
              ? langTools.langAsStringUsingPathInDataModel(label, path)
              : ExprValidation.isValid(label)
                ? evalExpr(label, node, modifiedDataSources)
                : undefined,
          description:
            description && ExprValidation.isNotValid(description, ExprVal.String)
              ? langTools.langAsStringUsingPathInDataModel(description, path)
              : ExprValidation.isValid(description)
                ? evalExpr(description, node, modifiedDataSources)
                : undefined,
          helpText:
            helpText && ExprValidation.isNotValid(helpText, ExprVal.String)
              ? langTools.langAsStringUsingPathInDataModel(helpText, path)
              : ExprValidation.isValid(helpText)
                ? evalExpr(helpText, node, modifiedDataSources)
                : undefined,
        });
      }
    }
  }

  return output;
}
