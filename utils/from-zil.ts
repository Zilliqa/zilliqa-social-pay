import * as units from '@zilliqa-js/util/dist/unit';
import { BN } from '@zilliqa-js/util';

const Zil = (units as any).Units.Zil;

export const fromZil = (value: string, isRound = true) => {
  const _1000 = 1000;
  const amount = units.fromQa(new BN(value), Zil);

  if (isRound) {
    return String(Math.round(Number(amount) * _1000) / _1000);
  } else {
    return amount;
  }
};
