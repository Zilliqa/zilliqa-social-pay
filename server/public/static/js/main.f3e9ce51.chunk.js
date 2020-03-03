(this.webpackJsonpclient=this.webpackJsonpclient||[]).push([[0],{30:function(n,e,t){n.exports=t(47)},47:function(n,e,t){"use strict";t.r(e);var r=t(0),a=t.n(r),i=t(13),o=t.n(i),c=t(1),u=t(27),l=t(2),f=t(4),s=t(21),d=t.n(s);function g(){var n=Object(c.a)(["\n  max-width: 100vw;\n\n  margin-right: auto;\n  margin-left:  auto;\n\n  ","\n"]);return g=function(){return n},n}var m,p,b,x,h,v,w=l.b.div(g(),(function(n){return n.area?"grid-area: ".concat(n.area,";"):""}));function y(){var n=Object(c.a)(["\n  font-family: ",";\n  font-size: ",";\n  color: ",";\n  white-space: ",";\n  text-align: ",";\n\n  font-style: normal;\n  font-weight: normal;\n\n  overflow: hidden;\n  text-overflow: ellipsis;\n"]);return y=function(){return n},n}!function(n){n.xs="10px",n.sm="15px",n.md="20px",n.lg="25px",n.xl="30px"}(m||(m={})),function(n){n.xs="0.1rem",n.sm="0.3rem",n.md="0.5rem",n.lg="0.8rem",n.xl="1rem"}(p||(p={})),function(n){n.primary="background: #29CCC4;color: #fff;",n.success="background: #2FA84F;color: #fff;",n.info="background: #00B2FF;color: #fff;",n.danger="background: #FA5D50;color: #fff;",n.warning="background: #057A8E;color: #fff;",n.outlet="background: transparent; border: 1px solid #29CCC4;color: #242626;"}(b||(b={})),function(n){n.AvenirNextLTProBold="AvenirNextLTPro-Bold",n.AvenirNextLTProDemi="AvenirNextLTPro-Demi",n.AvenirNextLTProDemiIt="AvenirNextLTPro-DemiIt",n.AvenirNextLTProHeavyCn="AvenirNextLTPro-HeavyCn",n.AvenirNextLTProIt="AvenirNextLTPro-It",n.AvenirNextLTProRegular="AvenirNextLTPro-Regular"}(x||(x={})),function(n){n.white="#fff",n.black="#000",n.primary="#29CCC4",n.success="#2FA84F",n.info="#00B2FF",n.danger="#FA5D50",n.gray="#E5E5E5"}(h||(h={})),function(n){n[n.left=0]="left",n[n.right=1]="right",n[n.center=2]="center"}(v||(v={}));var j=l.b.p(y(),(function(n){return n.fontVariant}),(function(n){return n.size}),(function(n){return n.fontColors}),(function(n){return n.nowrap?"nowrap":"normal"}),(function(n){return v[n.align||v.left]}));function O(){var n=Object(c.a)(["\n  height: fit-content;\n  width: fit-content;\n"]);return O=function(){return n},n}j.defaultProps={size:m.xs,fontVariant:x.AvenirNextLTProRegular,fontColors:h.black,nowrap:!1,align:v.left};var E=l.b.img(O());function A(){var n=Object(c.a)(["\n  border-radius: 50%;\n"]);return A=function(){return n},n}function T(){var n=Object(c.a)(["\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  grid-gap: 15px;\n  align-items: center;\n"]);return T=function(){return n},n}function P(){var n=Object(c.a)(["\n  display: flex;\n  justify-content: space-around;\n  align-items: center;\n\n  height: 60px;\n  width: 100%;\n  min-width: 300px;\n\n  border-bottom: 1px solid ",";\n\n  grid-area: header;\n\n  padding-left: 15px;\n  padding-right: 15px;\n"]);return P=function(){return n},n}l.b.header(P(),h.gray),l.b.div(T()),Object(l.b)(E)(A());function N(){var n=Object(c.a)(["\n  height: 20px;\n  width: 20px;\n"]);return N=function(){return n},n}function L(){var n=Object(c.a)(["\n  display: flex;\n  align-items: center;\n  justify-content: space-around;\n\n  padding-left: 30px;\n  padding-right: 30px;\n  max-width: 150px;\n\n  cursor: pointer;\n"]);return L=function(){return n},n}function k(){var n=Object(c.a)(["\n  padding: 30px;\n\n  background: url(/imgs/circles.svg) no-repeat;\n"]);return k=function(){return n},n}function C(){var n=Object(c.a)(["\n  height: 100%;\n  width: 250px;\n\n  border-right: 1px solid ",";\n\n  grid-area: left-bar;\n"]);return C=function(){return n},n}l.b.header(C(),h.gray),Object(l.b)(w)(k()),Object(l.b)(w)(L()),Object(l.b)(E)(N());function z(){var n=Object(c.a)(["\n  background: #ededed url(/icons/search-icon.svg) no-repeat 9px center;\n  text-align: center;\n"]);return z=function(){return n},n}function F(){var n=Object(c.a)(["\n  font-family: ",";\n  text-align: inherit;\n  font-size: inherit;\n  resize: none;\n  text-indent: 15px;\n\n  padding: ",";\n\n  width: 100%;\n  border: 0;\n\n  border-radius: 35px;\n  background: #E5E5E5;\n\n  transition: all .5s ease-out;\n\n  :focus {\n    outline: none;\n  }\n"]);return F=function(){return n},n}var I=l.b.input(F(),(function(n){return n.fontVariant}),(function(n){return n.sizeVariant}));Object(l.b)(I)(z());function V(){var n=Object(c.a)(['\n  display: grid;\n  height: 100vh;\n  width: 100vw;\n\n  grid-template-columns: max-content;\n  grid-template-rows: max-content;\n  grid-template-areas: "left-bar header"\n                       "left-bar container";\n']);return V=function(){return n},n}I.defaultProps={sizeVariant:p.xs,fontVariant:x.AvenirNextLTProRegular};l.b.main(V());function D(){var n=Object(c.a)(["\n  cursor: pointer;\n\n  min-width: 100px;\n\n  border: 0;\n  border-radius: 30px;\n\n  font-family: ",";\n  ","\n  padding: ",";\n\n  :focus {\n    outline: none;\n  }\n"]);return D=function(){return n},n}var S=l.b.button(D(),(function(n){return n.fontVariant}),(function(n){return n.variant}),(function(n){return n.sizeVariant}));function B(){var n=Object(c.a)(["\n  width: 100%;\n  height: inherit;\n"]);return B=function(){return n},n}function R(){var n=Object(c.a)(["\n  position: fixed;\n  bottom: 0;\n  right: 0;\n  z-index: -1;\n\n  width: 40%;\n  height: inherit;\n"]);return R=function(){return n},n}function Z(){var n=Object(c.a)(["\n  position: fixed;\n  top: 0;\n  left: 0;\n  z-index: -1;\n\n  width: 60%;\n  height: inherit;\n"]);return Z=function(){return n},n}function q(){var n=Object(c.a)(["\n  width: 100%;\n  max-width: 400px;\n  display: grid;\n  grid-gap: 30px;\n  justify-items: center;\n"]);return q=function(){return n},n}function H(){var n=Object(c.a)(["\n  width: 40vw;\n  min-width: 300px;\n  border-top-right-radius: 5px;\n  background: #057A8E;\n"]);return H=function(){return n},n}function J(){var n=Object(c.a)(["\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n\n  padding: 15px;\n  width: 40vw;\n  min-width: 300px;\n  background: #F5F5F5;\n  border-top-left-radius: 5px;\n  border-bottom-left-radius: 5px;\n  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);\n"]);return J=function(){return n},n}function U(){var n=Object(c.a)(["\n  display: flex;\n  justify-content: space-between;\n  flex-wrap: wrap;\n  margin: 10%;\n"]);return U=function(){return n},n}function W(){var n=Object(c.a)(["\n  display: grid;\n  justify-items: center;\n\n  width: 100vw;\n  height: 100vh;\n  z-index: 2;\n"]);return W=function(){return n},n}S.defaultProps={variant:b.primary,sizeVariant:p.xs,fontVariant:x.AvenirNextLTProDemi};var $=Object(l.b)(w)(W()),K=Object(l.b)(w)(U()),M=Object(l.b)(w)(J()),G=Object(l.b)(w)(H()),Q=Object(l.b)(w)(q()),X=Object(l.b)(E)(Z()),Y=Object(l.b)(E)(R()),_=Object(l.b)(E)(B()),nn=function(n){var e=n.history,t=a.a.useCallback((function(){e.push("/")}),[e]),r=a.a.useCallback((function(n){window.test=n,console.log("handleSuccess",n)}),[]),i=a.a.useCallback((function(){console.log("handleFailed")}),[]);return a.a.createElement(a.a.Fragment,null,a.a.createElement($,null,a.a.createElement(K,null,a.a.createElement(M,null,a.a.createElement(Q,null,a.a.createElement(I,{sizeVariant:p.md,placeholder:"Zilliqa address (zil1) or ZNS."}),a.a.createElement(d.a,{loginUrl:"http://localhost:4000/api/v1/auth/twitter",onFailure:i,onSuccess:r,requestTokenUrl:"http://localhost:4000/api/v1/auth/twitter/reverse",showIcon:!0}),a.a.createElement(S,{sizeVariant:p.lg,onClick:t},"Continue"))),a.a.createElement(G,null,a.a.createElement(_,{src:"/imgs/sign.svg"})))),a.a.createElement(X,{src:"/imgs/auth-2.svg"}),a.a.createElement(Y,{src:"/imgs/auth-1.svg"}))},en=t(28),tn=(t(37),t(25));function rn(){var n=Object(c.a)(["\n  max-height: 400px;\n"]);return rn=function(){return n},n}function an(){var n=Object(c.a)(["\n  max-width: 400px;\n"]);return an=function(){return n},n}function on(){var n=Object(c.a)(["\n  display: flex;\n  justify-content: space-around;\n  flex-wrap: wrap;\n  align-items: baseline;\n\n  margin-top: 30px;\n\n  padding-left: 15px;\n  padding-right: 15px;\n\n  max-width: 600px;\n"]);return on=function(){return n},n}function cn(){var n=Object(c.a)(["\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n\n  margin-top: 40px;\n"]);return cn=function(){return n},n}var un=l.b.div(cn()),ln=l.b.div(on()),fn=Object(l.b)(j)(an()),sn=Object(l.b)(E)(rn()),dn=function(n){var e=n.imgSrc,t=n.text,r=n.onNext;return a.a.createElement(un,null,a.a.createElement(sn,{src:e}),a.a.createElement(ln,null,a.a.createElement(fn,{size:m.sm},t),a.a.createElement(S,{sizeVariant:p.md,onClick:r},"Next")))};function gn(){var n=Object(c.a)(["\n  .carousel .slide {\n    background: transparent;\n  }\n"]);return gn=function(){return n},n}var mn={showArrows:!1,showStatus:!1,showThumbs:!1,showIndicators:!1,emulateTouch:!0,useKeyboardArrows:!0},pn=[{img:"guide-1.svg",text:"SocialPay is an innovative new solution that allows you to earn $ZIL by sharing social media updates on Twitter. To use SocialPay you need to login with your Twitter account and use specific hashtags in your tweets."},{img:"guide-2.svg",text:"Every time you publish Zilliqa-related tweets, you are able to earn reward. These rewards can vary depending on the campaign Zilliqa is running. Make sure to always check out what campaign is running while you help Zilliqa grow!"}],bn=Object(l.a)(gn()),xn=function(n){var e=n.history,t=a.a.useState(0),r=Object(en.a)(t,2),i=r[0],o=r[1],c=a.a.useCallback((function(n){if(n<pn.length)return o(n),null;e.push("/auth")}),[o,e]);return a.a.createElement(a.a.Fragment,null,a.a.createElement(tn.Carousel,Object.assign({},mn,{selectedItem:i,onChange:o}),pn.map((function(n,e){return a.a.createElement(dn,{key:e,imgSrc:"/imgs/".concat(n.img),text:n.text,onNext:function(){return c(e+1)}})}))),a.a.createElement(bn,null))},hn=function(){return a.a.createElement(f.c,null,a.a.createElement(f.a,{path:"/guide",component:xn,exact:!0}),a.a.createElement(f.a,{path:"/auth",component:nn,exact:!0}),a.a.createElement(f.a,{path:"/",component:nn,exact:!0}))};function vn(){var n=Object(c.a)(["\n  @font-face {\n    font-family: ",";\n    src: url('/fonts/AvenirNextLTPro-Bold.otf');\n  }\n  @font-face {\n    font-family: ",";\n    src: url('/fonts/AvenirNextLTPro-Demi.otf');\n  }\n  @font-face {\n    font-family: ",";\n    src: url('/fonts/AvenirNextLTPro-DemiIt.otf');\n  }\n  @font-face {\n    font-family: ",";\n    src: url('/fonts/AvenirNextLTPro-HeavyCn.otf');\n  }\n  @font-face {\n    font-family: ",";\n    src: url('/fonts/AvenirNextLTPro-It.otf');\n  }\n  @font-face {\n    font-family: ",";\n    src: url('/fonts/AvenirNextLTPro-Regular.otf');\n  }\n\n  body, html {\n    margin: 0;\n    padding: 0;\n\n    font-family: ",";\n  }\n\n  * {\n    box-sizing: border-box;\n  }\n"]);return vn=function(){return n},n}var wn=Object(l.a)(vn(),x.AvenirNextLTProBold,x.AvenirNextLTProDemi,x.AvenirNextLTProDemiIt,x.AvenirNextLTProHeavyCn,x.AvenirNextLTProIt,x.AvenirNextLTProRegular,x.AvenirNextLTProRegular),yn=function(){return a.a.createElement(a.a.Fragment,null,a.a.createElement(u.a,null,a.a.createElement(hn,null)),a.a.createElement(wn,null))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));o.a.render(a.a.createElement(yn,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(n){n.unregister()})).catch((function(n){console.error(n.message)}))}},[[30,1,2]]]);
//# sourceMappingURL=main.f3e9ce51.chunk.js.map