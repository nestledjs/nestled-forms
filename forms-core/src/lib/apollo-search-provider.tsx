'use client'

import { ReactNode } from 'react'
import { useQuery } from '@apollo/client/react'
import { SearchQueryContext, SearchQueryResult, UseSearchQuery } from './search-query-context'

/**
 * Search query adapter backed by Apollo Client's useQuery. Works with
 * @apollo/client v3 and v4 — both expose useQuery from '@apollo/client/react'
 * with a compatible (document, { variables }) => { data, loading, refetch } surface.
 */
export const useApolloSearchQuery: UseSearchQuery = <TData,>(
  document: Parameters<UseSearchQuery>[0],
  options?: Parameters<UseSearchQuery>[1],
): SearchQueryResult<TData> => {
  const { data, loading, refetch } = useQuery(document as any, { variables: options?.variables } as any)
  return {
    data: data as TData | undefined,
    loading,
    refetch: refetch as SearchQueryResult<TData>['refetch'],
  }
}

/**
 * Enables SearchSelectApollo / SearchSelectMultiApollo fields by connecting them
 * to the Apollo Client found in React context. Place it inside your <ApolloProvider>.
 *
 * @example
 * ```tsx
 * <ApolloProvider client={client}>
 *   <ApolloSearchProvider>
 *     <App />
 *   </ApolloSearchProvider>
 * </ApolloProvider>
 * ```
 */
export function ApolloSearchProvider({ children }: Readonly<{ children: ReactNode }>) {
  return <SearchQueryContext.Provider value={useApolloSearchQuery}>{children}</SearchQueryContext.Provider>
}
