'use client'

import { createContext, ReactNode, useContext } from 'react'
import type { DocumentNode } from 'graphql'
import type { TypedDocumentNode } from '@graphql-typed-document-node/core'

/**
 * The result a search query adapter must return. Mirrors the common shape of
 * GraphQL client query hooks (Apollo, urql, etc.) so adapters are thin wrappers.
 */
export interface SearchQueryResult<TData = any> {
  data: TData | undefined
  loading: boolean
  refetch: (variables?: Record<string, unknown>) => Promise<{ data?: TData }>
}

/**
 * A React hook that executes a GraphQL document and returns its live result.
 * Implementations must follow the rules of hooks and be stable across renders
 * (define them at module level, not inline). The returned `data` must be
 * referentially stable between renders unless the result actually changed —
 * GraphQL clients guarantee this; hand-rolled adapters must too, or consuming
 * fields will re-render in a loop.
 */
export type UseSearchQuery = <TData = any>(
  document: DocumentNode | TypedDocumentNode<TData>,
  options?: { variables?: Record<string, unknown> },
) => SearchQueryResult<TData>

export const SearchQueryContext = createContext<UseSearchQuery | null>(null)

/**
 * Supplies the query hook that powers SearchSelectApollo / SearchSelectMultiApollo
 * fields. Use the ready-made Apollo adapter from '@nestledjs/forms/apollo' or
 * '@nestledjs/forms-native/apollo', or pass any hook matching UseSearchQuery to
 * back these fields with a different data layer.
 */
export function SearchQueryProvider({
  useSearchQuery,
  children,
}: Readonly<{ useSearchQuery: UseSearchQuery; children: ReactNode }>) {
  return <SearchQueryContext.Provider value={useSearchQuery}>{children}</SearchQueryContext.Provider>
}

/**
 * Internal accessor for the injected query hook. Throws a setup-guide error when
 * a search select field renders without an adapter.
 */
export function useSearchQueryAdapter(): UseSearchQuery {
  const useSearchQuery = useContext(SearchQueryContext)
  if (!useSearchQuery) {
    throw new Error(
      'No search query adapter found. SearchSelectApollo fields need one to fetch options: ' +
        "wrap your app in <ApolloSearchProvider> from '@nestledjs/forms/apollo' (web) or " +
        "'@nestledjs/forms-native/apollo' (React Native) — both require @apollo/client — " +
        "or supply your own hook via <SearchQueryProvider> from '@nestledjs/forms-core'.",
    )
  }
  return useSearchQuery
}
