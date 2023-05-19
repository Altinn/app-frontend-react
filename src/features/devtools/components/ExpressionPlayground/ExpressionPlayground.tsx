import React, { useEffect } from 'react';

import { FieldSet, Select } from '@digdir/design-system-react';
import cn from 'classnames';

import classes from 'src/features/devtools/components/ExpressionPlayground/ExpressionPlayground.module.css';
import { SplitView } from 'src/features/devtools/components/SplitView/SplitView';
import { evalExpr } from 'src/features/expressions';
import { ExprVal } from 'src/features/expressions/types';
import { asExpression } from 'src/features/expressions/validation';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useExprContext } from 'src/utils/layout/ExprContext';
import { dataSourcesFromState } from 'src/utils/layout/hierarchy';
import type { ExprConfig, Expression } from 'src/features/expressions/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { LayoutPage } from 'src/utils/layout/LayoutPage';
export const ExpressionPlayground = () => {
  const [input, setInput] = React.useState('');
  const [output, setOutput] = React.useState('');
  const [forComponentId, setForComponentId] = React.useState<string | undefined>(undefined);
  const [isError, setIsError] = React.useState(false);
  const nodes = useExprContext();
  const dataSources = useAppSelector(dataSourcesFromState);

  useEffect(() => {
    if (input.length <= 0) {
      setOutput('');
      setIsError(false);
      return;
    }

    try {
      let maybeExpression: string;
      try {
        maybeExpression = JSON.parse(input);
      } catch (e) {
        if (e instanceof Error) {
          throw new Error(`Ugyldig JSON: ${e.message}`);
        } else {
          throw new Error('Ugyldig JSON');
        }
      }
      const config: ExprConfig<ExprVal.Any> = {
        returnType: ExprVal.Any,
        defaultValue: null,
        resolvePerRow: false,
        errorAsException: true,
      };

      const expr = asExpression(maybeExpression, config);
      if (!expr) {
        throw new Error('Ugyldig uttrykk');
      }

      let evalContext: LayoutPage | LayoutNode | undefined = nodes?.current();
      if (!evalContext) {
        throw new Error('Fant ikke nåværende side/layout');
      }

      if (forComponentId) {
        const [page, componentId] = forComponentId.split('|', 2);
        const foundNode = nodes?.findLayout(page)?.findById(componentId);
        if (foundNode) {
          evalContext = foundNode;
        }
      }

      const out = evalExpr(expr as Expression, evalContext, dataSources, { config });
      setOutput(out);
      setIsError(false);
    } catch (e) {
      setOutput(e.message);
      setIsError(true);
    }
  }, [input, forComponentId, dataSources, nodes]);

  return (
    <div className={classes.container}>
      <SplitView
        direction={'row'}
        sizes={[300]}
      >
        <SplitView direction='column'>
          <textarea
            className={cn(classes.textbox, classes.input)}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={'Skriv inn et dynamisk uttrykk...\nEksempel: ["equals", ["component", "firstName"], "Ola"]'}
          />
          <textarea
            style={{ color: isError ? 'red' : 'black' }}
            className={cn(classes.textbox, classes.output)}
            readOnly={true}
            value={output}
            placeholder={'Resultatet av uttrykket vises her'}
          />
        </SplitView>
        <div className={classes.rightColumn}>
          <FieldSet legend={'Kjør uttrykk i kontekst av komponent'}>
            <Select
              value={forComponentId}
              onChange={(value) => setForComponentId(value)}
              options={Object.values(nodes?.all() || [])
                .map((page) => page.flat(true))
                .flat()
                .map((n) => ({ label: n.item.id, value: `${n.top.top.myKey}|${n.item.id}` }))}
            />
          </FieldSet>
          <FieldSet legend={'Dokumentasjon'}>
            Les mer om uttrykk{' '}
            <a
              href={'https://docs.altinn.studio/nb/app/development/logic/expressions/'}
              target={'_blank'}
              rel='noreferrer'
            >
              i dokumentasjonen
            </a>
          </FieldSet>
        </div>
      </SplitView>
    </div>
  );
};
