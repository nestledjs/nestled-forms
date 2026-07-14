import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Form } from '../form'
import { FormFieldClass, SearchSelectOption, useLoadOptions } from '@nestledjs/forms-core'

const db: SearchSelectOption[] = [
  { value: '1', label: 'Ada' },
  { value: '2', label: 'Grace' },
  { value: '3', label: 'Annie' },
]

describe('useLoadOptions', () => {
  it('fetches with an empty search on mount and exposes results', async () => {
    const load = vi.fn(async (search: string) => db.filter((o) => o.label.toLowerCase().includes(search)))
    const { result } = renderHook(() => useLoadOptions(load, []))

    await waitFor(() => expect(result.current.options).toHaveLength(3))
    expect(load).toHaveBeenCalledWith('')
    expect(result.current.loading).toBe(false)
  })

  it('refetches on search and updates options', async () => {
    const load = vi.fn(async (search: string) => db.filter((o) => o.label.toLowerCase().includes(search)))
    const { result } = renderHook(() => useLoadOptions(load, []))
    await waitFor(() => expect(result.current.options).toHaveLength(3))

    act(() => result.current.handleSearchChange('grace'))
    await waitFor(() => expect(result.current.options).toEqual([{ value: '2', label: 'Grace' }]))
  })

  it('ignores stale responses that resolve after a newer request', async () => {
    const resolvers: Array<(v: SearchSelectOption[]) => void> = []
    const load = vi.fn(() => new Promise<SearchSelectOption[]>((resolve) => resolvers.push(resolve)))
    const { result } = renderHook(() => useLoadOptions(load, []))

    await waitFor(() => expect(load).toHaveBeenCalledTimes(1))
    act(() => result.current.handleSearchChange('a')) // request 2
    act(() => result.current.handleSearchChange('ab')) // request 3
    await waitFor(() => expect(resolvers).toHaveLength(3))

    // Newest resolves first, then the stale ones try to overwrite
    act(() => resolvers[2]([{ value: 'new', label: 'Newest' }]))
    await waitFor(() => expect(result.current.options).toEqual([{ value: 'new', label: 'Newest' }]))
    act(() => resolvers[1]([{ value: 'stale', label: 'Stale' }]))
    act(() => resolvers[0]([{ value: 'staler', label: 'Staler' }]))

    expect(result.current.options).toEqual([{ value: 'new', label: 'Newest' }])
  })
})

describe('searchSelect with loadOptions', () => {
  it('loads async options into the dropdown', async () => {
    const load = vi.fn(async (search: string) => db.filter((o) => o.label.toLowerCase().includes(search)))
    render(
      <Form
        id="async"
        submit={vi.fn()}
        fields={[FormFieldClass.searchSelect('person', { label: 'Person', options: [], loadOptions: load })]}
      />,
    )

    await waitFor(() => expect(load).toHaveBeenCalledWith(''))
    const input = screen.getByLabelText('Person')
    fireEvent.focus(input)
    fireEvent.click(input)

    await waitFor(() => expect(screen.getByText('Ada')).toBeInTheDocument())
  })
})
