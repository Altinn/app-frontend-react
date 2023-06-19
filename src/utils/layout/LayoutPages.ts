import type { $Values } from 'utility-types';

import {
  buildValidationObject,
  createValidationResult,
  getSchemaValidationErrors,
} from 'src/utils/validation/validationHelpers';
import type { IValidationResult } from 'src/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { LayoutPage } from 'src/utils/layout/LayoutPage';
import type { IValidationObject } from 'src/utils/validation/types';

/**
 * A tool when you have more than one LayoutPage (i.e. a full layout set). It can help you look up components
 * by ID, and if you have colliding component IDs in multiple layouts it will prefer the one in the current layout.
 */
export class LayoutPages<
  Collection extends { [layoutKey: string]: LayoutPage } = {
    [layoutKey: string]: LayoutPage;
  },
> {
  private readonly objects: Collection;

  public constructor(private currentView?: keyof Collection, objects?: Collection) {
    this.objects = objects || ({} as any);
    for (const layoutKey of Object.keys(this.objects)) {
      const layout = this.objects[layoutKey];
      layout.registerCollection(layoutKey, this);
    }
  }

  public findById(id: string, exceptInPage?: string): LayoutNode | undefined {
    const current = this.current();
    if (current && this.currentView !== exceptInPage) {
      const inCurrent = this.current()?.findById(id, false);
      if (inCurrent) {
        return inCurrent;
      }
    }

    for (const otherLayoutKey of Object.keys(this.objects)) {
      if (otherLayoutKey === this.currentView || otherLayoutKey === exceptInPage) {
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

  public current(): LayoutPage | undefined {
    if (!this.currentView) {
      return undefined;
    }

    const current = this.findLayout(this.currentView);
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
    return Object.values(this.objects).flatMap((layout) => layout.flat(true));
  }

  public flat<L extends keyof Collection>(exceptLayout?: L) {
    return [
      ...Object.keys(this.objects)
        .filter((key) => key !== exceptLayout)
        .map((key) => this.objects[key])
        .flat(),
    ] as $Values<Omit<Collection, L>>[];
  }

  public runEmptyFieldValidations(): IValidationObject[] {
    const validations: IValidationObject[] = [];
    for (const layoutKey of Object.keys(this.objects)) {
      validations.push(...this.objects[layoutKey].runEmptyFieldValidations());
    }
    return validations;
  }
  public runComponentValidations(): IValidationObject[] {
    const validations: IValidationObject[] = [];
    for (const layoutKey of Object.keys(this.objects)) {
      validations.push(...this.objects[layoutKey].runComponentValidations());
    }
    return validations;
  }
  public runSchemaValidations(): IValidationObject[] {
    const visibleNodes = this.allNodes().filter((node) => !node.isHidden());
    const schemaErrors = getSchemaValidationErrors();
    const validationObjects: IValidationObject[] = [];
    for (const error of schemaErrors) {
      for (const node of visibleNodes) {
        if (node.item.dataModelBindings) {
          const bindings = Object.entries(node.item.dataModelBindings);
          for (const [bindingKey, bindingField] of bindings) {
            if (bindingField === error.bindingField) {
              validationObjects.push(
                buildValidationObject(node, 'errors', error.message, bindingKey, error.invalidDataType),
              );
            }
          }
        }
      }
    }

    return validationObjects;
  }

  public runValidations(): IValidationObject[] {
    const validations: IValidationObject[] = [];
    for (const layoutKey of Object.keys(this.objects)) {
      validations.push(...this.objects[layoutKey].runEmptyFieldValidations());
      validations.push(...this.objects[layoutKey].runComponentValidations());
    }
    validations.push(...this.runSchemaValidations());
    return validations;
  }

  public validateForm(): IValidationResult {
    const validations = this.runValidations();
    return createValidationResult(validations);
  }
}
