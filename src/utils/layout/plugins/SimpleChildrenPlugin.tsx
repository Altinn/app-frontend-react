import { CG } from 'src/codegen/CG';
import { NodeStatePlugin } from 'src/utils/layout/NodeStatePlugin';
import type { NodeStateChildrenPlugin } from 'src/utils/layout/NodeStatePlugin';

export class SimpleChildrenPlugin extends NodeStatePlugin implements NodeStateChildrenPlugin {
  stateFactory(): string {
    return 'childItems: [],';
  }

  evalDefaultExpressions(): string {
    const NodeRef = new CG.import({
      import: 'NodeRef',
      from: 'src/layout',
    });
    return [
      // It is important that we clear out the 'children' property, so that the property cannot be used to access
      // the claimed children - we want to force the use of the 'childComponents' property instead.
      'children: undefined,',
      `childComponents: [] as ${NodeRef}[],`,
    ].join('\n');
  }

  pickDirectChildren(): string {
    return '// TODO: Implement\nreturn [];';
  }

  pickChild(): string {
    return '// TODO: Implement\nreturn undefined as any;';
  }

  addChild(): string {
    return '// TODO: Implement';
  }

  removeChild(): string {
    return '// TODO: Implement';
  }
}
