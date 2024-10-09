import { CG } from 'src/codegen/CG';
import { NodeDefPlugin } from 'src/utils/layout/plugins/NodeDefPlugin';
import type { ComponentConfig } from 'src/codegen/ComponentConfig';
import type { ComponentValidation, ValidationsProcessedLast } from 'src/features/validation/index';
import type { CompCategory } from 'src/layout/common';
import type { TypesFromCategory } from 'src/layout/layout';
import type { NodesContext } from 'src/utils/layout/NodesContext';
import type {
  DefPluginExtraState,
  DefPluginState,
  DefPluginStateFactoryProps,
} from 'src/utils/layout/plugins/NodeDefPlugin';

interface Config {
  componentType: TypesFromCategory<CompCategory.Form | CompCategory.Container>;
  extraState: {
    validations: ComponentValidation[];
    validationVisibility: number;
    validationsProcessedLast: ValidationsProcessedLast;
  };
}

/**
 * Adds validation support to a form or container component. This is added to your component by default
 * when one of these categories are selected.
 */
export class ValidationPlugin extends NodeDefPlugin<Config> {
  protected component: ComponentConfig | undefined;

  makeImport() {
    return new CG.import({
      import: 'ValidationPlugin',
      from: 'src/features/validation/ValidationPlugin',
    });
  }

  addToComponent(component: ComponentConfig) {
    this.component = component;
    if (!component.isFormLike()) {
      throw new Error('ValidationPlugin can only be used with container or form components');
    }
  }

  stateFactory(_props: DefPluginStateFactoryProps<Config>): DefPluginExtraState<Config> {
    return {
      validations: [],
      validationVisibility: 0,
      validationsProcessedLast: { initial: undefined, incremental: undefined },
    };
  }

  extraNodeGeneratorChildren(): string {
    const StoreValidationsInNode = new CG.import({
      import: 'StoreValidationsInNode',
      from: 'src/features/validation/StoreValidationsInNode',
    });

    return `<${StoreValidationsInNode} />`;
  }

  stateIsReady(state: DefPluginState<Config>, fullState: NodesContext): boolean {
    return (
      state.validationsProcessedLast.initial === fullState.validationsProcessedLast.initial &&
      state.validationsProcessedLast.incremental === fullState.validationsProcessedLast.incremental
    );
  }
}
