import { Blockchain, User } from 'interfaces';

export function timerCalcDay(
  blockchainState: Blockchain,
  userState: User
) {
  const currentBlock = Number(blockchainState.BlockNum);
  let nextBlockToAction = Number(userState.lastAction);

  if (userState.actionName === 'ConfigureUsers') {
    nextBlockToAction -= Number(blockchainState.blocksPerWeek);
  }

  if (currentBlock >= nextBlockToAction) {
    return 0;
  }

  const ratePerBlock = new Date(Number(blockchainState.rate)).valueOf();
  const amoutBlocks = nextBlockToAction - currentBlock;
  const currentTimer = new Date(amoutBlocks * ratePerBlock).valueOf();

  return new Date().valueOf() + currentTimer;
}

export function timerCalcWeek(
  blockchainState: Blockchain,
  userState: User
) {
  const currentBlock = Number(blockchainState.BlockNum);
  let nextBlockToAction = Number(userState.lastAction);

  if (nextBlockToAction === 0 && userState.actionName === 'ConfigureUsers') {
    nextBlockToAction = currentBlock + Number(blockchainState.blocksPerWeek);
  }

  if (currentBlock >= nextBlockToAction) {
    return 0;
  }

  const ratePerBlock = new Date(Number(blockchainState.rate)).valueOf();
  const amoutBlocks = nextBlockToAction - currentBlock;
  const currentTimer = new Date(amoutBlocks * ratePerBlock).valueOf();

  return new Date().valueOf() + currentTimer;
}