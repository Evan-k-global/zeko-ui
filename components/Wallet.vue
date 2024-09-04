<script lang="ts" setup>
const {
  isConnected,
  connectWallet,
  display,
  currentNetwork,
  disconnectWallet,
  switchNetwork,
} = useWallet();

const zekoTestnet = async () => {
  await switchNetwork("zeko:testnet");
};
const minaTestnet = async () => {
  await switchNetwork("mina:testnet");
};
onMounted(async () => {
  await connectWallet();
});
</script>

<template>
  <div>Wallet Connect</div>
  <div>{{ display }} | {{ currentNetwork }}</div>
  <button @click="">Testnet</button>
  <button @click="" disabled>Live</button>
  <hr />
  <button @click="connectWallet" :disabled="isConnected">Connect</button>
  <button @click="disconnectWallet" :disabled="!isConnected">Disconnect</button>
</template>
