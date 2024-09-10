import React from 'react';

import { Heading } from '@digdir/designsystemet-react';
import { Grid } from '@material-ui/core';

import { Lang } from 'src/features/language/Lang';
import { ComponentSummary } from 'src/layout/Summary2/SummaryComponent2/ComponentSummary';
import classes from 'src/layout/Tabs/TabsSummary.module.css';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import { typedBoolean } from 'src/utils/typing';
import type { BaseLayoutNode } from 'src/utils/layout/LayoutNode';

export const TabsSummary = ({
  componentNode,
  isCompact,
  emptyFieldText,
}: {
  componentNode: BaseLayoutNode<'Tabs'>;
  isCompact?: boolean;
  emptyFieldText?: string;
}) => {
  const tabs = useNodeItem(componentNode, (i) => i.tabsInternal);

  return (
    <div
      className={classes.summaryContent}
      data-testid={'summary-tabs-component'}
    >
      {tabs.map((tab, index) => (
        <>
          <div
            key={tab.id}
            className={classes.tabWrapper}
          >
            <Heading
              size='sm'
              level={4}
            >
              {<Lang id={tab.title} />}
            </Heading>
            <Grid
              container={true}
              spacing={6}
              alignItems='flex-start'
            >
              {tab.children.filter(typedBoolean).map((node) => (
                <ComponentSummary
                  key={node.id}
                  componentNode={node}
                />
              ))}
            </Grid>
          </div>
          {index < tabs.length - 1 && <hr className={classes.tabDivider} />}
        </>
      ))}
    </div>
  );
};
