import { CG } from 'src/codegen/CG';
import { ExprVal } from 'src/features/expressions/types';
import { NodeStatePlugin } from 'src/utils/layout/NodeStatePlugin';
import type { ComponentConfig } from 'src/codegen/ComponentConfig';
import type { CompTypes } from 'src/layout/layout';
import type { PluginExprResolver, PluginExtraInItem } from 'src/utils/layout/NodeStatePlugin';

interface Config<PropName extends string> {
  componentType: CompTypes;
  settings: {
    propName: PropName;
  };
  extraInItem: {
    [key in PropName]: boolean;
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
export class AlertOnChangePlugin<E extends ExternalConfig> extends NodeStatePlugin<ToInternal<E>> {
  constructor(protected settings: E) {
    super();
  }

  getKey(): string {
    return [this.constructor.name, this.settings.propName].join('/');
  }

  makeImport() {
    return new CG.import({
      import: 'AlertOnChangePlugin',
      from: 'src/features/alertOnChange/AlertOnChangePlugin',
    });
  }

  makeConstructorArgs(): string {
    return JSON.stringify(this.settings);
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

  evalDefaultExpressions(props: PluginExprResolver<ToInternal<E>>): PluginExtraInItem<ToInternal<E>> {
    return {
      [this.settings.propName]: props.evalBool(props.item[this.settings.propName], false),
    } as PluginExtraInItem<ToInternal<E>>;
  }
}
