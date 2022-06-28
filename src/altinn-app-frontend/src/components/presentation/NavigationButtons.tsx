import * as React from "react";
import { AltinnButton } from "altinn-shared/components";
import { Grid, makeStyles } from "@material-ui/core";
import { Triggers } from "src/types";
import classNames from "classnames";
import { getTextFromAppOrDefault } from "src/utils/textResource";
import { FormLayoutActions } from "src/features/form/layout/formLayoutSlice";
import { useAppDispatch, useAppSelector } from "src/common/hooks";
import type { IComponentProps } from "..";
import { UpdateViewActions } from "src/features/form/layout/formLayoutTypes";

const useStyles = makeStyles({
  backButton: {
    marginRight: "1.2em",
  },
});

export interface INavigationButtons extends IComponentProps {
  showBackButton: boolean;
}

export function NavigationButtons(props: INavigationButtons) {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [disableBack, setDisableBack] = React.useState<boolean>(false);
  const [disableNext, setDisableNext] = React.useState<boolean>(false);
  const currentView = useAppSelector(
    (state) => state.formLayout.uiConfig.currentView
  );
  const orderedLayoutKeys = useAppSelector(
    (state) => state.formLayout.uiConfig.layoutOrder
  );
  const returnToView = useAppSelector(
    (state) => state.formLayout.uiConfig.returnToView
  );
  const textResources = useAppSelector(
    (state) => state.textResources.resources
  );
  const language = useAppSelector((state) => state.language.language);
  const pageTriggers = useAppSelector(
    (state) => state.formLayout.uiConfig.pageTriggers
  );
  const triggers = props.triggers || pageTriggers;
  const nextTextKey = returnToView
    ? "form_filler.back_to_summary"
    : props.textResourceBindings?.next || "next";
  const backTextKey = props.textResourceBindings?.back || "back";

  React.useEffect(() => {
    const currentViewIndex = orderedLayoutKeys?.indexOf(currentView);
    setDisableBack(!!returnToView || currentViewIndex === 0);
    setDisableNext(
      !returnToView && currentViewIndex === orderedLayoutKeys.length - 1
    );
  }, [currentView, orderedLayoutKeys, returnToView]);

  const onClickPrevious = () => {
    dispatch(
      FormLayoutActions.updateCurrentView({
        newView: UpdateViewActions.Previous,
      })
    );
  };

  const OnClickNext = () => {
    const runPageValidations =
      !returnToView && triggers?.includes(Triggers.ValidatePage);
    const runAllValidations =
      returnToView || triggers?.includes(Triggers.ValidateAllPages);
    const runValidations =
      (runAllValidations && "allPages") ||
      (runPageValidations && "page") ||
      null;
    if (triggers?.includes(Triggers.CalculatePageOrder)) {
      dispatch(
        FormLayoutActions.calculatePageOrderAndMoveToNextPage({
          runValidations,
        })
      );
    } else {
      const goToView = returnToView || UpdateViewActions.Next;
      dispatch(
        FormLayoutActions.updateCurrentView({
          newView: goToView,
          runValidations,
        })
      );
    }
  };

  return (
    <Grid
      container={true}
      justifyContent="space-between"
    >
      <Grid
        item={true}
        xs={12}
      >
        {!disableBack && props.showBackButton && (
          <AltinnButton
            btnText={getTextFromAppOrDefault(
              backTextKey,
              textResources,
              language,
              null,
              true
            )}
            onClickFunction={onClickPrevious}
            disabled={disableBack}
            className={classNames(classes.backButton)}
          />
        )}
        {!disableNext && (
          <AltinnButton
            btnText={getTextFromAppOrDefault(
              nextTextKey,
              textResources,
              language,
              null,
              true
            )}
            onClickFunction={OnClickNext}
            disabled={disableNext}
          />
        )}
      </Grid>
    </Grid>
  );
}
