import { Blockchain } from 'interfaces';

export function timerCalc(
  blockchainState: Blockchain,
  lastBlockNumber: number | string,
  blocksPer: number,
  userLastAction?: number | string,
) {
  const tweetslock = [Number(lastBlockNumber)];

  if (userLastAction) {
    tweetslock.push(Number(userLastAction));
  }

  let maxBlock = Math.max.apply(Math, tweetslock);

  if (maxBlock < 0) {
    maxBlock = 0;
  }

  const currentBlock = Number(blockchainState.BlockNum);
  let amoutBlocks = (maxBlock + blocksPer) - currentBlock;

  if (amoutBlocks < 0) {
    amoutBlocks = 0;
  }

  const ratePerBlock = new Date(Number(blockchainState.rate)).valueOf();
  const currentTimer = new Date(amoutBlocks * ratePerBlock).valueOf();

  if (currentTimer === 0) {
    return 0;
  }

  return new Date().valueOf() + currentTimer;
}
