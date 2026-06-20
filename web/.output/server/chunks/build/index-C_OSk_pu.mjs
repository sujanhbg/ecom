import { ref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderClass, ssrRenderStyle, ssrInterpolate, ssrRenderAttr } from 'vue/server-renderer';

const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const currentSlide = ref(0);
    ref(null);
    const slides = [
      {
        image: "/images/slider_1.png",
        title: "Summer Fashion Sale",
        description: "Get up to 50% off on all summer clothing. New arrivals every week."
      },
      {
        image: "/images/slider_2.png",
        title: "Electronics & Gadgets",
        description: "Latest smartphones and smartwatches at unbeatable prices."
      },
      {
        image: "/images/slider_3.png",
        title: "Home Appliances",
        description: "Upgrade your home with our premium collection of appliances."
      },
      {
        image: "/images/slider_4.png",
        title: "Kids Collection",
        description: "Discover fun and comfortable clothes for your little ones."
      }
    ];
    const products = [
      {
        id: 1,
        title: "Elegant Summer Dress for Women",
        category: "Clothing",
        price: 1250,
        oldPrice: 1500,
        discount: 16,
        rating: 4,
        reviews: 24,
        image: "/images/product_1.png"
      },
      {
        id: 2,
        title: "Modern Smartphone X Pro",
        category: "Electronics",
        price: 45e3,
        oldPrice: 5e4,
        discount: 10,
        rating: 5,
        reviews: 128,
        image: "/images/product_2.png"
      },
      {
        id: 3,
        title: "Classic Casual Sneakers",
        category: "Footwear",
        price: 2500,
        oldPrice: null,
        discount: null,
        rating: 4,
        reviews: 56,
        image: "/images/product_3.png"
      },
      {
        id: 4,
        title: "Premium Leather Handbag",
        category: "Handbags",
        price: 3200,
        oldPrice: 4e3,
        discount: 20,
        rating: 5,
        reviews: 42,
        image: "/images/product_4.webp"
      },
      {
        id: 5,
        title: "Smart Fitness Watch Series 5",
        category: "Electronics",
        price: 3500,
        oldPrice: 4500,
        discount: 22,
        rating: 4,
        reviews: 89,
        image: "/images/product_5.webp"
      }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "main-content" }, _attrs))}><aside class="sidebar"><div class="sidebar-title"><i class="fas fa-bars"></i> Categories </div><ul class="sidebar-menu"><li><a href="#"><i class="fas fa-tshirt"></i> Clothing Item</a></li><li><a href="#"><i class="fas fa-shoe-prints"></i> Footwear Item</a></li><li><a href="#"><i class="fas fa-shopping-bag"></i> Handbags Item</a></li><li><a href="#"><i class="fas fa-clock"></i> Daily Needs Item</a></li><li><a href="#"><i class="fas fa-baby"></i> Children&#39;s World</a></li><li><a href="#"><i class="fas fa-laptop"></i> Electronics</a></li><li><a href="#"><i class="fas fa-home"></i> Home &amp; Kitchen</a></li><li><a href="#"><i class="fas fa-dumbbell"></i> Sports &amp; Outdoors</a></li><li><a href="#"><i class="fas fa-book"></i> Books &amp; Stationery</a></li><li><a href="#"><i class="fas fa-gift"></i> Gifts &amp; Crafts</a></li></ul></aside><div class="content-area"><div class="slider-container"><!--[-->`);
      ssrRenderList(slides, (slide, index) => {
        _push(`<div class="${ssrRenderClass([{ active: currentSlide.value === index }, "slide"])}" style="${ssrRenderStyle({ backgroundImage: `url(${slide.image})` })}"><div class="slider-content"><h2>${ssrInterpolate(slide.title)}</h2><p>${ssrInterpolate(slide.description)}</p><a href="#" class="btn">Shop Now</a></div></div>`);
      });
      _push(`<!--]--><div class="slider-controls"><!--[-->`);
      ssrRenderList(slides, (slide, index) => {
        _push(`<div class="${ssrRenderClass([{ active: currentSlide.value === index }, "slider-dot"])}"></div>`);
      });
      _push(`<!--]--></div></div><h3 class="section-title">Trendy Products</h3><div class="products-grid"><!--[-->`);
      ssrRenderList(products, (product) => {
        _push(`<div class="product-card">`);
        if (product.discount) {
          _push(`<div class="discount-badge">-${ssrInterpolate(product.discount)}%</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="product-image"><img${ssrRenderAttr("src", product.image)}${ssrRenderAttr("alt", product.title)}></div><div class="product-info"><span class="product-category">${ssrInterpolate(product.category)}</span><h4 class="product-title">${ssrInterpolate(product.title)}</h4><div class="product-rating"><div class="stars"><!--[-->`);
        ssrRenderList(5, (i) => {
          _push(`<i class="${ssrRenderClass([i <= product.rating ? "fas" : "far", "fa-star"])}"></i>`);
        });
        _push(`<!--]--></div><span class="rating-count">(${ssrInterpolate(product.reviews)})</span></div><div class="product-price"><span class="current-price">Tk ${ssrInterpolate(product.price)}</span>`);
        if (product.oldPrice) {
          _push(`<span class="old-price">Tk ${ssrInterpolate(product.oldPrice)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><button class="add-to-cart-btn">Add to Cart</button></div></div>`);
      });
      _push(`<!--]--></div></div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-C_OSk_pu.mjs.map
