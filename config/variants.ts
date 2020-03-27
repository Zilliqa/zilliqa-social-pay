export enum ButtonVariants {
  primary = 'background: #5C63EF;color: #fff;',
  success = 'background: #2FA84F;color: #fff;',
  info = 'background: #9FA9FF;color: #fff;',
  danger = 'background: #FA5D50;color: #fff;',
  warning = 'background: #057A8E;color: #fff;',
  outlet = `
    background: transparent;
    border: 1px solid #fff;
    color: #fff;

    :hover {
      background: #fff;
      color: #5C63EF;
      border: 1px solid transparent;
    }
  `
}

export enum AlertVariants {
  primary = 'color: #fff;background-color: #29CCC4;border-color: #22a7a0;',
  success = 'color: #fff;background-color: #2FA84F;border-color: #217738;',
  info = 'color: #fff;background-color: #00B2FF;border-color: #0070a0;',
  danger = 'color: #fff;background-color: #FA5D50;border-color: #bb453c;',
  warning = 'color: #fff;background-color: #cce5ff;border-color: #03515f;'
}

export enum ImgFormats {
  png = 'png',
  webp = 'webp'
}
