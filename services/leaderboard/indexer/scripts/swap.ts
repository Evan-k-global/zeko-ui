import { getMaxBlockHeight, logger } from "../src/helper"
import { handler as swap } from "../src/points/swap"

async function main() {
	const startBlock = 0
	logger.info(`🔍 Fetching swap events from block ${startBlock} to now...`)

	try {
		const result = await swap.fetch({ startBlock, endBlock: Number.POSITIVE_INFINITY })
		const maxBlockHeight = await getMaxBlockHeight("L2")
		logger.success(`✅ Fetch completed successfully`)
		logger.info(`📊 Last fetched block: ${result.lastFetchedBlock}`)
		logger.info(`📝 Total swap events found: ${result.data.length}`)

		if (result.data.length === 0) {
			logger.warn("⚠️  No swap events found")
			return
		}

		// Format timestamps for human readability
		const formattedData = result.data.map((event) => ({
			...event,
			timestamp: new Date(Number(event.timestamp)).toISOString()
		}))

		logger.box("Swap Events:")
		console.log(JSON.stringify(formattedData, null, 2))

		// Print summary statistics
		logger.box("Summary Statistics:")
		const uniqueSenders = new Set(result.data.map((event) => event.sender))
		console.log(`Total events: ${result.data.length}`)
		console.log(`Unique senders: ${uniqueSenders.size}`)
		console.log(`Last Fetched Block: ${result.lastFetchedBlock}`)
		console.log(`Block range: ${startBlock} - ${maxBlockHeight}`)
	} catch (error) {
		logger.error("❌ Error fetching swap events:", error)
		throw error
	}
}

main().catch((error) => {
	console.error("Fatal error:", error)
	process.exit(1)
})
