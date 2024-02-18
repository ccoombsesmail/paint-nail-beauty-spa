"use client"

import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';


export default function Search({ disabled, setSearch }: { disabled?: boolean, setSearch?: (s: string) => void }) {

  function handleSearch(term: string) {
    const params = new URLSearchParams(window.location.search);
    if (term) {
      // @ts-ignore
      setSearch(term)
    } else {
      // @ts-ignore
      setSearch(term)
    }

  }

  return (
    <div className="relative mt-5 max-w-md">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <div className="rounded-md shadow-sm">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
          aria-hidden="true"
        >
          <MagnifyingGlassIcon
            className="mr-3 h-4 w-4 text-gray-400"
            aria-hidden="true"
          />
        </div>
        <input
          type="text"
          name="filter"
          id="filter-search"
          disabled={disabled}
          className="h-10 block w-full rounded-md border border-gray-200 pl-9 sm:text-sm"
          placeholder="Search by name, email, phone number..."
          autoCorrect="off"
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
    </div>
  );
}
