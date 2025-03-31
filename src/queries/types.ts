import type * as queries from 'src/queries/queries';

type IgnoredQueries = keyof Pick<
  typeof queries,
  | 'fetchApplicationMetadata'
  | 'fetchExternalApi'
  | 'fetchProcessState'
  | 'fetchAllParties'
  | 'fetchPartiesAllowedToInstantiate'
>;

type KeysStartingWith<T, U extends string> = {
  [K in keyof T as K extends `${U}${string}` ? K : never]: T[K];
};
export type AppQueriesContext = Omit<typeof queries, IgnoredQueries>;

export type AppQueries = Omit<KeysStartingWith<AppQueriesContext, 'fetch'>, IgnoredQueries>;
export type AppMutations = KeysStartingWith<AppQueriesContext, 'do'>;
