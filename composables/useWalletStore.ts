import type { ChainInfoArgs, ProviderError } from "@aurowallet/mina-provider"
import { Mina, PublicKey } from "o1js"
import { enqueueActions, fromCallback, fromPromise } from "xstate"
import { useMachine } from "~/composables/useXstate"
import { createMinaClient } from "~/graphql"
import { FetchAccountBalanceQuery } from "~/graphql/sequencer"
import { createSimpleStore } from "~/helpers/store"
import { supportedTokens, urls, walletMachine } from "~/machines/wallet"
import type { Networks } from "../machines/wallet"

const getPublicKey = (address: string) => {
	return PublicKey.fromBase58(address)
}

export const useWalletStore = createSimpleStore("wallet", () => {
	const { send, snapshot, actorRef } = useMachine(
		walletMachine.provide({
			actions: {
				setWalletNetwork: enqueueActions(({ enqueue }, { network }: { network: Networks }) => {
					const url = urls[network]
					console.log("Setting network to", url)
					Mina.setActiveInstance(Mina.Network(url))
					enqueue.assign({ currentNetwork: network })
					enqueue.emit({ type: "NetworkChanged", network })
				})
			},
			actors: {
				changeNetwork: fromPromise(async ({ input: { switchTo } }) => {
					console.log("Change Network ...")
					// //TODO: Testnet is hardcoded for now
					if (switchTo.includes("mainnet")) console.error("Mainnet is not supported")
					if (!switchTo.startsWith("mina")) {
						//TODO: this might not be necessary
						await window.mina.addChain({ url: urls[switchTo], name: switchTo })
					}
					const result = await window.mina.switchChain({ networkID: switchTo })
					if (result instanceof Error) throw result
					return { currentNetwork: switchTo }
				}),
				listenToWalletChange: fromCallback(({ sendBack }) => {
					window.mina.on("chainChanged", ({ networkID }: ChainInfoArgs) => {
						console.log("User manually changed network", networkID)
						sendBack({ type: "WalletExtensionChangedNetwork", network: networkID as Networks })
					})
					window.mina.on("accountsChanged", (accounts: string[]) => {
						console.log("User manually changed account") //TODO: implement this
					})
					return () => {}
				}),
				connectWallet: fromPromise(async () => {
					try {
						console.log("Connecting wallet ...")
						// Accounts is an array of string Mina addresses.
						const accounts = await window.mina.requestAccounts()
						if (accounts instanceof Error) throw accounts
						console.log("Connected wallet", accounts)
						const { networkID } = await window.mina.requestNetwork()
						const currentNetwork = networkID as Networks
						return { currentNetwork, accounts }
					} catch (e: unknown) {
						if (e instanceof Error) {
							console.log(e.message)
						}
						if ((e as ProviderError).code === 4001) {
							console.log("User rejected request")
						}
						console.log(e)
						throw e
					}
				}),
				fetchBalance: fromPromise(async ({ input }) => {
					console.log({ input })
					const publicKey = getPublicKey(input.address).toBase58()
					const token = "mina" //TODO: Hardcoded for now
					const settings = token
						? {
								tokenId: supportedTokens[token],
								publicKey
							}
						: { publicKey }

					//TODO: Hardcoded testnet
					const minaClient = createMinaClient(urls["mina:testnet"])
					const zekoClient = createMinaClient(urls["zeko:testnet"])

					const [minaResult, zekoResult] = await Promise.all([
						minaClient.query(FetchAccountBalanceQuery, settings),
						zekoClient.query(FetchAccountBalanceQuery, settings)
					])
					const toReadable = (balance: unknown) => Number(balance) / 1e9
					const mina = toReadable(minaResult.data?.account?.balance?.total) ?? 0
					const zeko = toReadable(zekoResult.data?.account?.balance?.total) ?? 0

					return { mina: { mina, zeko } }
				})
			}
		}),
		{
			inspect: (event) => {
				if (event.type === "@xstate.event") {
					console.log(event)
				}
			}
		}
	)

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
