/**
 * Layout utilities for component hierarchy building
 */

export interface ComponentWithChildren {
  id: string;
  children?: ComponentWithChildren[];
  [key: string]: any;
}

export interface LayoutFileInput {
  $schema?: string;
  data: {
    layout: any[];
    hidden?: any;
    expandedWidth?: boolean;
  };
}

export interface LayoutFileOutput {
  $schema?: string;
  data: {
    layout: ComponentWithChildren[];
    hidden?: any;
    expandedWidth?: boolean;
  };
}

/**
 * Recursively transforms the layout so that if an item has a "children" array of IDs,
 * it replaces those IDs with the actual child objects (and removes them from the top-level).
 */
export function moveChildren(input: LayoutFileInput): LayoutFileOutput {
  const allItems = input.data?.layout ?? [];
  const itemMap = new Map<string, any>(allItems.map((item) => [item.id, item]));

  function resolveItem(id: string, visited = new Set<string>()): ComponentWithChildren {
    const item = itemMap.get(id);
    if (!item) {
      throw new Error(`No item found with id: ${id}`);
    }
    if (visited.has(id)) {
      throw new Error(`Circular reference detected for id: ${id}`);
    }
    visited.add(id);

    const { children, ...rest } = item;
    const resolved: ComponentWithChildren = {
      ...rest,
    };

    if (Array.isArray(children)) {
      resolved.children = children.map((childId: string) => resolveItem(childId, new Set(visited)));
    }

    return resolved;
  }

  // Identify all child IDs
  const childIds = new Set<string>();
  for (const item of allItems) {
    if (item.children && Array.isArray(item.children)) {
      for (const childId of item.children) {
        childIds.add(childId);
      }
    }
  }

  // Root items are those not listed as someone else's child
  const rootItems = allItems.filter((item) => !childIds.has(item.id));
  const resolvedLayout = rootItems.map((root) => resolveItem(root.id, new Set()));

  return {
    $schema: input.$schema,
    data: {
      layout: resolvedLayout,
      hidden: input.data.hidden,
      expandedWidth: input.data.expandedWidth,
    },
  };
}

/**
 * Build a flat component map from hierarchical layout
 */
export function buildComponentMap(layouts: Record<string, LayoutFileOutput>): Record<string, ComponentWithChildren> {
  const map: Record<string, ComponentWithChildren> = {};

  function traverse(components: ComponentWithChildren[] | undefined) {
    if (!Array.isArray(components)) {
      return;
    }

    for (const comp of components) {
      if (comp.id) {
        map[comp.id] = comp;
      }

      if (Array.isArray(comp.children)) {
        traverse(comp.children);
      }
    }
  }

  // For each page in the layout, traverse its layout array
  for (const pageId of Object.keys(layouts)) {
    const layout = layouts[pageId]?.data?.layout;
    traverse(layout);
  }

  return map;
}

/**
 * Flatten hierarchical components into array
 */
export function flattenComponents(components: ComponentWithChildren[]): ComponentWithChildren[] {
  const result: ComponentWithChildren[] = [];

  function traverse(comps: ComponentWithChildren[]) {
    for (const comp of comps) {
      result.push(comp);
      if (comp.children && Array.isArray(comp.children)) {
        traverse(comp.children);
      }
    }
  }

  traverse(components);
  return result;
}

/**
 * Find component in hierarchy by ID
 */
export function findComponentById(
  components: ComponentWithChildren[],
  id: string,
): ComponentWithChildren | undefined {
  for (const comp of components) {
    if (comp.id === id) {
      return comp;
    }
    
    if (comp.children && Array.isArray(comp.children)) {
      const found = findComponentById(comp.children, id);
      if (found) {
        return found;
      }
    }
  }
  
  return undefined;
}

/**
 * Get all component IDs from hierarchy
 */
export function getAllComponentIds(components: ComponentWithChildren[]): string[] {
  const ids: string[] = [];

  function traverse(comps: ComponentWithChildren[]) {
    for (const comp of comps) {
      if (comp.id) {
        ids.push(comp.id);
      }
      if (comp.children && Array.isArray(comp.children)) {
        traverse(comp.children);
      }
    }
  }

  traverse(components);
  return ids;
}

/**
 * Filter visible components based on expression evaluation
 */
export function filterVisibleComponents(
  components: ComponentWithChildren[],
  evaluateVisibility: (component: ComponentWithChildren) => boolean,
): ComponentWithChildren[] {
  const result: ComponentWithChildren[] = [];

  for (const comp of components) {
    // Check if this component is visible
    const isVisible = evaluateVisibility(comp);
    
    if (isVisible) {
      // Create a copy of the component
      const visibleComp: ComponentWithChildren = { ...comp };
      
      // Recursively filter children if they exist
      if (comp.children && Array.isArray(comp.children)) {
        visibleComp.children = filterVisibleComponents(comp.children, evaluateVisibility);
      }
      
      result.push(visibleComp);
    }
  }

  return result;
}