import { CG } from 'src/codegen/CG';
import { NodeDefPlugin } from 'src/utils/layout/plugins/NodeDefPlugin';
import type { IAttachment } from 'src/features/attachments/index';
import type { CompTypes } from 'src/layout/layout';
import type { DefPluginStateFactoryProps } from 'src/utils/layout/plugins/NodeDefPlugin';

interface Config {
  componentType: CompTypes;
  extraState: {
    attachments: IAttachment[];
  };
}

export class AttachmentsPlugin extends NodeDefPlugin<Config> {
  addToComponent(): void {}

  makeImport() {
    return new CG.import({
      import: 'AttachmentsPlugin',
      from: 'src/features/attachments/AttachmentsPlugin',
    });
  }

  stateFactory(_props: DefPluginStateFactoryProps<Config>): Config['extraState'] {
    return {
      attachments: [],
    };
  }

  extraNodeGeneratorChildren() {
    // TODO: Implement a handler
    return '';
  }
}
