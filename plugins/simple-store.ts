import { defineNuxtPlugin } from "#app"

const plugin = defineNuxtPlugin({
	name: "simple-store",
	setup(nuxtApp) {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		let simpleStore = reactive({} as Record<string, any>)

		if (import.meta.server) {
			nuxtApp.payload.simpleStore = simpleStore
		} else if (nuxtApp.payload?.simpleStore) {
			simpleStore = reactive(nuxtApp.payload.simpleStore)
		}

		return {
			provide: { simpleStore }
		}
	}
})

export default plugin
