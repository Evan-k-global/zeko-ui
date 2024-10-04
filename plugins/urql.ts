import urql from "@urql/vue"
import { clientOptions } from "~/graphql"

export default defineNuxtPlugin({
	name: "urql",
	setup(nuxtApp) {
		nuxtApp.vueApp.use(urql, clientOptions)
	}
})
