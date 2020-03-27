import { createDomain } from 'effector';
import { ImgFormats } from 'config';

export const BrowserDomain = createDomain();
export const setformat = BrowserDomain.event<ImgFormats>();
export const reset = BrowserDomain.event();

const initalState = {
  format: ImgFormats.webp
};

export const store = BrowserDomain.store(initalState)
  .on(reset, () => initalState)
  .on(setformat, (state, format) => ({
    ...state,
    format
  }));

export default {
  store,
  reset,
  setformat
};
