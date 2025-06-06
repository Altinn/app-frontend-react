import { CG } from 'src/codegen/CG';
import { NodeDefPlugin } from 'src/utils/layout/plugins/NodeDefPlugin';
import type { ComponentConfig } from 'src/codegen/ComponentConfig';
import type { IDataModelBindingsLikert } from 'src/layout/common.generated';
import type {
  DefPluginChildClaimerProps,
  DefPluginState,
  NodeDefChildrenPlugin,
} from 'src/utils/layout/plugins/NodeDefPlugin';

interface Config {
  componentType: 'Likert';
  expectedFromExternal: {
    dataModelBindings: IDataModelBindingsLikert;
  };
}

export class LikertRowsPlugin extends NodeDefPlugin<Config> implements NodeDefChildrenPlugin<Config> {
  public settings = {
    internalProp: 'rows',
  };

  makeImport() {
    return new CG.import({
      import: 'LikertRowsPlugin',
      from: 'src/layout/Likert/Generator/LikertRowsPlugin',
    });
  }

  getKey(): string {
    return 'LikertRowsPlugin';
  }

  addToComponent(_component: ComponentConfig): void {}

  makeConstructorArgs(_asGenericArgs = false): string {
    return '';
  }

  extraNodeGeneratorChildren(): string {
    const LikertGeneratorChildren = new CG.import({
      import: 'LikertGeneratorChildren',
      from: 'src/layout/Likert/Generator/LikertGeneratorChildren',
    });
    return `<${LikertGeneratorChildren} />`;
  }

  claimChildren(_props: DefPluginChildClaimerProps<Config>) {}

  pickDirectChildren(_state: DefPluginState<Config>, _restriction?: number | undefined): string[] {
    throw new Error('Method not implemented yet. We need to figure out a new way to do this.');
    // if (restriction !== undefined) {
    //   const nodeId = state.item?.rows[restriction]?.itemNodeId;
    //   return nodeId ? [nodeId] : [];
    // }
    //
    // return state.item?.rows.map((row) => row?.itemNodeId).filter(typedBoolean) ?? [];
  }

  isChildHidden(_state: DefPluginState<Config>, _childId: string): boolean {
    return false;
  }
}
