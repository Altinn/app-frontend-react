import { isNodeRef } from 'src/utils/layout/nodeRef';
import { splitDashedKey } from 'src/utils/splitDashedKey';
import type { NodeRef } from 'src/layout';
import type { CompInternal } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { LayoutObject } from 'src/utils/layout/LayoutObject';
import type { LayoutPages } from 'src/utils/layout/LayoutPages';

/**
 * The layout page is a class containing an entire page/form layout, with all components/nodes within it. It
 * allows for fast/indexed searching, i.e. looking up an exact node in constant time.
 */
export class LayoutPage implements LayoutObject {
  public item: Record<string, undefined> = {};
  public parent: this;
  public layoutSet: LayoutPages;
  public pageKey: string;

  private allChildren: Map<string, LayoutNode> = new Map();

  /**
   * Adds a child to the collection. For internal use only.
   */
  public _addChild(child: LayoutNode) {
    this.allChildren.set(child.getId(), child);
  }

  public _removeChild(child: LayoutNode) {
    this.allChildren.delete(child.getId());
  }

  public isSameAs(otherObject: LayoutObject | NodeRef): boolean {
    if (isNodeRef(otherObject)) {
      return false;
    }

    return otherObject instanceof LayoutPage && this.pageKey === otherObject.pageKey;
  }

  public isSame(): (otherObject: LayoutObject | NodeRef) => boolean {
    return (otherObject) => this.isSameAs(otherObject);
  }

  /**
   * Looks for a matching component upwards in the hierarchy, returning the first one (or undefined if
   * none can be found). Implemented here for parity with LayoutNode
   */
  public closest(matching: (item: CompInternal) => boolean, traversePages = true): LayoutNode | undefined {
    const out = this.children(matching);
    if (out) {
      return out;
    }

    if (traversePages && this.layoutSet) {
      const otherLayouts = this.layoutSet.flat(this.pageKey);
      for (const page of otherLayouts) {
        const found = page.closest(matching, false);
        if (found) {
          return found;
        }
      }
    }

    return undefined;
  }

  protected get directChildren(): LayoutNode[] {
    return [...this.allChildren.values()].filter((node) => node.parent === this);
  }

  /**
   * Returns a list of direct children, or finds the first node matching a given criteria. Implemented
   * here for parity with LayoutNode.
   */
  public children(): LayoutNode[];
  public children(matching: (item: CompInternal) => boolean): LayoutNode | undefined;
  public children(matching?: (item: CompInternal) => boolean): any {
    if (!matching) {
      return this.directChildren;
    }

    for (const node of this.directChildren) {
      if (matching(node.item)) {
        return node;
      }
    }

    return undefined;
  }

  /**
   * This returns all the child nodes (including duplicate components for repeating groups) as a flat list of
   * LayoutNode objects.
   */
  public flat(): LayoutNode[] {
    return [...this.allChildren.values()];
  }

  public findById(id: string, traversePages = true): LayoutNode | undefined {
    if (this.allChildren.has(id)) {
      return this.allChildren.get(id);
    }

    const baseId = splitDashedKey(id).baseComponentId;
    if (this.allChildren.has(baseId)) {
      return this.allChildren.get(baseId);
    }

    if (traversePages && this.layoutSet) {
      return this.layoutSet.findById(id, this.pageKey);
    }

    return undefined;
  }

  public findAllById(id: string, traversePages = true): LayoutNode[] {
    const baseId = splitDashedKey(id).baseComponentId;
    const out: LayoutNode[] = [];
    if (this.allChildren.has(id)) {
      out.push(this.allChildren.get(id) as LayoutNode);
    }
    if (this.allChildren.has(baseId)) {
      out.push(this.allChildren.get(baseId) as LayoutNode);
    }

    for (const key of this.allChildren.keys()) {
      if (key.startsWith(`${baseId}-`)) {
        out.push(this.allChildren.get(key) as LayoutNode);
      }
    }

    if (traversePages && this.layoutSet) {
      for (const item of this.layoutSet.findAllById(id, this.pageKey)) {
        out.push(item);
      }
    }

    return out;
  }

  public isRegisteredInCollection(layoutSet: LayoutPages): boolean {
    return this.pageKey !== undefined && layoutSet.isPageRegistered(this.pageKey, this);
  }

  public registerCollection(pageKey: string, layoutSet: LayoutPages) {
    this.pageKey = pageKey;
    this.layoutSet = layoutSet;
    layoutSet.replacePage(this);
  }

  public unregisterCollection() {
    if (this.pageKey !== undefined && this.layoutSet) {
      this.layoutSet.removePage(this.pageKey);
    }
  }
}
