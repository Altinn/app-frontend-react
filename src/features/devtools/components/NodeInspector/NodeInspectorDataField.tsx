import React from 'react';

import cn from 'classnames';

import classes from 'src/features/devtools/components/NodeInspector/NodeInspector.module.css';
import { useNodeInspectorContext } from 'src/features/devtools/components/NodeInspector/NodeInspectorContext';
import { LayoutNode } from 'src/utils/layout/LayoutNode';

interface NodeInspectorDataFieldParams {
  property: string;
  value: unknown;
  expandObject?: boolean;
}

interface ValueProps extends React.PropsWithChildren {
  property: string;
  className: string;
  collapsible?: boolean;
}

function Value({ children, className, property, collapsible }: ValueProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const extraClasses = { [classes.collapsed]: collapsed, [classes.collapsible]: collapsible };

  return (
    <>
      <dt className={cn(className, extraClasses)}>
        {collapsible ? (
          // eslint-disable-next-line jsx-a11y/anchor-is-valid
          <a
            href={'#'}
            onClick={() => setCollapsed(!collapsed)}
          >
            {property}
          </a>
        ) : (
          property
        )}
      </dt>
      {collapsed ? <dd className={cn(extraClasses)} /> : <dd className={cn(className, extraClasses)}>{children}</dd>}
    </>
  );
}

function ExpandObject(props: { property: string; object: object }) {
  return (
    <Value
      property={props.property}
      className={classes.typeObject}
      collapsible={true}
    >
      <dl className={classes.propertyList}>
        {Object.keys(props.object).map((key) => (
          <NodeInspectorDataField
            key={key}
            property={key}
            value={props.object[key]}
            expandObject={true}
          />
        ))}
      </dl>
    </Value>
  );
}

function OtherNode(props: { property: string; node: LayoutNode }) {
  const context = useNodeInspectorContext();

  return (
    <Value
      property={props.property}
      className={classes.typeNode}
    >
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a
        href={'#'}
        role={'button'}
        onClick={() => context.selectNode(props.node.item.id)}
      >
        {props.node.item.id}
      </a>
    </Value>
  );
}

function ExpandArray(props: { property: string; elements: unknown[] }) {
  return (
    <Value
      property={props.property}
      className={classes.typeArray}
      collapsible={true}
    >
      <dl className={classes.propertyList}>
        {props.elements.map((element, index) => (
          <NodeInspectorDataField
            key={index}
            property={`[${index}]`}
            value={element}
            expandObject={true}
          />
        ))}
      </dl>
    </Value>
  );
}

export function NodeInspectorDataField({ property, value, expandObject }: NodeInspectorDataFieldParams) {
  if (value === null) {
    return (
      <Value
        property={property}
        className={classes.typeNull}
      >
        null
      </Value>
    );
  }

  if (typeof value === 'object' && Array.isArray(value) && expandObject) {
    return (
      <ExpandArray
        property={property}
        elements={value}
      />
    );
  }

  if (typeof value === 'object' && value instanceof LayoutNode) {
    return (
      <OtherNode
        property={property}
        node={value}
      />
    );
  }

  if (typeof value === 'object' && Object.keys(value).length === 0) {
    return null;
  }

  if (typeof value === 'object' && !Array.isArray(value) && expandObject) {
    return (
      <ExpandObject
        property={property}
        object={value}
      />
    );
  }

  if (typeof value === 'string' && value.length < 35) {
    return (
      <Value
        property={property}
        className={classes.typeString}
      >
        {value}
      </Value>
    );
  }

  if (typeof value === 'string') {
    return (
      <Value
        property={property}
        className={classes.typeLongString}
      >
        {value}
      </Value>
    );
  }

  if (typeof value === 'number') {
    return (
      <Value
        property={property}
        className={classes.typeNumber}
      >
        {value}
      </Value>
    );
  }

  if (typeof value === 'boolean') {
    return (
      <Value
        property={property}
        className={classes.typeBoolean}
      >
        {value ? 'true' : 'false'}
      </Value>
    );
  }

  return (
    <Value
      property={property}
      className={classes.typeUnknown}
    >
      [{typeof value}]
    </Value>
  );
}
