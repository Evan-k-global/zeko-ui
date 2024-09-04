<script lang="ts" setup>
import type { Networks } from "~/composables/useWallet";

const {
  isConnected,
  readBalance,
  getBalance,
  balances,
  isReady,
  currentNetwork,
  switchNetwork,
} = useWallet();
const toBridge = ref("");
const source = ref<Networks | undefined>(undefined);
const destination = ref<Networks | undefined>(undefined);

const invertSourceDestination = () => {
  const temp = source.value;
  source.value = destination.value;
  destination.value = temp;
};

const deposit = () => {
  console.log("Bridging ...", toBridge.value);
};
const withdraw = () => {
  console.log("Withdrawing ...", toBridge.value);
};

watch(isReady, async () => {
  console.log("Is Ready", isReady.value);
  if (isReady.value) {
    source.value = currentNetwork.value;
    if (source.value === "zeko:testnet") {
      destination.value = "mina:testnet";
    } else {
      destination.value = "zeko:testnet";
    }
    await getBalance();
  }
});

watch(source, async () => {
  console.log("Source changed to", source.value);
  if (source.value) {
    await switchNetwork(source.value);
  }
});
</script>
<template>
  <template v-if="isConnected">
    <h3>Bridge</h3>
    <p>1. Chose a source and a destination</p>
    <p>2. Select and deposit your tokens from the source network.</p>
    <p>3. Withdraw your tokens from the destination network.</p>
    <hr />
    Current Step : 1
    <hr />
    Source: {{ source }}
    <button @click="invertSourceDestination"><></button> Destination:
    {{ destination }}
    <hr />
    <div>
      <ul>
        <li>
          <input type="radio" name="mina" id="mina" />
          <label for="mina">
            Mina Balance:
            {{ readBalance(balances.get("mina")?.balance) }}</label
          >
          <input v-model="toBridge" type="text" />
        </li>
      </ul>

      <hr />

      <button @click="deposit">Deposit</button>
      <button @click="withdraw">Withdraw</button>
    </div>
  </template>
</template>
