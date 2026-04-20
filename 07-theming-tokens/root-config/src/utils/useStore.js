import { useState, useEffect } from 'react';

/**
 * Hook to subscribe to a nanostore atom.
 * Works in any MF without importing nanostores — uses .get() and .subscribe()
 * which are methods on the atom object itself.
 */
export function useStore(store) {
  const [value, setValue] = useState(store.get());
  useEffect(() => store.subscribe(setValue), [store]);
  return value;
}
