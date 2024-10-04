export default defineComponent({
	name: "Fallback",
	setup(_, { slots }) {
		return () => slots.default?.() ?? null
	}
})
