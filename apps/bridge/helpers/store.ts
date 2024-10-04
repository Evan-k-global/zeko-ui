export const createSimpleStore =
	<N extends string, R, S>(name: N, setupStore: (store: S) => R) =>
	() => {
		const store = useNuxtApp().$simpleStore
		if (!store[name]) {
			const result = setupStore(store as S)
			store[name] = result
		}

		return store[name] as R
	}
