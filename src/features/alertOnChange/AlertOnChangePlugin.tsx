import { CG } from 'src/codegen/CG';
import { ExprVal } from 'src/features/expressions/types';
import { NodeDefPlugin } from 'src/utils/layout/plugins/NodeDefPlugin';
import type { ComponentConfig } from 'src/codegen/ComponentConfig';
import type { ExprValToActualOrExpr } from 'src/features/expressions/types';
import type { CompTypes } from 'src/layout/layout';

interface Config<PropName extends string> {
  componentType: CompTypes;
  expectedFromExternal: {
    [key in PropName]: ExprValToActualOrExpr<ExprVal.Boolean>;
  };
  settings: {
    propName: PropName;
  };
}

interface ExternalConfig {
  propName: string;
  title: string;
  description: string;
}

type ToInternal<E extends ExternalConfig> = Config<E['propName']>;

/**
 * Add this to your component to configure support for a alertOnDelete/alertOnChange property
 */
export class AlertOnChangePlugin<E extends ExternalConfig> extends NodeDefPlugin<ToInternal<E>> {
  constructor(protected settings: E) {
    super();
  }

  getKey(): string {
    return ['AlertOnChangePlugin', this.settings.propName].join('/');
  }

  makeImport() {
    return new CG.import({
      import: 'AlertOnChangePlugin',
      from: 'src/features/alertOnChange/AlertOnChangePlugin',
    });
  }

  addToComponent(component: ComponentConfig): void {
    component.addProperty(
      new CG.prop(
        this.settings.propName,
        new CG.expr(ExprVal.Boolean)
          .optional({ default: false })
          .setTitle(this.settings.title)
          .setDescription(this.settings.description),
      ),
    );
  }
}
