import React from 'react';
import { Link } from 'react-router-dom';
import type { LinkProps } from 'react-router-dom';

import { SearchParams } from 'src/hooks/useNavigatePage';
import { useResolvedNode } from 'src/utils/layout/NodesContext';

type Props = LinkProps & { children?: React.ReactNode };

/**
 * This component is used to navigate to a potential node. If the node it is supposed
 * to navigate to does not exist or the node is hidden, the link will render as pure
 * text instead of a link.
 * @param props
 * @constructor
 */
export const LinkToPotentialNode = (props: Props) => {
  const [_url, queryParams] = props.to.toString().split('?') ?? [];

  const url = new URLSearchParams(queryParams);
  const componentId = url.get(SearchParams.FocusComponentId);
  const resolvedNode = useResolvedNode(componentId);

  const nodeExists = resolvedNode != null;
  const isNodeHidden = resolvedNode?.isHidden();
  const shouldShowLink = nodeExists && !isNodeHidden;

  if (shouldShowLink) {
    return (
      <Link
        {...props}
        replace={!nodeExists}
      ></Link>
    );
  }

  if (!nodeExists) {
    window.logWarnOnce(
      `linkToComponent points to a component that does not exist. The link is therefore rendered as pure text. Component ID you tried to link to: ${componentId}`,
    );
  } else if (isNodeHidden) {
    window.logWarnOnce(
      `linkToComponent points to a component that is hidden. The link is therefore rendered as pure text. Component ID you tried to link to: ${componentId}`,
    );
  }

  return <>{props.children}</>;
};
