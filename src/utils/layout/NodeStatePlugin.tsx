/**
 * A node state plugin work when generating code for a component. Adding such a plugin to your component
 * will extend the functionality of the component storage. The output of these functions will be added to the
 * generated code for the component.
 */
export abstract class NodeStatePlugin {
  abstract stateFactory(): string;
  abstract evalDefaultExpressions(): string;
}

/**
 * Implement this interface if your component needs to support children in some form.
 */
export interface NodeStateChildrenPlugin {
  pickDirectChildren(): string;
  pickChild(): string;
  addChild(): string;
  removeChild(): string;
}

export function implementsNodeStateChildrenPlugin(plugin: any): plugin is NodeStateChildrenPlugin {
  return (
    typeof plugin.pickDirectChildren === 'function' &&
    typeof plugin.pickChild === 'function' &&
    typeof plugin.addChild === 'function' &&
    typeof plugin.removeChild === 'function'
  );
}
