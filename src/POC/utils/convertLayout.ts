export type Component = { id: string; type: string } & Record<string, unknown>;
export type Layout = { $schema: string; data: { layout: Component[] } };

export type ConvertedComponent = Component & {
  children?: ConvertedComponent[];
};

// all keys that can contain children
const CHILD_KEYS = ['children', 'cards', 'tabs'];

function isComponent(component: unknown): component is Component {
  return (
    !!component &&
    typeof component === 'object' &&
    !Array.isArray(component) &&
    CHILD_KEYS.some((key) => key in component)
  );
}

function hasStringChildren<Key extends string>(
  component: Component,
  key: Key,
): component is Component & Record<Key, string[]> {
  return (
    key in component && Array.isArray(component[key]) && component[key].every((child) => typeof child === 'string')
  );
}

function hasComponentChildren<Key extends string>(
  component: Component,
  key: Key,
): component is Component & Record<Key, Component[]> {
  const result =
    key in component && Array.isArray(component[key]) && component[key].some((child) => isComponent(child));

  return result;
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
    let convertedComponent: ConvertedComponent = { ...component };

    for (const key of CHILD_KEYS) {
      if (hasStringChildren(component, key)) {
        const foundChildren = component[key].map((childId) => findChild(rootLayout, childId)).filter((it) => !!it);
        foundChildIds.push(...foundChildren.map((child) => child.id));

        convertedComponent = { ...convertedComponent, [key]: foundChildren };
      }
    }

    // recursively convert the children
    for (const key of CHILD_KEYS) {
      if (hasComponentChildren(convertedComponent, key)) {
        const { convertedLayout: convertedChildLayout, foundChildIds: foundNestedChildIds } = convertLayout(
          convertedComponent[key],
          rootLayout,
        );
        convertedComponent = {
          ...convertedComponent,
          [key]: convertedChildLayout,
        };
        foundChildIds.push(...foundNestedChildIds);
      }
    }

    return convertedComponent;
  });

  // remove the found children from the root layout
  return {
    convertedLayout: convertedLayout.filter((component) => !foundChildIds.includes(component.id)),
    foundChildIds,
  };
}
