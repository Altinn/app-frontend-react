import { CodeGeneratorContext } from 'src/codegen/CodeGeneratorContext';
import { GenerateExpressionOr } from 'src/codegen/dataTypes/GenerateExpressionOr';
import { GenerateObject } from 'src/codegen/dataTypes/GenerateObject';
import { GenerateUnion } from 'src/codegen/dataTypes/GenerateUnion';
import { CG } from 'src/codegen/index';
import { ExprVal } from 'src/features/expressions/types';
import { ComponentCategory } from 'src/layout/common';
import type { CodeGenerator } from 'src/codegen/CodeGenerator';
import type { GenerateImportedSymbol } from 'src/codegen/dataTypes/GenerateImportedSymbol';

export interface TextResourceConfig {
  name: string;
  title: string;
  description: string;
}

export class ComponentConfig {
  public type: string;
  private unresolved = new GenerateObject().export();
  private resolved = new GenerateObject().export();

  public addProperty(name: string, value: CodeGenerator): this {
    this.unresolved.addProperty(name, value);

    if (value instanceof GenerateExpressionOr) {
      this.resolved.addProperty(name, value.getTargetType());
    } else {
      this.resolved.addProperty(name, value);
    }

    return this;
  }

  constructor(public readonly category: ComponentCategory) {
    this.addProperty('id', CG.str());
    this.addProperty('hidden', CG.expr(ExprVal.Boolean).optional(CG.const(false)));
    this.addProperty('grid', CG.known('grid').optional());
    this.addProperty('pageBreak', CG.known('pageBreak').optional());

    if (category === ComponentCategory.Form) {
      this.addProperty('readOnly', CG.expr(ExprVal.Boolean).optional(CG.const(false)));
      this.addProperty('required', CG.expr(ExprVal.Boolean).optional(CG.const(false)));
      this.addProperty('triggers', CG.known('triggers').optional()); // TODO: Triggers for Group, navigation buttons

      this.addTextResourcesForSummarizableComponents();
      this.addTextResourcesForFormComponents();
    }
    if (category === ComponentCategory.Form || category === ComponentCategory.Container) {
      this.addProperty('renderAsSummary', CG.expr(ExprVal.Boolean).optional(CG.const(false)));
    }
  }

  public setType(type: string, symbol?: string): this {
    const symbolName = symbol ?? type;
    this.type = type;
    this.unresolved.addPropertyAfter('type', CG.const(type), 'id');
    this.resolved.addPropertyAfter('type', CG.const(type), 'id');
    this.unresolved.setName(`ILayoutComp${symbolName}`);
    this.resolved.setName(`${symbolName}Item`);

    return this;
  }

  public rendersWithLabel(): this {
    this.addProperty('labelSettings', CG.known('labelSettings').optional());
    return this;
  }

  public addTextResource(args: TextResourceConfig): this {
    const { name } = args;

    for (const targetObject of [this.unresolved, this.resolved]) {
      let bindings = targetObject.getProperty('textResourceBindings') as GenerateObject | undefined;
      if (!bindings) {
        bindings = CG.obj(true);
        targetObject.addProperty('textResourceBindings', bindings);
      }
      if (targetObject === this.unresolved) {
        bindings.addProperty(name, CG.expr(ExprVal.String).optional());
      } else {
        bindings.addProperty(name, CG.str().optional());
      }
    }

    return this;
  }

  public addTextResourcesForSummarizableComponents(): this {
    return this.addTextResource({
      name: 'summaryTitle',
      title: 'Summary title',
      description: 'Title used in the summary view (overrides the default title)',
    }).addTextResource({
      name: 'summaryAccessibleTitle',
      title: 'Accessible summary title',
      description:
        'Title used for aria-label on the edit button in the summary view (overrides the default and summary title)',
    });
  }

  public addTextResourcesForFormComponents(): this {
    return this.addTextResource({
      name: 'tableTitle',
      title: 'Table title',
      description: 'Title used in the table view (overrides the default title)',
    }).addTextResource({
      name: 'shortName',
      title: 'Short name (for validation)',
      description: 'Alternative name used for required validation messages (overrides the default title)',
    });
  }

  /**
   * TODO: Call this for components that have a label
   */
  public addTextResourcesForLabel(): this {
    return this.addTextResource({
      name: 'title',
      title: 'Title',
      description: 'Label text/title shown above the component',
    })
      .addTextResource({
        name: 'description',
        title: 'Description',
        description: 'Label description shown above the component, below the title',
      })
      .addTextResource({
        name: 'help',
        title: 'Help text',
        description: 'Help text shown in a tooltip when clicking the help button',
      });
  }

  /**
   * Adding multiple data model bindings to the component makes it a union
   * TODO: Support required and optional bindings
   */
  public addDataModelBinding(type: 'simple' | 'list' | GenerateImportedSymbol): this {
    const targetType = typeof type === 'string' ? CG.known(`dataModelBinding.${type}`) : type;

    const existing = this.unresolved.getProperty('dataModelBindings');
    if (existing && existing instanceof GenerateUnion) {
      existing.addType(targetType);
    } else if (existing) {
      const union = CG.union(existing, targetType);
      this.unresolved.addProperty('dataModelBindings', union);
    } else {
      this.unresolved.addProperty('dataModelBindings', targetType);
    }

    return this;
  }

  public toTypeScript(): string {
    CodeGeneratorContext.getInstance().reset();
    const elements = [this.unresolved.toTypeScript(), this.resolved.toTypeScript()];
    const imports = CodeGeneratorContext.getInstance().getImportsAsTypeScript();
    if (imports) {
      return `${imports}\n\n${elements.join('\n\n')}`;
    }

    return elements.join('\n\n');
  }
}
