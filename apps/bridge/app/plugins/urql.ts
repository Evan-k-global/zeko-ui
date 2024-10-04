import urql from "@urql/vue"
import { createClientOptions } from "@zeko/sdk/vue"
export default defineNuxtPlugin({
	name: "urql",
	setup(nuxtApp) {
		nuxtApp.vueApp.use(urql, createClientOptions("https://devnet.zeko.io/graphql"))
	}
})
