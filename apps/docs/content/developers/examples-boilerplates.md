# Examples & Boilerplates

Browse ready-to-use code examples and boilerplate projects to kickstart your Zeko development.

To get up and running quickly, see the [Quick Start guide](../introduction/quick-start.md) which walks through the available resources for developers, end users, and node operators.

## GitHub Organization

- [Zeko Labs](https://github.com/zeko-labs): the main GitHub organization for Zeko protocol code, developer demos, agent skills, CLIs, SDKs, and related tools.

## Developer Demos

The [developer_demos](https://github.com/zeko-labs/developer_demos) repository is a monorepo of end-to-end examples for building zero-knowledge applications on Zeko. Each demo is independent, so start with the README and docs inside the folder you want to run.

The descriptions below are condensed from the public repository README and current folder tree.

| Demo | What it demonstrates | Agent skills |
| --- | --- | --- |
| [Agent Coordination Protocol](https://github.com/zeko-labs/developer_demos/tree/main/agent_coordination_protocol-financial_intelligence) | Privacy-preserving agent marketplace and payment flow with request, accept, deliver, attest, wallet payment, relayer, credits, performance, and settlement patterns. | Includes skills for agent marketplaces, attestations, credits ledgers, escrow ACP flows, model adapters, price data, private outputs, relayers, storage hardening, and wallet connection. |
| [Agent Execution Escrow](https://github.com/zeko-labs/developer_demos/tree/main/agent_execution_escrow) | Zeko-native trust layer for agent transactions, gated execution, intent approval APIs, verifier registries, threshold signatures, and proof-checked per-intent zkApp lifecycle state. | Includes skills for agent intent APIs, private intent artifacts, per-intent zkApp lifecycle proving, transaction state sync, verifier approval, registry parsing, signature checks, and threshold quorum relay. |
| [Private Prediction Market](https://github.com/zeko-labs/developer_demos/tree/main/perfect-weather_prediction_market) | Private weather prediction market with hosted frontend, oracle worker, transaction prover services, wallet-signed bet and claim flows, event sync, and zk-backed settlement. | Includes skills for weather market demos, private betting privacy, private market protocol design, agent-market integration, event sync/archive operations, market ops, and zkTLS weather oracle workflows. |
| [Private Tokenized Asset Protocol](https://github.com/zeko-labs/developer_demos/tree/main/private-tokenized-asset-protocol) | Tokenized asset protocol reference for private and programmable asset flows, including multi-package app structure, infrastructure, scripts, and deeper protocol organization patterns. | Documents TAP-specific skills for flagship pilot runs, customer sandbox onboarding, policy-linked settlement guards, zkTLS source integration, proof runtime configuration, issuer workflows, release packaging, and UI surface polish. |
| [Private Order Book](https://github.com/zeko-labs/developer_demos/tree/main/private_order_book) | Private order book exchange with note-backed trading, public-anonymous and private-dark orders, off-chain matching, on-chain settlement anchoring, reference zkApp, and matching infrastructure. | Includes skills for trading UI composition, shared-liquidity SDK architecture, Zeko DA privacy, wallet-signed non-magic transactions, and production runbook debugging. |
| [Private Data Registry & Transaction Sponsor](https://github.com/zeko-labs/developer_demos/tree/main/proof_of_prayer) | Privacy-preserving consumer app with encrypted user content, wallet and non-wallet submission paths, sponsored anchoring, moderation, and participation-proof patterns. | Includes a Zeko Auro zkApp debugging skill for wallet connection and transaction troubleshooting. |
| [AI & Truth: Data Provenance](https://github.com/zeko-labs/developer_demos/tree/main/proof_over_hype_ai_image_provenance) | AI media provenance demo with image provenance, metadata flows, attestable claim patterns, and reference frontend/backend wiring for verifiable media UX. | Includes skills for Auro zkApp preflight, deterministic image canonicalization, historical proof verification, secure public demo packaging, non-magic fee-payer flows, and safe zkApp redeploy consistency. |
| [Verifiable AI Execution & Runtime](https://github.com/zeko-labs/developer_demos/tree/main/zeko_ai_runtime) | Zeko-native verifiable AI runtime with off-chain inference, attestable receipts, sealed private inputs, client-encrypted outputs, operator routing, failover, credits, and compatibility adapters. | Includes runtime-scoped skills for native and private inference builders, credits balance operators, lane/operator failover, and compatibility adapters for legacy-shaped integrations. |

## Agent Skills

| Resource | What it is for |
| --- | --- |
| [zeko-skills](https://github.com/zeko-labs/zeko-skills) | Public Zeko skills for AI agents that need to bridge assets, get faucet funds, inspect endpoints, run GraphQL or `curl` queries, understand sequencer/archive/DA components, or help users build zkApps on Zeko with `o1js` or OCaml. |
| [`skills/zeko`](https://github.com/zeko-labs/zeko-skills/tree/main/skills/zeko) | The installable `zeko` agent skill. It is tuned for practical Zeko builder workflows, including Bridge CLI/SDK usage, faucet flows, endpoint discovery, live/archive queries, and zkApp development orientation. |
| Demo-local skills | Some developer demos include their own `skills/` folders for domain-specific agent workflows. These are useful when an agent needs to operate inside a demo, explain a protocol path, or debug a demo-specific integration. |

Install the public Zeko skill with:

    npx skills add https://github.com/zeko-labs/zeko-skills --skill zeko

## CLI, SDK, and Tooling

| Tool | What it is for |
| --- | --- |
| [Bridge CLI](https://github.com/zeko-labs/bridge-cli) | `zeko-bridge` command-line tool for bridging assets between Mina L1 and Zeko. The high-level `bridge` command signs, submits, waits, retries transient checks, advances queued claims, and streams progress until completion. |
| [Bridge SDK](https://github.com/zeko-labs/bridge-sdk) | TypeScript SDK for integrating deposits and withdrawals between Mina L1 and Zeko L2 into applications, services, and scripts. |
| [Faucet CLI](https://github.com/zeko-labs/faucet-cli) | Command-line client for the Zeko testnet faucet. Use it to verify GitHub authentication and claim testnet tokens for a Zeko address. |
| [x402 Zeko](https://github.com/zeko-labs/x402-zeko) | x402 starter for Zeko-centric paid services, including `402 Payment Required` negotiation, signed payment authorization payloads, Zeko testnet settlement, EVM/Base/Ethereum USDC rails, and proof-oriented payment metadata. |
| [Launch a Rollup](https://docs.zeko.io/operators/guides/launch-rollup.html) | Operator guide for launching a Zeko rollup stack with sequencer, DA layer, prover, PostgreSQL, RabbitMQ, wallets, keys, deployment config, and Docker Compose. |
