import React from 'react';

import { SingleInputSummary } from 'src/components/summary/SingleInputSummary';
import { SummaryBoilerplate } from 'src/components/summary/SummaryBoilerplate';
import { SummaryGroupComponent } from 'src/components/summary/SummaryGroupComponent';
import { MultipleChoiceSummary } from 'src/layout/Checkboxes/MultipleChoiceSummary';
import { AttachmentSummaryComponent } from 'src/layout/FileUpload/AttachmentSummaryComponent';
import { AttachmentWithTagSummaryComponent } from 'src/layout/FileUploadWithTag/AttachmentWithTagSummaryComponent';
import { MapComponentSummary } from 'src/layout/Map/MapComponentSummary';
import type { LayoutNode } from 'src/utils/layout/hierarchy';
import type { HComponent, HGroups } from 'src/utils/layout/hierarchy.types';

export interface ISummaryComponentSwitch {
  change: {
    onChangeClick: () => void;
    changeText: string | null;
  };
  summaryNode: LayoutNode<HComponent<'Summary'>>;
  targetNode: LayoutNode;
  label?: JSX.Element | JSX.Element[] | null | undefined;
}

export function SummaryComponentSwitch({ change, summaryNode, targetNode, label }: ISummaryComponentSwitch) {
  if (targetNode.item.type === 'Group') {
    const correctNode = targetNode as LayoutNode<HGroups>;
    return (
      <SummaryGroupComponent
        {...change}
        summaryNode={summaryNode}
        targetNode={correctNode}
      />
    );
  }

  return (
    <>
      <SummaryBoilerplate
        {...change}
        label={label}
        summaryNode={summaryNode}
        targetNode={targetNode}
      />
      <InnerSwitch targetNode={targetNode} />
    </>
  );
}

function InnerSwitch({ targetNode }: { targetNode: LayoutNode }) {
  const hasDataBindings = Object.keys(targetNode.item.dataModelBindings || {}).length === 0;

  if (hasDataBindings && targetNode.item.type === 'FileUpload') {
    const correctNode = targetNode as LayoutNode<HComponent<'FileUpload'>>;
    return <AttachmentSummaryComponent targetNode={correctNode} />;
  }

  if (hasDataBindings && targetNode.item.type === 'FileUploadWithTag') {
    const correctNode = targetNode as LayoutNode<HComponent<'FileUploadWithTag'>>;
    return <AttachmentWithTagSummaryComponent targetNode={correctNode} />;
  }

  if (targetNode.item.type === 'Checkboxes') {
    const correctNode = targetNode as LayoutNode<HComponent<'Checkboxes'>>;
    return <MultipleChoiceSummary targetNode={correctNode} />;
  }

  if (targetNode.item.type === 'Map') {
    const correctNode = targetNode as LayoutNode<HComponent<'Map'>>;
    return <MapComponentSummary targetNode={correctNode} />;
  }

  return <SingleInputSummary targetNode={targetNode} />;
}
