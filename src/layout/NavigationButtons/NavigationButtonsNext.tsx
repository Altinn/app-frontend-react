import React from 'react';
import { useParams } from 'react-router-dom';

import { Flex } from 'src/app-components/Flex/Flex';
import classes from 'src/layout/NavigationButtons/NavigationButtonsComponent.module.css';
import { ButtonLink } from 'src/next/components/navbar/ButtonLink';
import type { CommonProps } from 'src/layout/Input';
import type { CompIntermediateExact } from 'src/layout/layout';
import type { PageParams } from 'src/next/pages/Page';

interface NavigationButtonsNextType {
  component: CompIntermediateExact<'NavigationButtons'>;
  commonProps: CommonProps;
}

function getPreviousPageKey(order: string[], currentPageId: string | undefined) {
  if (currentPageId === undefined) {
    return undefined;
  }
  const currentPageIndex = order.indexOf(currentPageId);
  const previousPageIndex = currentPageIndex !== -1 ? currentPageIndex - 1 : undefined;
  if (previousPageIndex === undefined || previousPageIndex < 0) {
    return undefined;
  }

  return order[previousPageIndex];
}

function getNextPageKey(order: string[], currentPageId: string | undefined) {
  if (currentPageId === undefined) {
    return undefined;
  }
  const currentPageIndex = order.indexOf(currentPageId);
  const nextPageIndex = currentPageIndex !== -1 ? currentPageIndex + 1 : undefined;
  if (nextPageIndex === undefined || nextPageIndex >= order.length) {
    return undefined;
  }

  return order[nextPageIndex];
}

export const NavigationButtonsNext: React.FunctionComponent<NavigationButtonsNextType> = ({
  component,
  commonProps,
}) => {
  const { pageId } = useParams<PageParams>() as Required<PageParams>;

  // const navigate = useNavigate();

  if (!pageId) {
    return null;
  }

  if (!commonProps.pageOrder?.length) {
    return null;
  }

  const nextPageKey = getNextPageKey(commonProps.pageOrder, pageId);
  const previousPageKey = getPreviousPageKey(commonProps.pageOrder, pageId);

  return (
    <div className={classes.container}>
      <Flex item>
        {previousPageKey && (
          <ButtonLink
            to={`../${previousPageKey}`}
            isCurrent={false}
          >
            {component.textResourceBindings?.back}{' '}
          </ButtonLink>
        )}

        {nextPageKey && (
          <ButtonLink
            to={`../${nextPageKey}`}
            isCurrent={false}
          >
            {component.textResourceBindings?.next}{' '}
          </ButtonLink>
        )}
      </Flex>
    </div>
  );
};
