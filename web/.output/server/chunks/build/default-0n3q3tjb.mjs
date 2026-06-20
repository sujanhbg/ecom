import { _ as __nuxt_component_0 } from './nuxt-link-CWHaFnq7.mjs';
import { withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot } from 'vue/server-renderer';
import { _ as _export_sfc } from './server.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'vue-router';

const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_nuxt_link = __nuxt_component_0;
  _push(`<div${ssrRenderAttrs(_attrs)}><header><div class="header-top"><div class="container"><div class="logo"><h1>`);
  _push(ssrRenderComponent(_component_nuxt_link, { to: "/" }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`Demo-store`);
      } else {
        return [
          createTextVNode("Demo-store")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</h1></div><div class="search-bar"><input type="text" placeholder="Search for products, categories..."><button><i class="fas fa-search"></i></button></div><div class="header-actions"><div class="action-item"><i class="far fa-user"></i><span>Log in / Sign up</span></div><div class="action-item"><i class="far fa-heart"></i><span>Wishlist</span></div><div class="action-item"><i class="fas fa-shopping-cart"></i><span>Cart (0)</span></div></div></div></div><nav class="header-nav"><div class="container"><ul><li>`);
  _push(ssrRenderComponent(_component_nuxt_link, { to: "/" }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`Home`);
      } else {
        return [
          createTextVNode("Home")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</li><li>`);
  _push(ssrRenderComponent(_component_nuxt_link, { to: "/shop" }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`Shop`);
      } else {
        return [
          createTextVNode("Shop")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</li><li>`);
  _push(ssrRenderComponent(_component_nuxt_link, { to: "/blog" }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`Blog`);
      } else {
        return [
          createTextVNode("Blog")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</li><li>`);
  _push(ssrRenderComponent(_component_nuxt_link, { to: "/trusted" }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`Trusted By`);
      } else {
        return [
          createTextVNode("Trusted By")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</li><li>`);
  _push(ssrRenderComponent(_component_nuxt_link, { to: "/about" }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`About us`);
      } else {
        return [
          createTextVNode("About us")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</li><li>`);
  _push(ssrRenderComponent(_component_nuxt_link, { to: "/contact" }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`Contact us`);
      } else {
        return [
          createTextVNode("Contact us")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</li><li>`);
  _push(ssrRenderComponent(_component_nuxt_link, { to: "/faqs" }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`FAQs`);
      } else {
        return [
          createTextVNode("FAQs")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</li></ul></div></nav></header><main class="container">`);
  ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
  _push(`</main><footer class="footer"><div class="container"><div class="footer-features"><div class="feature-item"><i class="fas fa-headset"></i><div><h4>SUPPORT</h4><p>CALL US 9am-7pm</p></div></div><div class="feature-item"><i class="fas fa-truck"></i><div><h4>SHIPPING</h4><p>70 tk* Inside Dhaka City</p></div></div><div class="feature-item"><i class="fas fa-exchange-alt"></i><div><h4>EXCHANGE</h4><p>Faulty products will be exchanged</p></div></div><div class="feature-item"><i class="fas fa-shield-alt"></i><div><h4>SECURE</h4><p>Cash on Delivery All over Bangladesh</p></div></div></div><div class="footer-content"><div class="footer-about"><h2>Demo-store</h2><p>Your Trusted Wholesale and B2B Business Partner. Providing the best packaging and retail products across the country.</p><div class="footer-social"><a href="#"><i class="fab fa-facebook-f"></i></a><a href="#"><i class="fab fa-instagram"></i></a><a href="#"><i class="fab fa-twitter"></i></a><a href="#"><i class="fab fa-youtube"></i></a></div></div><div class="footer-links"><div><h4>Essential Machines</h4><ul><li><a href="#">Weight Machine</a></li><li><a href="#">Numbering Machine</a></li><li><a href="#">Packaging Essential</a></li><li><a href="#">Tissue Bags</a></li></ul></div><div><h4>Printing &amp; Box</h4><ul><li><a href="#">Customized Box</a></li><li><a href="#">Regular Box</a></li><li><a href="#">Die Cut Box</a></li><li><a href="#">Shoe Box</a></li></ul></div><div><h4>Information</h4><ul><li><a href="#">About Us</a></li><li><a href="#">Delivery Rules</a></li><li><a href="#">Privacy Policy</a></li><li><a href="#">Terms &amp; Conditions</a></li></ul></div></div><div class="footer-contact"><h4>Contact Us</h4><ul><li><i class="fas fa-map-marker-alt"></i><span>363/1 Elephant Road, Dhaka-1205. Near Eastern Mollika Shopping Complex</span></li><li><i class="fas fa-phone-alt"></i><span>+88-01567865139</span></li><li><i class="fas fa-envelope"></i><span>support@demostore.com</span></li></ul></div></div></div><div class="footer-bottom"><div class="container"><p>Copyright \xA9 2026 Demo-store. Created by Antigravity</p></div></div></footer></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _default = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { _default as default };
//# sourceMappingURL=default-0n3q3tjb.mjs.map
