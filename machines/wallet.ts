import { assign, emit, fromCallback, fromPromise, setup } from "xstate"

export const urls = {
	"mina:mainnet": "https://api.minascan.io/node/mainnet/v1/graphql",
	"mina:berkeley": "https://api.minascan.io/node/berkeley/v1/graphql",
	"mina:testnet": "https://api.minascan.io/node/devnet/v1/graphql",
	"zeko:testnet": "https://devnet.zeko.io/graphql"
} as const
export type Networks = keyof typeof urls
export type Urls = (typeof urls)[Networks]

type TokenBalances = { mina: { mina: number; zeko: number } } //TODO: Additional token support

export const supportedTokens = {
	mina: "wSHV2S4qX9jFsLjQo8r1BsMLH2ZRKsZx6EJd1sbozGPieEC4Jf"
} as const

export const walletMachine = setup({
	types: {
		context: {} as {
			accounts: string[]
			currentNetwork: Networks
			zekoBalances: Map<string, number>
			minaBalances: Map<string, number>
		},
		emitted: {} as { type: "NetworkChanged"; network: Networks },
		events: {} as
			| { type: "RequestNetworkChange"; network: Networks }
			| { type: "WalletExtensionChangedNetwork"; network: Networks }
			| { type: "Connect" }
			| { type: "Disconnect" }
			| { type: "FetchBalance" }
	},
	actors: {
		listenToWalletChange: fromCallback(() => {
			return () => {}
		}),
		connectWallet: fromPromise<{ currentNetwork: Networks; accounts: string[] }>(async () => {
			return { currentNetwork: "mina:testnet", accounts: [] }
		}),
		fetchBalance: fromPromise<TokenBalances, { address: string }>(async () => {
			return { mina: { mina: 100, zeko: 100 } }
		}),
		changeNetwork: fromPromise<{ currentNetwork: Networks }, { switchTo: Networks }>(async () => {
			return { currentNetwork: "mina:testnet" }
		})
	},
	actions: {
		setWalletNetwork: (_, { network }: { network: Networks }) => null
	}
}).createMachine({
	id: "wallet",
	context: {
		accounts: [""],
		currentNetwork: "mina:testnet",
		zekoBalances: new Map(),
		minaBalances: new Map()
	},
	initial: "INIT",
	invoke: {
		src: "listenToWalletChange"
	},
	states: {
		INIT: {
			on: { Connect: { target: "CONNECTING" } }
		},
		CONNECTING: {
			invoke: {
				src: "connectWallet",
				onDone: {
					target: "FETCHING_BALANCE",
					actions: [
						{
							type: "setWalletNetwork",
							params: ({ event }) => ({ network: event.output.currentNetwork })
						},
						assign({ accounts: ({ event }) => event.output.accounts })
					]
				}
			}
		},
		FETCHING_BALANCE: {
			invoke: {
				src: "fetchBalance",
				input: ({ context }) => ({ address: context.accounts[0] }),
				onDone: {
					target: "READY",
					actions: assign({
						minaBalances: ({ context, event }) =>
							context.minaBalances.set("mina", event.output.mina.mina),
						zekoBalances: ({ context, event }) =>
							context.zekoBalances.set("mina", event.output.mina.zeko)
					})
				}
			}
		},
		READY: {
			on: {
				RequestNetworkChange: [
					{
						target: "SWITCHING_NETWORK",
						guard: ({ context, event }) => context.currentNetwork !== event.network,
						actions: assign({ currentNetwork: ({ event }) => event.network })
					},
					{
						guard: ({ context, event }) => context.currentNetwork === event.network,
						description: "If the network is already the same, emit directly.",
						actions: emit(({ event }) => ({ type: "NetworkChanged", network: event.network }))
					}
				],
				WalletExtensionChangedNetwork: {
					target: "FETCHING_BALANCE",
					guard: ({ context, event }) => context.currentNetwork !== event.network,
					actions: {
						type: "setWalletNetwork",
						params: ({ event }) => ({ network: event.network })
					}
				},
				Disconnect: { target: "INIT" },
				FetchBalance: { target: "FETCHING_BALANCE" }
			}
		},
		SWITCHING_NETWORK: {
			invoke: {
				src: "changeNetwork",
				input: ({ context }) => ({ switchTo: context.currentNetwork }),
				onDone: [
					{
						target: "FETCHING_BALANCE",
						actions: [
							{
								type: "setWalletNetwork",
								params: ({ event }) => ({ network: event.output.currentNetwork })
							}
						]
					}
				]
			}
		}
	}
})
