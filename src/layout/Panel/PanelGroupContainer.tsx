import React, { useState } from 'react';

import { Panel } from '@altinn/altinn-design-system';
import { Grid } from '@material-ui/core';

import { useAppDispatch } from 'src/common/hooks/useAppDispatch';
import { useAppSelector } from 'src/common/hooks/useAppSelector';
import { ConditionalWrapper } from 'src/components/ConditionalWrapper';
import { EditIconButton } from 'src/components/EditIconButton';
import { SuccessIconButton } from 'src/components/SuccessIconButton';
import { FullWidthGroupWrapper } from 'src/features/form/components/FullWidthGroupWrapper';
import { FullWidthWrapper } from 'src/features/form/components/FullWidthWrapper';
import { getVariant } from 'src/features/form/components/Panel';
import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import { getLanguageFromKey } from 'src/language/sharedLanguage';
import { makeGetHidden } from 'src/selectors/getLayoutData';
import { getTextResource } from 'src/utils/formComponentUtils';
import { useResolvedNode } from 'src/utils/layout/ExprContext';

export interface IPanelGroupContainerProps {
  id: string;
}

interface ICustomIconProps {
  iconUrl: string;
  iconAlt: string | undefined;
  size?: string;
}

function CustomIcon({ iconUrl, iconAlt, size }: ICustomIconProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <img
        src={iconUrl}
        alt={iconAlt}
        data-testid='custom-icon'
        style={{
          width: size,
          height: size,
        }}
      />
    </div>
  );
}

export function PanelGroupContainer({ id }: IPanelGroupContainerProps) {
  const dispatch = useAppDispatch();
  const GetHiddenSelector = makeGetHidden();
  const node = useResolvedNode(id);
  const container = node?.item.type === 'Group' && node.item.panel ? node.item : undefined;
  const [open, setOpen] = useState<boolean>(!container?.panel?.groupReference);
  const language = useAppSelector((state) => state.language.language);
  // const textResources = useAppSelector((state) => state.textResources.resources);
  // const hiddenFields = useAppSelector((state) => state.formLayout.uiConfig.hiddenFields);
  const hidden = useAppSelector((state) => GetHiddenSelector(state, { id }));
  const textResourceBindings = node?.item.textResourceBindings;

  const title = useAppSelector(
    (state) =>
      textResourceBindings?.title && getTextResource(textResourceBindings.title, state.textResources.resources),
  );
  const body = useAppSelector(
    (state) => textResourceBindings?.body && getTextResource(textResourceBindings.body, state.textResources.resources),
  );
  const addLabel = useAppSelector(
    (state) =>
      textResourceBindings?.add_label && getTextResource(textResourceBindings.add_label, state.textResources.resources),
  );
  // const repeatingGroups = useAppSelector((state) => state.formLayout.uiConfig.repeatingGroups) || {};
  const { iconUrl, iconAlt } = container?.panel || {};
  const fullWidth = !container?.baseComponentId;
  const repGroupReference = container?.panel?.groupReference;
  const referencedGroupNode = repGroupReference ? node?.top.findById(repGroupReference.group) : undefined;
  // const referencedGroupIndex = referencedGroupNode ? repeatingGroups[referencedGroupNode.item.id].index : -1;

  const handleSave = () => {
    setOpen(false);
    if (referencedGroupNode) {
      dispatch(
        FormLayoutActions.updateRepeatingGroups({
          layoutElementId: referencedGroupNode.item.id,
        }),
      );
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  if (hidden || !language || !container || !node) {
    return null;
  }

  return (
    <Grid item={true}>
      <ConditionalWrapper
        condition={fullWidth}
        wrapper={(child) => <FullWidthWrapper>{child}</FullWidthWrapper>}
      >
        <ConditionalWrapper
          condition={!fullWidth && open}
          wrapper={(child) => <FullWidthGroupWrapper>{child}</FullWidthGroupWrapper>}
        >
          <>
            {referencedGroupNode && !open && (
              <Grid item>
                <EditIconButton
                  id={`add-reference-button-${container.id}`}
                  label={addLabel}
                  onClick={handleOpen}
                />
              </Grid>
            )}
            {open && (
              <Panel
                title={title}
                renderIcon={
                  iconUrl
                    ? ({ size }) => (
                        <CustomIcon
                          iconUrl={iconUrl}
                          iconAlt={iconAlt}
                          size={size}
                        />
                      )
                    : undefined
                }
                showIcon={container.panel?.showIcon}
                variant={getVariant({ variant: container.panel?.variant })}
                showPointer={!!repGroupReference}
              >
                <Grid
                  container={true}
                  item={true}
                  spacing={3}
                  alignItems='flex-start'
                  data-testid='panel-group-container'
                >
                  <Grid
                    item
                    xs={12}
                  >
                    {body}
                  </Grid>

                  {/*{referencedGroupNode &&*/}
                  {/*  // PRIORITY: Implement support for simulating a new row*/}
                  {/*  // PRIORITY: Add test case for filling out a new row in panel, not saving it, and midway through*/}
                  {/*  // adding a new row to the references group. This would show you the not-yet-completed data,*/}
                  {/*  // breaking the illusion. We should fix this by either:*/}
                  {/*  // 1. Keeping the row data in limbo until we save (why do we suddenly have a real save button?*/}
                  {/*  //    we don't have that anywhere else?)*/}
                  {/*  // 2. Actually add a real row to the group when you start filling out stuff.*/}
                  {/*  createRepeatingGroupComponentsForIndex({*/}
                  {/*    container: referencedGroup,*/}
                  {/*    renderComponents:*/}
                  {/*      components || referencedGroup.children.map((id) => getLayoutComponentById(id, layouts)),*/}
                  {/*    textResources,*/}
                  {/*    index: referencedGroupIndex + 1,*/}
                  {/*    hiddenFields,*/}
                  {/*  }).map((component) => {*/}
                  {/*    return renderLayoutComponent(component, layout);*/}
                  {/*  })}*/}

                  {/*{!referencedGroupNode &&*/}
                  {/*  components.map((component) => {*/}
                  {/*    return renderLayoutComponent(component, layout);*/}
                  {/*  })}*/}

                  {referencedGroupNode && (
                    <Grid item>
                      <SuccessIconButton
                        id={`save-reference-button-${container.id}`}
                        label={getLanguageFromKey('general.save', language)}
                        onClick={handleSave}
                      />
                    </Grid>
                  )}
                </Grid>
              </Panel>
            )}
          </>
        </ConditionalWrapper>
      </ConditionalWrapper>
    </Grid>
  );
}
