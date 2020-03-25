import { Blockchain, User } from 'interfaces';

export function timerCalc(blockchainState: Blockchain, userState: User) {
  const currentBlock = Number(blockchainState.BlockNum);
  const nextBlockToAction = Number(userState.lastAction);

  if (currentBlock > nextBlockToAction) {
    return 0;
  }

  const ratePerBlock = new Date(Number(blockchainState.rate)).valueOf();
  const amoutBlocks = nextBlockToAction - currentBlock;
  const currentTimer = new Date(amoutBlocks * ratePerBlock).valueOf();

  return new Date().valueOf() + currentTimer;
}
