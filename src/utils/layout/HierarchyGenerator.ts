import { getLayoutComponentObject } from 'src/layout';
import { LayoutNode } from 'src/utils/layout/LayoutNode';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import type { ExprUnresolved } from 'src/features/expressions/types';
import type { ComponentTypes, ILayout, ILayoutComponentExact } from 'src/layout/layout';
import type { IRepeatingGroups } from 'src/types';
import type { AnyItem, HierarchyDataSources, LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';

export type UnprocessedItem<T extends ComponentTypes = ComponentTypes> = ExprUnresolved<ILayoutComponentExact<T>>;

export interface Claim {
  childId: string;
  parentId: string;
}

export interface CommonChildFactoryProps {
  parent: LayoutNode | LayoutPage;
  rowIndex?: number;
}

export interface ChildFactoryProps<T extends ComponentTypes> extends CommonChildFactoryProps {
  item: UnprocessedItem<T> | AnyItem<T>;
}

export type ChildFactory<T extends ComponentTypes> = (props: ChildFactoryProps<T>) => LayoutNode;
export type ChildMutator = (item: UnprocessedItem | AnyItem) => void;
export type ProcessorResult<T extends ComponentTypes = ComponentTypes> = ChildFactory<T>;

export type HierarchyContext = {
  id: string;
  depth: number; // Starts at 1
  mutators: ChildMutator[];
};

export interface NewChildProps extends CommonChildFactoryProps {
  childId: string;
  directMutators?: ChildMutator[];
  recursiveMutators?: ChildMutator[];
  ctx: HierarchyContext;
}

/**
 * The hierarchy generator solves the complicated puzzle of converting the flat layout structure into a hierarchy/tree
 * of LayoutNode objects - entirely without knowing anything about the relations between components and how the
 * hierarchy is structured in practice. It does this by providing tools so that each LayoutComponent class can perform
 * its job of claiming other components as children.
 *
 * This might look convoluted, but what happens here is that we go through some defined stages to make this happen:
 *
 * Stage 0
 * =======
 * We start with a flat layout. Imagine these components:
 *
 *    Component      Children (only for groups)
 *    --------------------------------------------
 *    mainGroup      [mainChild1, mainChild2, subGroup]
 *    mainChild1
 *    mainChild2
 *    subGroup       [subChild1, subSubGroup]
 *    subChild1
 *    subSubGroup    [subSubChild1]
 *    subSubChild1
 *
 * Stage 1
 * =======
 * Now we tell every component class in it to claim which one of the other components they want as their
 * children. When stage 1 is over, we'll end up with a structure that could be represented like this:
 *
 *    Component      Claimed by              Claims
 *    ---------------------------------------------------------------------
 *    mainGroup      unclaimed               [mainChild1, mainChild2, subGroup]
 *    mainChild1     claimed by mainGroup    []
 *    mainChild2     claimed by mainGroup    []
 *    subGroup       claimed by mainGroup    [subChild1, subSubGroup]
 *    subChild1      claimed by subGroup     []
 *    subSubGroup    claimed by subGroup     [subSubChild1]
 *    subSubChild1   claimed by subSubGroup  []
 *
 *    What happened in stage 1 was:
 *      - Every component got the chance to claim one or more children.
 *      - We marked which ones got claimed as children, and which ones didn't.
 *      - No IDs or other component properties is altered at this stage (objects are frozen), and every component class
 *        gets to have their say in which of the other components they want as children before we continue.
 *
 * Stage 2
 * =======
 * Now we have enough information to proceed to stage 2, where we can simply iterate all the unclaimed
 * components (these are the top-level ones) and use their factory implementations to generate a tree.
 *
 *    mainGroup
 *      rows[0] = [
 *        mainChild1-0
 *        mainChild2-0
 *        subGroup-0
 *          rows[0] = [
 *            subChild1-0-0
 *            subSubGroup-0-0
 *              rows[0] = [
 *                subSubChild1-0-0-0
 *              ]
 *          ]
 *      ]
 *
 *    What happened in stage 2 was:
 *      - All top-level components have their factory functions called, turning them into LayoutNode objects
 *      - Every top-level component with children realized their claims by instantiating copies of their claimed
 *        children.
 *      - Every child node/instance potentially have their properties mutated by parent mutators
 *      - Mutators are inherited in the hierarchy, meaning a mutator for a child of mainGroup also runs on the
 *        deepest item, subSubChild1-0-0-0.
 *      - All recursive mutators run in the order they were added. This means that for a deep node,
 *        mainGroup will run its mutators first (adding the first '-0' suffix to the ID) before the next depth level
 *        adds its mutations.
 *
 */
export class HierarchyGenerator {
  private allIds: Set<string>;
  private map: { [id: string]: UnprocessedItem } = {};
  private instances: { [type: string]: ComponentHierarchyGenerator<any> } = {};
  private unclaimed: Set<string>;
  private claims: { [childId: string]: Set<string> } = {};

  constructor(
    private layout: ILayout,
    public readonly repeatingGroups: IRepeatingGroups,
    public readonly dataSources: HierarchyDataSources,
    public readonly top: LayoutPage,
  ) {
    this.allIds = new Set();
    this.unclaimed = new Set();
    for (const component of structuredClone(layout)) {
      this.allIds.add(component.id);
      this.unclaimed.add(component.id);
      this.map[component.id] = component;
    }
  }

  /**
   * Claim another component as a child
   */
  claimChild(claim: Required<Claim>): void {
    if (!this.allIds.has(claim.childId)) {
      console.warn(
        'Component',
        claim.parentId,
        'tried to claim',
        claim.childId,
        'as a child, but a component with that ID is not defined',
      );
      return;
    }

    this.claims[claim.childId] = this.claims[claim.childId] || new Set();
    const parents = this.claims[claim.childId];

    if (!parents.has(claim.parentId) && parents.size > 0) {
      /**
       * TODO: Remove this to support multiple components claiming the same children. This could be useful for groups
       * with panel references, or repeating groups where you'd want to have one group with a filter and another one
       * with another filter (and still share the same children). However, in order to support this we need to get rid
       * of our limiting component id suffix (such as `currentValue-1` for the second row, because the `currentValue`
       * component could be claimed by multiple parents that each might want to create multiple instances of it).
       * If we go down this route, we also have to make sure Studio and app-lib-dotnet supports such configuration.
       * We might also want to support relative data model bindings, in order to support components that can be added
       * to different repeating (or non-repeating) groups with different data model bindings (but with the same base
       * model in place).
       * @see https://altinndevops.slack.com/archives/CDU1S3NLW/p1679044199116669
       */
      console.warn(
        'Component',
        claim.parentId,
        'tried to claim',
        claim.childId,
        'as a child, but that child is already claimed by',
        parents.values(),
      );
      return;
    }

    parents.add(claim.parentId);
    this.unclaimed.delete(claim.childId);
  }

  /**
   * Utility for generating a new instance of a child (during stage 2), which must have
   * been claimed beforehand (in stage 1). Runs mutations and returns a LayoutNode.
   */
  newChild<T extends ComponentTypes>({
    ctx,
    childId,
    parent,
    rowIndex,
    directMutators = [],
    recursiveMutators = [],
  }: NewChildProps): LayoutNode {
    if (!this.map[childId]) {
      throw new Error(`Tried to create a new child object for non-existing child '${childId}'`);
    }
    if (!this.claims[childId]) {
      throw new Error(`Tried to create a new child object for unclaimed '${childId}'`);
    }

    const parentId = parent.item.baseComponentId || parent.item.id;
    if (!parentId || !this.claims[childId].has(parentId)) {
      throw new Error(`Tried to create a new child object for '${childId}' which is not claimed by '${parentId}'`);
    }

    const clone = structuredClone(this.map[childId]) as UnprocessedItem<T>;

    const allMutators = [...ctx.mutators, ...directMutators, ...recursiveMutators];
    for (const mutator of allMutators) {
      mutator(clone);
    }

    const instance = this.instances[clone.type];
    const factory: ProcessorResult = instance.stage2({
      id: childId,
      depth: ctx.depth + 1,
      mutators: [...ctx.mutators, ...recursiveMutators],
    });

    return factory({
      item: clone,
      parent,
      rowIndex,
    });
  }

  /**
   * Utility function to make it easier to create a LayoutNode object (used by processors in components)
   */
  makeNode<T extends ComponentTypes>({ item, parent, rowIndex }: ChildFactoryProps<T>): LayoutNodeFromType<T> {
    const node = new LayoutNode(item as AnyItem, parent || this.top, this.top, this.dataSources, rowIndex);
    this.top._addChild(node);

    return node as LayoutNodeFromType<T>;
  }

  /**
   * Gets the prototype of a given (base) component ID. This returns an un-editable object that is may be
   * useful when looking into the base definition/prototype of a component.
   */
  prototype(id: string): UnprocessedItem | undefined {
    return Object.freeze(structuredClone(this.map[id]));
  }

  /**
   * Runs the generator for this given layout, and return the top-level page
   */
  run(): LayoutPage {
    // Stage 1
    for (const item of this.layout) {
      const ro = Object.freeze(structuredClone(item));
      const def = getLayoutComponentObject(item.type);
      if (!def) {
        console.warn(`A component with id '${item.id}' was defined with an unknown component type '${item.type}'`);
        continue;
      }
      if (!this.instances[ro.type]) {
        this.instances[ro.type] = def.hierarchyGenerator(this);
      }
      const instance = this.instances[ro.type];
      instance.stage1(ro);
    }

    // Stage 2
    for (const id of this.unclaimed.values()) {
      const item = structuredClone(this.map[id]);
      if (!this.instances[item.type]) {
        continue;
      }
      const instance = this.instances[item.type];
      const ctx: HierarchyContext = {
        id,
        depth: 1,
        mutators: [],
      };
      const processor = instance.stage2(ctx);
      processor({ item: this.map[id], parent: this.top });
    }

    return this.top;
  }
}

/**
 * This class should be implemented in components that interacts with the hierarchy generation process. For simple
 * components that has no need to claim children or manipulate them, SimpleComponentHierarchyGenerator will
 * most likely suffice.
 */
export abstract class ComponentHierarchyGenerator<Type extends ComponentTypes> {
  constructor(protected generator: HierarchyGenerator) {}

  abstract stage1(item: UnprocessedItem<Type>): void;
  abstract stage2(ctx: HierarchyContext): ProcessorResult<Type>;
}

/**
 * Most simple components does not need to claim any children, so they can use this standard implementation
 */
export class SimpleComponentHierarchyGenerator<Type extends ComponentTypes> extends ComponentHierarchyGenerator<Type> {
  stage1() {
    return undefined;
  }

  stage2() {
    return (props) => this.generator.makeNode(props);
  }
}

export function generateHierarchy(
  layout: ILayout,
  repeatingGroups: IRepeatingGroups,
  dataSources: HierarchyDataSources,
): LayoutPage {
  return new HierarchyGenerator(layout, repeatingGroups, dataSources, new LayoutPage()).run();
}
