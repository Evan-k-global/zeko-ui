import { PublicKey } from "o1js"
import { useMachine } from "~/composables/useXstate"
import { createSimpleStore } from "~~/helpers/store"
import { walletMachine } from "~~/machines/wallet"

const getPublicKey = (address: string) => {
	return PublicKey.fromBase58(address)
}

export const useWalletStore = createSimpleStore("wallet", () => {
	const { send, snapshot, actorRef } = useMachine(walletMachine, {
		inspect: (event) => {
			if (event.type === "@xstate.event") {
				console.log(event)
			}
		}
	})

	const address = computed(() => snapshot.value.context.accounts[0] ?? "")

	const displayAddress = computed(() => {
		return `${address?.value.slice(0, 6)}...${address?.value.slice(-4)}`
	})

	const currentNetwork = computed(() => snapshot.value.context.currentNetwork)

	const minaBalances = useSelector(actorRef, (state) => state.context.minaBalances)
	const zekoBalances = useSelector(actorRef, (state) => state.context.zekoBalances)

	const walletLoaded = computed(
		() =>
			snapshot.value.matches("READY") ||
			snapshot.value.matches("SWITCHING_NETWORK") ||
			snapshot.value.matches("FETCHING_BALANCE")
	)

	onMounted(() => {
		if (snapshot.value.matches("INIT")) {
			send({ type: "Connect" })
		}
	})

	return {
		send,
		getPublicKey,
		snapshot,
		actorRef,
		address,
		displayAddress,
		currentNetwork,
		minaBalances,
		zekoBalances,
		walletLoaded
	}
})
