export type Component = { id: string; type: string } & Record<string, unknown>;
export type Layout = { $schema: string; data: { layout: Component[] } };

export type ConvertedComponent = Component & {
  children?: ConvertedComponent[];
};

function isComponent(component: unknown): component is Component {
  return (
    typeof component === 'object' &&
    component !== null &&
    'id' in component &&
    typeof (component as Component).id === 'string' &&
    'type' in component &&
    typeof (component as Component).type === 'string'
  );
}

function hasStringChildren(component: Component): component is Component & { children: string[] } {
  return (
    'children' in component &&
    Array.isArray(component.children) &&
    component.children.every((child) => typeof child === 'string')
  );
}

function hasComponentChildren(component: Component): component is Component & { children: Component[] } {
  return 'children' in component && Array.isArray(component.children) && component.children.every(isComponent);
}

function findChild(components: Component[], id: string): Component | undefined {
  for (const component of components) {
    if (component.id === id) {
      return component;
    }
  }

  return undefined;
}

/*
Constraints:
- The layout is an array of components
- Each component has an id and a type
- The layout can be nested
- If a component has children as ids, the actual component should be found in the root level of the layout
- If a component has children as components, they should be nested in the children property
*/
export function convertLayout(
  layout: Component[],
  rootLayout: Component[] = layout,
): { convertedLayout: ConvertedComponent[]; foundChildIds: string[] } {
  const foundChildIds: string[] = [];

  const convertedLayout = [...layout].map((component) => {
    let convertedComponent = { ...component };

    if (hasStringChildren(convertedComponent)) {
      const foundChildren = convertedComponent.children.map((childId) => findChild(rootLayout, childId)).filter(truthy);
      foundChildIds.push(...foundChildren.map((child) => child.id));

      convertedComponent = { ...convertedComponent, children: foundChildren };
    }

    // recursively convert the children
    if (hasComponentChildren(convertedComponent)) {
      const { convertedLayout: convertedChildLayout, foundChildIds: foundNestedChildIds } = convertLayout(
        convertedComponent.children,
        rootLayout,
      );
      convertedComponent = {
        ...convertedComponent,
        children: convertedChildLayout,
      };
      foundChildIds.push(...foundNestedChildIds);
    }

    return convertedComponent;
  });

  // remove the found children from the root layout
  return {
    convertedLayout: convertedLayout.filter((component) => !foundChildIds.includes(component.id)),
    foundChildIds,
  };
}

type Truthy<T> = T extends false | '' | 0 | null | undefined ? never : T; // from lodash

function truthy<T>(value: T): value is Truthy<T> {
  return !!value;
}
