import type { $Values } from 'utility-types';

import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { LayoutPage } from 'src/utils/layout/LayoutPage';

interface Collection {
  [layoutKey: string]: LayoutPage;
}

/**
 * A tool when you have more than one LayoutPage (i.e. a full layout set). It can help you look up components
 * by ID, and if you have colliding component IDs in multiple layouts it will prefer the one in the current layout.
 */
export class LayoutPages {
  private _currentPage: string | undefined;
  private readonly objects: Collection = {};

  public constructor() {
    for (const layoutKey of Object.keys(this.objects)) {
      const layout = this.objects[layoutKey];
      layout.registerCollection(layoutKey, this);
    }
  }

  public isReady(): boolean {
    // TODO: Do something smarter, such as listening for ready events from all pages/nodes
    return Object.keys(this.objects).length > 0;
  }

  public setCurrentPage(currentView: string | undefined) {
    this._currentPage = undefined;
    if (currentView && this.objects[currentView]) {
      this._currentPage = currentView;
    }
  }

  public findById(id: string | undefined, exceptInPage?: string): LayoutNode | undefined {
    if (!id) {
      return undefined;
    }

    const current = this.currentPage();
    if (current && this._currentPage !== exceptInPage) {
      const inCurrent = this.currentPage()?.findById(id, false);
      if (inCurrent) {
        return inCurrent;
      }
    }

    for (const otherLayoutKey of Object.keys(this.objects)) {
      if (otherLayoutKey === this._currentPage || otherLayoutKey === exceptInPage) {
        continue;
      }
      const inOther = this.objects[otherLayoutKey].findById(id, false);
      if (inOther) {
        return inOther;
      }
    }

    return undefined;
  }

  public findAllById(id: string, exceptInPage?: string): LayoutNode[] {
    const out: LayoutNode[] = [];

    for (const key of Object.keys(this.objects)) {
      if (key !== exceptInPage) {
        out.push(...this.objects[key].findAllById(id, false));
      }
    }

    return out;
  }

  public findLayout(key: keyof Collection | string | undefined): LayoutPage | undefined {
    if (!key) {
      return undefined;
    }
    return this.objects[key];
  }

  public currentPage(): LayoutPage | undefined {
    if (!this._currentPage) {
      return undefined;
    }
    const current = this.findLayout(this._currentPage);
    if (current) {
      return current;
    }

    const layouts = Object.keys(this.objects);
    if (layouts.length) {
      return this.objects[layouts[0]];
    }

    return undefined;
  }

  public all(): Collection {
    return this.objects;
  }

  public allNodes(): LayoutNode[] {
    return Object.values(this.objects).flatMap((layout) => layout.flat());
  }

  public allPageKeys(): string[] {
    return Object.keys(this.objects);
  }

  public flat<L extends keyof Collection>(exceptLayout?: L) {
    return [
      ...Object.keys(this.objects)
        .filter((key) => key !== exceptLayout)
        .map((key) => this.objects[key])
        .flat(),
    ] as $Values<Omit<Collection, L>>[];
  }

  public replacePage(param: LayoutPage) {
    this.objects[param.pageKey as keyof Collection] = param as any;
  }
}
