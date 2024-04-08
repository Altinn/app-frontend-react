import { CG } from 'src/codegen/CG';
import { NodeStatePlugin } from 'src/utils/layout/NodeStatePlugin';
import type { NodeStateChildrenPlugin } from 'src/utils/layout/NodeStatePlugin';

export class GridRowsPlugin extends NodeStatePlugin implements NodeStateChildrenPlugin {
  stateFactory(): string {
    return 'rowItems: [],';
  }

  evalDefaultExpressions(): string {
    const GridRowsInternal = new CG.import({
      import: 'GridRowsInternal',
      from: 'src/layout/Grid/types',
    });
    return `rows: props.item.rows as ${GridRowsInternal},`;
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
