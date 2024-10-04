import type { Networks } from "@zeko/sdk"
import type { walletMachine } from "@zeko/sdk/vue"
import { nanoid } from "nanoid"
import { type ActorRefFromLogic, assign, setup } from "xstate"
import { bridgeOperationMachine } from "./bridgeOperation"

const wait = (ms = 1000) => new Promise((res) => setTimeout(res, ms))
type Network = "mina" | "zeko"
type Operations = Map<
	string,
	{
		status: "started" | "completed"
		operation: ActorRefFromLogic<typeof bridgeOperationMachine>
	}
>
type Wallet = ActorRefFromLogic<typeof walletMachine>
// Parent Bridge Machine
export const bridgeMachine = setup({
	types: {
		context: {} as {
			sourceNetwork: Network
			destinationNetwork: Network
			currentNetwork: Networks
			operations: Operations
			wallet: Wallet
		},
		input: {} as { wallet: Wallet; currentNetwork: Networks },
		events: {} as
			| { type: "NetworkChanged"; network: Networks }
			| { type: "StartOperation"; amount: string }
			| { type: "OperationComplete"; id: string }
			| { type: "InvertDirection" }
	},
	actors: { bridgeOperationMachine },
	actions: {
		startOperation: assign({
			operations: ({ self, context, spawn }, params: { amount: string }) => {
				const { amount } = params
				const { wallet, sourceNetwork, destinationNetwork, currentNetwork: n } = context
				//TODO: Add testnet support
				const currentNetwork = n.includes("mina") ? "mina" : "zeko"
				const id = `bridgeOperation-${Date.now()}-${nanoid(8)}`
				const operation = spawn("bridgeOperationMachine", {
					id,
					input: {
						bridge: self,
						wallet,
						sourceNetwork,
						currentNetwork,
						destinationNetwork,
						amount
					}
				})
				operation.send({ type: "StartBridgeOperation" })
				return context.operations.set(id, { status: "started", operation })
			}
		}),
		completeOperation: assign({
			operations: ({ context }, params: { id: string }) => {
				const { id } = params
				const currentOperation = context.operations.get(id)?.operation
				if (!currentOperation) throw new Error("Operation not found")
				return context.operations.set(id, {
					status: "completed",
					operation: currentOperation
				})
			}
		}),
		changeOperationNetwork: ({ context }, { network }: { network: Network }) => {
			for (const { status, operation } of context.operations.values()) {
				if (status === "started") {
					//TODO: Handle testnet
					operation.send({ type: "SetCurrentNetwork", network })
				}
			}
		}
	}
}).createMachine({
	id: "bridge",
	initial: "READY",
	context: ({ input: { wallet, currentNetwork } }) => ({
		wallet,
		operations: new Map(),
		sourceNetwork: "mina",
		destinationNetwork: "zeko",
		currentNetwork
	}),
	states: {
		READY: {
			on: {
				NetworkChanged: {
					actions: [
						{
							type: "changeOperationNetwork",
							params: ({ event }) => ({
								network: event.network.includes("mina") ? "mina" : "zeko"
							})
						},
						assign({ currentNetwork: ({ event }) => event.network })
					]
				},
				InvertDirection: {
					actions: assign(({ context: { sourceNetwork, destinationNetwork } }) => ({
						sourceNetwork: destinationNetwork,
						destinationNetwork: sourceNetwork
					}))
				},
				StartOperation: {
					actions: {
						type: "startOperation",
						params: ({ event }) => ({ amount: event.amount })
					}
				},
				OperationComplete: {
					actions: {
						type: "completeOperation",
						params: ({ event }) => ({ id: event.id })
					}
				}
			}
		}
	}
})

type Parent = {
	children: Child[]
	// other parent properties
}

type Child = {
	parent: Parent
	// other child properties
}
