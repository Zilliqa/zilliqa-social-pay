let net = 'testnet';

if (process.env.NODE_ENV !== 'production') {
  net = 'testnet';
}

export function viewTx(hash: string) {
  return `https://viewblock.io/zilliqa/tx/0x${hash}?network=${net}`;
}
