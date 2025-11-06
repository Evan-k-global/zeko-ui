export type { Client } from "@urql/core"

export * from "./drizzle/schema"
export {
	checkDatabaseConnectionString,
	fetchEventsRaw,
	getMaxBlockHeightL2
} from "./src/helpers/utils"

export interface BroadcastPayload {
	maxBlockHeight: number
	hasNewEntries: boolean
}
