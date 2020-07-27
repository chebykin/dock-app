import { DockAPI } from '@docknetwork/sdk';
import PublicKeySr25519 from '@docknetwork/sdk/public-keys/public-key-sr25519';
import Keyring from '@polkadot/keyring/keyring';

const RPC_ENDPOINT = 'ws://localhost:9944';
const TX_SIGNER_PHRASE = '//Alice';
const ISSUER_PHRASE = '//Bob';
const HOLDER_PHRASE = '//Charlie';

let dock;
let holderPair;
let issuerPair;
let txSignerPair;

const keyring = new Keyring({ type: 'sr25519' });

export default class MyDockApi {
  static async getDock() {
    if (!dock) {
      dock = new DockAPI();
      await dock.init(RPC_ENDPOINT);
      await MyDockApi.useKeyForTxSigning(TX_SIGNER_PHRASE);
      holderPair = keyring.addFromUri(HOLDER_PHRASE);
      issuerPair = keyring.addFromUri(ISSUER_PHRASE);
    }
    return dock;
  }

  static getTxSignerPair() {
    return txSignerPair;
  }

  static getHolderPair() {
    return holderPair;
  }

  static getIssuerPair() {
    return issuerPair;
  }

  static getTxSignerPublicKey() {
    return PublicKeySr25519.fromKeyringPair(txSignerPair);
  }

  static getHolderPublicKey() {
    return PublicKeySr25519.fromKeyringPair(holderPair);
  }

  static getIssuerPublicKey() {
    return PublicKeySr25519.fromKeyringPair(issuerPair);
  }

  static async useKeyForTxSigning() {
    txSignerPair = keyring.addFromUri(TX_SIGNER_PHRASE);
    await dock.setAccount(txSignerPair);
  }
}
