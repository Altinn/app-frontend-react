import type { ILayoutFile } from 'src/layout/common.generated';

interface LayoutItem {
  id: string;
  type: string;
  children?: string[];
  // @ts-ignore
  [key: string]: any; // for all other properties
}

interface RootSchema {
  data: {
    layout: LayoutItem[];
    // @ts-ignore
    [key: string]: any;
  };
  // @ts-ignore
  [key: string]: any;
}

/**
 * Recursively transforms the layout so that if an item has a "children" array of IDs,
 * it replaces those IDs with the actual child objects (and removes them from the top-level).
 */
export function transformLayout(root: ILayoutFile): RootSchema {
  const layout = root.data.layout;

  // Build a map for quick lookup: { [id]: item }
  const itemMap: Record<string, LayoutItem> = {};
  for (const item of layout) {
    itemMap[item.id] = item;
  }

  // Determine which IDs are used as children
  const allChildIds = new Set<string>();
  for (const item of layout) {
    // @ts-ignore
    if (item.children) {
      // @ts-ignore
      for (const cId of item.children) {
        allChildIds.add(cId);
      }
    }
  }

  // Top-level items are those *not* in allChildIds
  const topLevelItems = layout.filter((item) => !allChildIds.has(item.id));

  /**
   * Recursively attach child objects to the parent's "children" array,
   * removing them from the top-level in the process.
   */
  function buildNode(node: LayoutItem): LayoutItem {
    if (!node.children) {
      return node;
    }
    const childObjects: LayoutItem[] = [];
    for (const childId of node.children) {
      const child = itemMap[childId];
      if (!child) {
        throw new Error(`No item found for child ID: ${childId}`);
      }
      childObjects.push(buildNode(child)); // recurse if child also has children
    }
    // Replace the array of IDs with the actual objects
    // @ts-ignore
    node.children = childObjects;
    return node;
  }

  // Build the new hierarchy from top-level items
  const transformedTopLevel = topLevelItems.map((item) => buildNode(item));

  // Replace the layout array with our new hierarchy
  // @ts-ignore
  root.data.layout = transformedTopLevel;
  return root;
}
