import React from 'react';

import { Heading } from '@digdir/designsystemet-react';

import { Flex } from 'src/app-components/Flex/Flex';
import { Lang } from 'src/features/language/Lang';
import { ComponentSummaryById, SummaryFlexForContainer } from 'src/layout/Summary2/SummaryComponent2/ComponentSummary';
import { useSummaryProp } from 'src/layout/Summary2/summaryStoreContext';
import classes from 'src/layout/Tabs/TabsSummary.module.css';
import { useHasCapability } from 'src/utils/layout/canRenderIn';
import { useComponentIdMutator } from 'src/utils/layout/DataModelLocation';
import { useExternalItem } from 'src/utils/layout/hooks';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type TabsSummaryProps = {
  componentNode: LayoutNode<'Tabs'>;
};

export const TabsSummary = ({ componentNode }: TabsSummaryProps) => {
  const hideEmptyFields = useSummaryProp('hideEmptyFields');
  const idMutator = useComponentIdMutator();
  const { tabs } = useExternalItem(componentNode.baseId, 'Tabs');
  const canRender = useHasCapability('renderInTabs');

  if (!tabs || tabs.length === 0) {
    return null;
  }

  return (
    <SummaryFlexForContainer
      target={componentNode}
      hideWhen={hideEmptyFields}
    >
      <div
        className={classes.summaryContent}
        data-testid='summary-tabs-component'
      >
        {tabs.map((tab, index) => (
          <div key={index}>
            {index != 0 && (
              <hr
                key={`${tab.title}-${index}-divider`}
                className={classes.tabDivider}
              />
            )}
            <div
              key={`${tab.title}-${index}`}
              className={classes.tabWrapper}
            >
              <Heading
                data-size='xs'
                level={4}
              >
                <Lang id={tab.title} />
              </Heading>
              <Flex
                container
                spacing={6}
                alignItems='flex-start'
              >
                {tab.children.filter(canRender).map((baseId) => (
                  <ComponentSummaryById
                    key={baseId}
                    componentId={idMutator?.(baseId) ?? baseId}
                  />
                ))}
              </Flex>
            </div>
          </div>
        ))}
      </div>
    </SummaryFlexForContainer>
  );
};
