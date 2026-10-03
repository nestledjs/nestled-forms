import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { parse } from 'graphql'
import { ReactNode, useContext } from 'react'
import {
  SearchQueryContext,
  SearchQueryProvider,
  useSearchSelect,
  UseSearchQuery,
  SearchSelectApolloOptions,
} from '@nestledjs/forms-core'
import { ApolloSearchProvider, useApolloSearchQuery } from '@nestledjs/forms-core/apollo'

const USERS_QUERY = parse('query Users($input: SearchInput) { users(input: $input) { id name } }')

const allUsers = [
  { id: '1', name: 'Ada Lovelace' },
  { id: '2', name: 'Grace Hopper' },
  { id: '3', name: 'Annie Easley' },
]

const refetchSpy = vi.fn(async (variables?: Record<string, unknown>) => {
  const search = String((variables?.input as { search?: string })?.search ?? '').toLowerCase()
  return { data: { users: allUsers.filter((u) => u.name.toLowerCase().includes(search)) } }
})

// Module-level so its identity is stable across renders, as the contract requires.
// The result's `data` must also be referentially stable between renders (as real
// GraphQL clients guarantee) — a fresh object each render would loop the consumer.
const stableResult = {
  data: { users: allUsers } as any,
  loading: false,
  refetch: refetchSpy as any,
}
const fakeUseSearchQuery: UseSearchQuery = () => stableResult

function wrapper({ children }: Readonly<{ children: ReactNode }>) {
  return <SearchQueryProvider useSearchQuery={fakeUseSearchQuery}>{children}</SearchQueryProvider>
}

const fieldOptions: SearchSelectApolloOptions<{ id: string; name?: string }> = {
  label: 'User',
  document: USERS_QUERY,
  dataType: 'users',
}

describe('useSearchSelect', () => {
  it('maps adapter data to options', async () => {
    const { result } = renderHook(() => useSearchSelect(fieldOptions), { wrapper })

    await waitFor(() => {
      expect(result.current.options).toEqual([
        { value: '1', label: 'Ada Lovelace' },
        { value: '2', label: 'Grace Hopper' },
        { value: '3', label: 'Annie Easley' },
      ])
    })
    expect(result.current.loading).toBe(false)
  })

  it('refetches through the adapter on search and updates options', async () => {
    const { result } = renderHook(() => useSearchSelect(fieldOptions), { wrapper })
    await waitFor(() => expect(result.current.options).toHaveLength(3))

    result.current.handleSearchChange('grace')

    expect(refetchSpy).toHaveBeenCalledWith({ input: { search: 'grace' } })
    await waitFor(() => {
      expect(result.current.options).toEqual([{ value: '2', label: 'Grace Hopper' }])
    })
  })

  it('puts initialOptions first and dedupes against fetched results', async () => {
    // Field options are deliberately inline (fresh object every render):
    // the hook must bail out of the update cycle instead of render-looping.
    const { result } = renderHook(
      () =>
        useSearchSelect({
          ...fieldOptions,
          initialOptions: [
            { value: '99', label: 'Preselected Person' },
            { value: '1', label: 'Ada Lovelace' },
          ],
        }),
      { wrapper },
    )

    await waitFor(() => {
      expect(result.current.options.map((o) => o.value)).toEqual(['99', '1', '2', '3'])
    })
  })

  it('throws a setup-guide error when no adapter is provided', () => {
    // Silence React's error boundary noise for the expected throw
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    try {
      expect(() => renderHook(() => useSearchSelect(fieldOptions))).toThrow(/No search query adapter found/)
    } finally {
      consoleError.mockRestore()
    }
  })
})

describe('ApolloSearchProvider', () => {
  it('injects the Apollo-backed query hook into the shared context', () => {
    const { result } = renderHook(() => useContext(SearchQueryContext), {
      wrapper: ({ children }: Readonly<{ children: ReactNode }>) => (
        <ApolloSearchProvider>{children}</ApolloSearchProvider>
      ),
    })
    expect(result.current).toBe(useApolloSearchQuery)
  })
})
