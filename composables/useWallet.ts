import { type ProviderError } from "@aurowallet/mina-provider";
import { type Account, type UInt64, Mina, PublicKey, fetchAccount } from "o1js";

const urls = {
  "mina:mainnet": "https://api.minascan.io/node/mainnet/v1/graphql",
  "mina:berkeley": "https://api.minascan.io/node/berkeley/v1/graphql",
  "mina:testnet": "https://api.minascan.io/node/devnet/v1/graphql",
  "zeko:testnet": "https://devnet.zeko.io/graphql",
} as const;
export type Networks = keyof typeof urls;

const supportedTokens = {
  mina: "wSHV2S4qX9jFsLjQo8r1BsMLH2ZRKsZx6EJd1sbozGPieEC4Jf",
} as const;
type SupportedToken = keyof typeof supportedTokens;

export function useWallet() {
  const accounts = useState<string[]>(() => []);
  const currentNetwork = useState<Networks>(() => "mina:mainnet" as const);
  const balances = useState<Map<string, Account>>(() => new Map());
  const isReady = useState(() => false);

  const isConnected = computed(() => accounts.value.length > 0);
  const display = computed(() => {
    if (isConnected.value) {
      return `${accounts.value[0]?.slice(0, 6)}...${accounts.value[0]?.slice(
        -4
      )}`;
    }
    return "Not connected";
  });

  const getPublicKey = () => {
    return PublicKey.fromBase58(accounts.value[0]);
  };

  const connectWallet = async () => {
    try {
      console.log("Connecting wallet ...");
      // Accounts is an array of string Mina addresses.
      const result = await window.mina.requestAccounts();
      if (result instanceof Error) throw result;
      accounts.value = result;
      console.log("Connected wallet", accounts.value);
      console.log("Requesting network ...");
      const network = await window.mina.requestNetwork();
      currentNetwork.value = network.networkID as Networks;
      setMinaNetwork(urls[currentNetwork.value]);
      isReady.value = true;
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log(e.message);
      }
      if ((e as ProviderError).code === 4001) {
        console.log("User rejected request");
      }
      console.log(e);
    }
  };

  const disconnectWallet = () => {
    accounts.value = [];
    isReady.value = false;
  };

  const switchNetwork = async (
    networkID:
      | "mina:mainnet"
      | "mina:testnet"
      | "mina:berkeley"
      | "zeko:testnet"
  ) => {
    if (!networkID.startsWith("mina")) {
      await window.mina.addChain({ url: urls[networkID], name: networkID });
    }
    const result = await window.mina.switchChain({ networkID });
    if (result instanceof Error) throw result;
    currentNetwork.value = result.networkID as Networks;
    setMinaNetwork(urls[networkID]);
    await getBalance();
  };

  const setMinaNetwork = (url: string) => {
    //This can be implemented without o1js
    console.log("Setting network to", url);
    Mina.setActiveInstance(Mina.Network(url));
  };

  const getBalance = async (token?: SupportedToken) => {
    // This can be implemented without o1js
    // we can use the wallet address directly instead of the public key, and fetch account is an api call
    // with the token ID and the publicKey
    const publicKey = getPublicKey();
    const settings = token
      ? {
          tokenId: supportedTokens[token],
          publicKey,
        }
      : { publicKey };
    console.log(settings);
    const { account, error } = await fetchAccount(settings);
    if (account) {
      const balanceInMina = Number(account.balance) / 1e9;
      console.log(`Your ${token ?? "mina"} balance is: ${balanceInMina}`);
      balances.value.set(token ?? "mina", account);
      console.log(
        "Balance",
        readBalance(balances.value.get(token ?? "mina")?.balance)
      );
    }
    if (error) {
      console.error(error);
    }
  };

  // Get the balance in MINA (remember, 1 MINA = 10^9 nanomina)
  const readBalance = (account: UInt64 | undefined) =>
    account ? Number(account) / 1e9 : 0;

  return {
    accounts,
    display,
    isReady,
    isConnected,
    currentNetwork,
    balances,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    getBalance,
    readBalance,
  };
}
