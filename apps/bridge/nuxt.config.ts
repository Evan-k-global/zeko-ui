// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2024-04-03",
	ssr: false,
	css: ["@picocss/pico/css/pico.classless.blue.min.css"],
	future: {
		compatibilityVersion: 4
	},
	routeRules: {
		"/": {
			headers: {
				"Cross-Origin-Embedder-Policy":
					process.env.NODE_ENV === "development" ? "unsafe-none" : "require-corp",
				"Cross-Origin-Opener-Policy": "same-origin"
			}
		}
	},

	postcss: { plugins: { "postcss-nested": {} } },
	devtools: { enabled: true }
})
