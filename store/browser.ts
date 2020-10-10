import { createDomain } from 'effector';
import { ImgFormats } from 'config';

export const BrowserDomain = createDomain();
export const setformat = BrowserDomain.event<ImgFormats>();
export const reset = BrowserDomain.event();
export const setRecaptchaKey = BrowserDomain.event<string>();

const initalState = {
  format: ImgFormats.webp,
  recaptchaKey: ''
};

export const store = BrowserDomain.store(initalState)
  .on(reset, () => initalState)
  .on(setRecaptchaKey, (state, recaptchaKey) => ({
    ...state,
    recaptchaKey
  }))
  .on(setformat, (state, format) => ({
    ...state,
    format
  }));

export default {
  store,
  reset,
  setformat,
  setRecaptchaKey
};
