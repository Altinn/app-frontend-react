import { Panel } from '@altinn/altinn-design-system';
import { Grid, makeStyles } from '@material-ui/core';
import React from 'react';
import { useAppSelector } from 'src/common/hooks';
import { makeGetHidden } from 'src/selectors/getLayoutData';
import { getTextFromAppOrDefault } from 'src/utils/textResource';
import { ILayoutComponent, ILayoutGroup } from '../layout';
import { renderLayoutComponent } from './Form';

const useStyles = makeStyles({
  groupContainer: {
    paddingBottom: 38,
  },
});

export interface IPanelGroupContainerProps {
  container: ILayoutGroup;
  components: (ILayoutComponent | ILayoutGroup)[];
}

export function PanelGroupContainer({ container, components }: IPanelGroupContainerProps) {
  const classes = useStyles();
  const GetHiddenSelector = makeGetHidden();
  const layout = useAppSelector(state => state.formLayout.layouts[state.formLayout.uiConfig.currentView]);
  const hidden = useAppSelector(state => GetHiddenSelector(state, { id: container.id }));
  const title = useAppSelector(state => getTextFromAppOrDefault(container.textResourceBindings?.title, state.textResources.resources, state.language.language, [], true));

  if (hidden) {
    return null;
  }

  return (
    <Grid
      container={true}
      item={true}
      className={classes.groupContainer}
      spacing={3}
      alignItems='flex-start'
      data-testid='panel-group-container'
    >
        <Panel title={title}>
          {components.map((component) => {
            return renderLayoutComponent(component, layout);
          })}
        </Panel >
    </Grid>
  );
}
