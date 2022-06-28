import { Panel } from "@altinn/altinn-design-system";
import { Grid, makeStyles } from "@material-ui/core";
import React from "react";
import { useAppSelector } from "src/common/hooks";
import { ConditionalWrapper } from "src/components/ConditionalWrapper";
import { makeGetHidden } from "src/selectors/getLayoutData";
import { getTextFromAppOrDefault } from "src/utils/textResource";
import { FullWidthWrapper } from "../components/FullWidthWrapper";
import type { ILayoutComponent, ILayoutGroup } from "../layout";
import { renderLayoutComponent } from "./Form";

const useStyles = makeStyles({
  groupContainer: {
    paddingBottom: 38,
  },
});

export interface IPanelGroupContainerProps {
  container: ILayoutGroup;
  components: (ILayoutComponent | ILayoutGroup)[];
}

function customIcon(iconUrl: string, iconAlt: string) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <img
        src={iconUrl}
        alt={iconAlt}
        data-testid="custom-icon"
      />
    </div>
  );
}

export function PanelGroupContainer({
  container,
  components,
}: IPanelGroupContainerProps) {
  const classes = useStyles();
  const GetHiddenSelector = makeGetHidden();
  const layout = useAppSelector(
    (state) => state.formLayout.layouts[state.formLayout.uiConfig.currentView]
  );
  const hidden = useAppSelector((state) =>
    GetHiddenSelector(state, { id: container.id })
  );
  const title = useAppSelector((state) =>
    getTextFromAppOrDefault(
      container.textResourceBindings?.title,
      state.textResources.resources,
      state.language.language,
      [],
      true
    )
  );
  const body = useAppSelector((state) =>
    getTextFromAppOrDefault(
      container.textResourceBindings?.body,
      state.textResources.resources,
      state.language.language,
      [],
      true
    )
  );
  const { iconUrl, iconAlt } = container.panel;
  const fullWidth = !container.baseComponentId;

  if (hidden) {
    return null;
  }

  return (
    <Grid item={true}>
      <ConditionalWrapper
        condition={fullWidth}
        wrapper={(child) => <FullWidthWrapper>{child}</FullWidthWrapper>}
      >
        <Panel
          title={title}
          renderIcon={iconUrl ? () => customIcon(iconUrl, iconAlt) : undefined}
        >
          <Grid
            container={true}
            item={true}
            className={classes.groupContainer}
            spacing={3}
            alignItems="flex-start"
            data-testid="panel-group-container"
          >
            <Grid
              item
              xs={12}
            >
              {body}
            </Grid>
            {components.map((component) => {
              return renderLayoutComponent(component, layout);
            })}
          </Grid>
        </Panel>
      </ConditionalWrapper>
    </Grid>
  );
}
