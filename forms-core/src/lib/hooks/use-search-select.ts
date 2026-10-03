'use client'

import { useCallback, useEffect, useState } from 'react'
import { SearchSelectApolloOptions, SearchSelectOption } from '../form-types'
import { useSearchQueryAdapter } from '../search-query-context'

type RequiredItemShape = { id: string; name?: string; firstName?: string; lastName?: string }

function sameOptions(a: SearchSelectOption[], b: SearchSelectOption[]): boolean {
  return a.length === b.length && a.every((opt, i) => opt.value === b[i].value && opt.label === b[i].label)
}

/**
 * Maps raw data items to select options using `name`, falling back to
 * `firstName lastName`. Override per field with `selectOptionsFunction`.
 */
export function defaultOptionsMap<TDataItem extends RequiredItemShape>(
  items: TDataItem[],
): SearchSelectOption[] {
  return items.map((option) => ({
    value: `${option.id}`,
    label: option.name ?? `${option.firstName} ${option.lastName}`,
  }))
}

/**
 * Drives SearchSelectApollo / SearchSelectMultiApollo fields: runs the field's
 * GraphQL document through the injected search query adapter, merges initial
 * options with fetched results, and refetches on search input.
 *
 * Platform-agnostic — the web and React Native field components share this hook.
 */
export function useSearchSelect<TDataItem extends RequiredItemShape>(
  fieldOptions: SearchSelectApolloOptions<TDataItem>,
) {
  const useSearchQuery = useSearchQueryAdapter()
  const { data, loading, refetch } = useSearchQuery<Record<string, TDataItem[]>>(fieldOptions.document)
  const [options, setOptions] = useState<SearchSelectOption[]>(fieldOptions.initialOptions || [])

  // Destructure specific properties for more precise dependency tracking
  const { filter, selectOptionsFunction, dataType, searchFields, initialOptions } = fieldOptions

  const processData = useCallback(
    (dataList: TDataItem[]) => {
      let processedList = dataList
      if (filter) {
        processedList = filter(processedList)
      }

      const fetchedOptions = selectOptionsFunction
        ? selectOptionsFunction(processedList)
        : defaultOptionsMap(processedList)

      // Merge initial options with fetched results, avoiding duplicates
      if (initialOptions && initialOptions.length > 0) {
        const fetchedValues = new Set(fetchedOptions.map((opt) => opt.value))
        const uniqueInitialOptions = initialOptions.filter((opt) => !fetchedValues.has(opt.value))

        // Put initial options first, then fetched options
        return [...uniqueInitialOptions, ...fetchedOptions]
      }

      return fetchedOptions
    },
    [filter, selectOptionsFunction, initialOptions],
  )

  useEffect(() => {
    if (!loading && data) {
      // Keep the previous reference when nothing changed, so unstable adapter
      // results or inline field options can't cascade into a render loop
      setOptions((prev) => {
        const next = processData(data[dataType] ?? [])
        return sameOptions(prev, next) ? prev : next
      })
    }
  }, [loading, data, dataType, processData])

  const handleSearchChange = useCallback(
    (searchTerm: string) => {
      // An empty term refetches with an empty search to restore the full result set
      const input: { search: string; searchFields?: string[] } = { search: searchTerm }
      if (searchFields && searchFields.length > 0) {
        input.searchFields = searchFields
      }
      refetch({ input }).then((res) => {
        setOptions(processData(res.data?.[dataType] ?? []))
      })
    },
    [refetch, searchFields, dataType, processData],
  )

  return {
    options,
    loading,
    handleSearchChange,
  }
}
