import type { NodeRef } from '..';

import { CG } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';
import { NodePathNotFound } from 'src/utils/layout/NodePathNotFound';
import { NodeDefPlugin } from 'src/utils/layout/plugins/NodeDefPlugin';
import type { ComponentConfig } from 'src/codegen/ComponentConfig';
import type { CardConfigExternal } from 'src/layout/Cards/config.generated';
import type { CompTypes } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type {
  DefPluginChildClaimerProps,
  DefPluginExprResolver,
  DefPluginState,
  DefPluginStateFactoryProps,
  NodeDefChildrenPlugin,
} from 'src/utils/layout/plugins/NodeDefPlugin';
import type { NodeData } from 'src/utils/layout/types';
import type { TraversalRestriction } from 'src/utils/layout/useNodeTraversal';

export interface CardInternal extends Omit<CardConfigExternal, 'children' | 'media'> {
  children?: NodeRef[];
  media?: NodeRef;
}

interface Config<Type extends CompTypes> {
  componentType: Type;
  expectedFromExternal: {
    cards: CardConfigExternal[];
  };
  extraState: {
    cardsItems: {
      [cardIndex: number]: {
        media?: NodeData;
        children: {
          [nodeId: string]: NodeData;
        };
      };
    };
  };
  extraInItem: {
    cardsInternal: CardInternal[];
  };
}

export class CardsPlugin<Type extends CompTypes>
  extends NodeDefPlugin<Config<Type>>
  implements NodeDefChildrenPlugin<Config<Type>>
{
  protected component: ComponentConfig | undefined;

  makeImport() {
    return new CG.import({
      import: 'CardsPlugin',
      from: 'src/layout/Cards/CardsPlugin',
    });
  }

  addToComponent(component: ComponentConfig): void {
    this.component = component;
    if (component.config.category !== CompCategory.Container) {
      throw new Error('CardsPlugin can only be used with container components');
    }
  }

  makeGenericArgs(): string {
    return `'${this.component!.type}'`;
  }

  claimChildren({ item, claimChild, getProto }: DefPluginChildClaimerProps<Config<Type>>): void {
    for (const card of item.cards || []) {
      if (card.media) {
        const proto = getProto(card.media);
        if (!proto) {
          continue;
        }
        if (!proto.capabilities.renderInCardsMedia) {
          window.logWarn(
            `Cards component included a component '${card.media}', which ` +
              `is a '${proto.type}' and cannot be rendered as Card media.`,
          );
          continue;
        }
        claimChild(card.media);
      }

      for (const child of card.children || []) {
        const proto = getProto(child);
        if (!proto) {
          continue;
        }
        if (!proto.capabilities.renderInCards) {
          window.logWarn(
            `Cards component included a component '${child}', which ` +
              `is a '${proto.type}' and cannot be rendered as a Card child.`,
          );
          continue;
        }
        claimChild(child);
      }
    }
  }

  stateFactory(_props: DefPluginStateFactoryProps<Config<Type>>): Config<Type>['extraState'] {
    return {
      cardsItems: {},
    };
  }

  extraNodeGeneratorChildren(): string {
    const GenerateNodeChildrenWhenReady = new CG.import({
      import: 'GenerateNodeChildrenWhenReady',
      from: 'src/utils/layout/generator/LayoutSetGenerator',
    });
    return `<${GenerateNodeChildrenWhenReady} childIds={props.childIds} />`;
  }

  evalDefaultExpressions({ item }: DefPluginExprResolver<Config<Type>>): Config<Type>['extraInItem'] {
    const cards: CardInternal[] = [];
    for (const externalCard of item.cards) {
      const { children, media, ...rest } = externalCard;
      cards.push({
        ...rest,
        media: media ? { nodeRef: media } : undefined,
        children:
          children?.map((child) => ({
            nodeRef: child,
          })) || [],
      });
    }

    return { cardsInternal: cards };
  }

  pickDirectChildren(state: DefPluginState<Config<Type>>, _restriction?: TraversalRestriction | undefined): NodeRef[] {
    const refs: NodeRef[] = [];
    for (const card of Object.values(state.cardsItems)) {
      if (card.media) {
        refs.push({
          nodeRef: card.media.layout.id,
        });
      }
      for (const child of Object.values(card.children)) {
        refs.push({
          nodeRef: child.layout.id,
        });
      }
    }

    return refs;
  }

  pickChild<C extends CompTypes>(
    state: DefPluginState<Config<Type>>,
    childId: string,
    parentPath: string[],
  ): NodeData<C> {
    for (const card of Object.values(state.cardsItems)) {
      if (card.media?.layout.id === childId) {
        return card.media as NodeData<C>;
      }
      if (card.children[childId]) {
        return card.children[childId] as NodeData<C>;
      }
    }

    throw new NodePathNotFound(`Child with id ${childId} not found in /${parentPath.join('/')}`);
  }

  addChild(state: DefPluginState<Config<Type>>, childNode: LayoutNode, childStore: NodeData): void {
    // First we need to find the child in the layout again to figure out which card it belongs to and if it's media
    let cardIndex: number | undefined;
    let isMedia: boolean | undefined;
    for (const [index, card] of state.layout.cards.entries()) {
      if (card.media === childNode.getBaseId()) {
        cardIndex = index;
        isMedia = true;
        break;
      }
      if (card.children?.find((child) => child === childNode.getBaseId())) {
        cardIndex = index;
        isMedia = false;
        break;
      }
    }

    if (cardIndex === undefined || isMedia === undefined) {
      throw new NodePathNotFound(`Child with id ${childNode.getId()} not found in layout`);
    }

    if (!state.cardsItems[cardIndex]) {
      state.cardsItems[cardIndex] = {
        media: undefined,
        children: {},
      };
    }

    if (isMedia) {
      state.cardsItems[cardIndex].media = childStore;
    } else {
      state.cardsItems[cardIndex].children[childNode.getId()] = childStore;
    }
  }

  removeChild(state: DefPluginState<Config<Type>>, childNode: LayoutNode): void {
    for (const card of Object.values(state.cardsItems)) {
      if (card.media?.layout.id === childNode.getId()) {
        card.media = undefined;
        return;
      }
      if (card.children[childNode.getId()]) {
        delete card.children[childNode.getId()];
        return;
      }
    }
  }
}
