import { skipToken, useQuery } from '@tanstack/react-query';

import { convertLayout } from 'src/POC/utils/convertLayout';
import { fetchLayoutSets, fetchLayoutSettings } from 'src/queries/queries';
import { httpGet } from 'src/utils/network/sharedNetworking';
import { getLayoutsUrl } from 'src/utils/urls/appUrlHelper';
import type { Component, ConvertedComponent } from 'src/POC/utils/convertLayout';

/*
LayoutSets
|-> LayoutSet
|   |-> Page
*/

export function useLayoutSets() {
  return useQuery({
    queryKey: ['layoutSets'],
    queryFn: fetchLayoutSets,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

function useLayoutSetId(taskId: string | undefined) {
  const { data: layoutSets } = useLayoutSets();

  return taskId && layoutSets?.sets.find((layoutSet) => layoutSet.tasks?.includes(taskId))?.id;
}

export function useLayoutSetSettings(taskId: string | undefined) {
  const layoutSetId = useLayoutSetId(taskId);

  return useQuery({
    queryKey: ['layoutSettings', layoutSetId],
    queryFn: layoutSetId ? () => fetchLayoutSettings(layoutSetId) : skipToken,
  });
}

export function useLayoutPage(taskId: string | undefined, pageId: string | undefined) {
  const layoutSetId = useLayoutSetId(taskId);

  return useQuery({
    queryKey: ['pageLayout', layoutSetId, pageId],
    queryFn: layoutSetId
      ? () => fetchAndConvertLayouts(layoutSetId).then((layouts) => (pageId ? layouts[pageId] : undefined))
      : skipToken,
  });
}

export function useLayoutSet(taskId: string | undefined) {
  const layoutSetId = useLayoutSetId(taskId);

  return useQuery({
    queryKey: ['layoutSet', layoutSetId],
    queryFn: layoutSetId ? () => fetchAndConvertLayouts(layoutSetId) : skipToken,
  });
}

async function fetchAndConvertLayouts(layoutSetId: string) {
  const layouts = await httpGet<Record<string, IncomingLayout>>(getLayoutsUrl(layoutSetId));

  const pages: Record<string, Layout> = {};

  Object.entries(layouts).forEach(([id, layout]) => {
    pages[id] = { ...layout, data: { ...layout.data, layout: convertLayout(layout.data.layout).convertedLayout } };
  });
  return pages;
}

type IncomingLayout = { $schema: string; data: { layout: Component[] } };
type Layout = { $schema: string; data: { layout: ConvertedComponent[] } };
