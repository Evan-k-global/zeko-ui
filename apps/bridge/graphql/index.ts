import { retryExchange } from "@urql/exchange-retry"
import { Client, type ClientOptions, fetchExchange } from "@urql/vue"
import { initGraphQLTada } from "gql.tada"
import type { introspection } from "./graphql-env.js"

export type { FragmentOf, ResultOf, VariablesOf } from "gql.tada"
export { readFragment } from "gql.tada"

//GraphQL Tada initialization
export const graphql = initGraphQLTada<{
	introspection: introspection
	scalars: { UInt64: string; PublicKey: string; TokenID: string }
}>()

//Urql Client Options
export const clientOptions: ClientOptions = {
	url: "https://devnet.zeko.io/graphql",
	exchanges: [fetchExchange]
}

export const client = new Client(clientOptions)

export const createMinaClient = (url: string) =>
	new Client({
		url,
		requestPolicy: "network-only",
		exchanges: [
			retryExchange({
				maxDelayMs: 5000,
				initialDelayMs: 1000,
				maxNumberAttempts: 5,
				randomDelay: true,
				retryIf: (err) => !!err?.networkError
			}),
			fetchExchange
		]
	})
