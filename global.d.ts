import type Mina from "@aurowallet/mina-provider";

declare global {
  interface Window {
    mina: Mina;
  }
}

// This empty export is necessary to make this a module
export {};
