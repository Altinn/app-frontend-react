import type { CompCategory } from 'src/layout/common';

export enum LabelRendering {
  /** Turns off label rendering */
  Off = 'off',

  /** Turns off label rendering (sets no text resource bindings for you), but enables labelSettings */
  OnlySettings = 'onlySettings',

  /** Renders the label automatically outside the component (from GenericComponent.tsx) */
  FromGenericComponent = 'fromGenericComponent',

  /** Lets you render the label yourself, inside the component code */
  InSelf = 'inSelf',
}

export interface RequiredComponentConfig {
  category: CompCategory;
  rendersWithLabel: LabelRendering;
  directRendering?: boolean;
  capabilities: ComponentCapabilities;
}

/**
 * Capabilities are configured directly when setting up a component config. You have to fill out each of the
 * properties in the object.
 * @see CompWithCap
 * @see getComponentCapabilities
 */
export interface ComponentCapabilities {
  renderInTable: boolean;
  renderInButtonGroup: boolean;
  renderInAccordion: boolean;
  renderInAccordionGroup: boolean;
}

/**
 * Behaviors are more implicit, and are derived from the component config. I.e. when making a component summarizable,
 * the behavior is set to true.
 * @see CompWithBehavior
 * @see getComponentBehavior
 */
export interface ComponentBehaviors {
  isSummarizable: boolean;
  canHaveLabel: boolean;
  canHaveOptions: boolean;
}
