import { useMutation } from "@urql/vue"
import { AccountUpdate, Mina, type PublicKey, Reducer, fetchAccount } from "o1js"
import { client } from "~/graphql"
import {
	GetTransferAccountUpdateQuery,
	ProveTransferClaimMutation,
	ProveTransferRequestMutation
} from "~/graphql/sequencer"
import {
	type After,
	type Transfer,
	applyAccountUpdates,
	fetchTransfersExtension,
	findTransfer,
	innerBridgePublicKey,
	sendTransaction
} from "~/helpers/transfer"

const pollForTransferAccountUpdate = async (key: string, delay = 5000) => {
	console.log("Polling GetTransfer ...")
	const result = await client
		.query(GetTransferAccountUpdateQuery, { key }, { requestPolicy: "network-only" })
		.toPromise()
	if (result.error) throw result.error
	if (result.data?.transferAccountUpdate) return result.data.transferAccountUpdate
	//Wait 5s and try again
	await new Promise((resolve) => setTimeout(resolve, delay))
	return pollForTransferAccountUpdate(key)
}

export function useBridge() {
	const { executeMutation: proveTransferRequestMutation } = useMutation(
		ProveTransferRequestMutation
	)
	const { executeMutation: proveTransferClaimMutation } = useMutation(ProveTransferClaimMutation)

	/**
	 * Sends a request to the sequencer to prove the transfer
	 * and return a proved account update in a JSON string.
	 */
	const proveTransferRequest = async ({
		recipient,
		amount,
		direction
	}: {
		recipient: string
		amount: string
		direction: "DEPOSIT" | "WITHDRAW"
	}) => {
		const proveTransferResult = await proveTransferRequestMutation({
			transferRequestInput: { transfer: { amount, recipient }, direction }
		})

		if (proveTransferResult.error) throw proveTransferResult.error
		const key = proveTransferResult.data?.proveTransferRequest.accountUpdateKey
		console.log({ key })
		if (!key) throw new Error("Prove transfer failed")

		// Poll for transfer account update
		const transferAccountUpdate = await pollForTransferAccountUpdate(key)
		return transferAccountUpdate
	}

	/**
	 * Sign and send the transfer request to the network.
	 */
	const confirmTransferRequest = async ({
		senderPublicKey,
		accountUpdates,
		amount
	}: {
		senderPublicKey: PublicKey
		accountUpdates: string
		amount: string
	}) => {
		// Create zkapp command
		const tx = await Mina.transaction(senderPublicKey, async () => {
			// AccountUpdate.fundNewAccount(senderPublicKey)
			const fundsUpdate = AccountUpdate.createSigned(senderPublicKey)
			fundsUpdate.balance.subInPlace(amount)
		})

		applyAccountUpdates(tx, accountUpdates)

		return sendTransaction(tx)
	}

	/**
	 * Find and return the sender's transfer and all transfers after it.
	 */
	const findAllTransfers = async ({
		senderPublicKey,
		amount
	}: { senderPublicKey: PublicKey; amount: number }) => {
		// Find my transfer
		const transfer = await findTransfer(senderPublicKey, amount)
		console.log("transfer", transfer)

		// Fetch all transfers after mine
		const afterAll = await fetchTransfersExtension(transfer.actionState)
		console.log(
			"afterAll",
			afterAll.map(({ amount, pk, actionState }) => ({
				amount,
				pk: pk.toBase58(),
				actionState: actionState.toString()
			}))
		)
		return { transfer, afterAll }
	}

	/**
	 * Find the deposits and return all transfers after it.
	 */
	const findSyncedTransfers = async ({
		afterAll,
		transfer
	}: { transfer: Transfer; afterAll: After }) => {
		// Fetch synced deposit
		const { account: innerAccount } = await fetchAccount({ publicKey: innerBridgePublicKey })
		const syncedDepositsState = innerAccount?.zkapp?.appState.at(0)
		if (!syncedDepositsState) throw new Error("SyncedDepositsState not found")
		console.log(syncedDepositsState.toString())

		// Filter out the not yet synced deposits
		const i = afterAll.findIndex(({ actionState }) => actionState.equals(syncedDepositsState))
		const after = afterAll.slice(0, i + 1)

		// Sanity check
		const expectedDepositsState = after.reduce(
			(acc, { json }) =>
				AccountUpdate.Actions.updateSequenceState(acc, AccountUpdate.Actions.fromJSON(json).hash),
			transfer.actionState
		)
		console.log(expectedDepositsState.toString())
		if (!expectedDepositsState.equals(syncedDepositsState))
			throw new Error("Deposits state mismatch")
		return { after }
	}

	/**
	 * Prove the transfer claim and return the proved account update.
	 */
	const proveTransferClaim = async ({
		isNew,
		before = [],
		after,
		recipient,
		amount,
		direction = "DEPOSIT"
	}: {
		isNew: boolean
		before: { amount: string; recipient: string }[]
		after: After
		recipient: string
		amount: string
		direction: "DEPOSIT" | "WITHDRAW"
	}) => {
		const proveTransferResult = await proveTransferClaimMutation({
			transferClaimInput: {
				isNew,
				before,
				pointer: Reducer.initialActionState.toString(),
				after: after.map(({ amount, pk }) => ({ amount, recipient: pk.toBase58() })),
				transfer: { transfer: { recipient, amount }, direction }
			}
		})

		if (proveTransferResult.error) throw proveTransferResult.error
		const key = proveTransferResult.data?.proveTransferClaim.accountUpdateKey
		console.log({ key })
		if (!key) throw new Error("Prove transfer Claim failed")
		// Poll for transfer account update
		const transferAccountUpdate = await pollForTransferAccountUpdate(key)
		return transferAccountUpdate
	}

	/**
	 * 	Sign and send the transfer claim to the network.
	 */
	const confirmTransferClaim = async ({
		senderPublicKey,
		accountUpdates
	}: { senderPublicKey: PublicKey; accountUpdates: string }) => {
		// Create zkapp command
		const tx = await Mina.transaction({ sender: senderPublicKey, fee: 1e9 }, async () => {})
		applyAccountUpdates(tx, accountUpdates)

		tx.transaction.accountUpdates = tx.transaction.accountUpdates.map((au) => {
			if (au.body.authorizationKind.isSigned.toBoolean()) {
				au.lazyAuthorization = { kind: "lazy-signature" }
				return au
			}
			return au
		})

		return sendTransaction(tx)
	}

	return {
		proveTransferRequest,
		confirmTransferRequest,
		findAllTransfers,
		findSyncedTransfers,
		proveTransferClaim,
		confirmTransferClaim
	}
}
