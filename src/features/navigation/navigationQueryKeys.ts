export const navigatePageMutationKeys = {
  all: () => ['navigatePage'],
  exitSubform: () => [...navigatePageMutationKeys.all(), 'exitSubform'] as const,
  processNext: () => [...navigatePageMutationKeys.all(), 'processNext'] as const,
  maybeSaveOnPageChange: () => [...navigatePageMutationKeys.all(), 'maybeSaveOnPageChange'] as const,
};
