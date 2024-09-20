// ZUSTAND
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// UTILS
import calculatePrice from '/src/utils/calculatePrice';

const useDataStore = create(
  (set, get) => ({
    user: false,
    setUser: user => set({ user }),
    userData: null,
    setUserData: data => set({ userData: {...get().userData, ...data} }),
    refreshUserData: 0,
    setRefreshUserData: refreshUserData => set({ refreshUserData }),
    resetUserDataToNull: () => set({userData: null}),

    products: [],
    setProducts: products => set({ products }),
    refreshProducts: 0,
    setRefreshProducts: refreshProducts => set({ refreshProducts }),

    rolesData: null,
    setRolesData: rolesData => set({ rolesData }),
    resetRolesDataToNull: () => set({ rolesData: null }),

    homePageBannersData: [],
    setHomePageBannersData: homePageBannersData => set({ homePageBannersData }),
    refreshHomePageBannersData: 0,
    setRefreshHomePageBannersData: refreshHomePageBannersData => set({ refreshHomePageBannersData }),
    resetHomePageBannersDataToNull: () => set({ homePageBannersData: [] }),

    websiteDetailsData: {},
    setWebsiteDetailsData: websiteDetailsData => set({ websiteDetailsData }),
    refreshWebsiteDetailsData: 0,
    setRefreshWebsiteDetailsData: refreshWebsiteDetailsData => set({ refreshWebsiteDetailsData }),
    resetWebsiteDetailsDataToNull: () => set({ websiteDetailsData: [] }),
  })
);

const isProductInWishlist = (wishlist ,product) => wishlist.some(item => item.id === product.id);
const useWishlistStore = create(
  persist(
    (set, get) => ({
      wishlist: [],
      addProductToWishlist: (product) => isProductInWishlist(get().wishlist, product) || set(state => ({ wishlist: [...state.wishlist, product] })),
      removeProductFromWishlist: (product) => set({wishlist: [...get().wishlist.filter(item => item.id !== product.id)]}),
      toggle: false,
      setToggle: (boolean) => set({toggle: boolean}),
      filterInvalidWishlistProducts: products => set(
        {wishlist: get().wishlist.filter(
          item => products.filter(product => product.state === 'available')
            .some(product => item.id === product.id)
          )
        }
      )
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

const updateQuantityAndCheckLimit = (prevAmount, newAmount) => {
  const totalAmount = prevAmount + newAmount;
  switch (true) {
    case totalAmount > 9:
      return 9;
    case totalAmount < 1:
      return 1;
    default:
      return totalAmount
  }
}
const newProduct = (product, quantity) => ({
  product,
  id: product.id, 
  quantity, 
  quantityPrice: calculatePrice(product.price, product.discount) * quantity, price: calculatePrice(product.price, product.discount)
})

const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],
      toggle: false,
      setToggle: boolean => set({toggle: boolean}),
      resetCart: () => set({cart: []}),
      isProductInCart: product => get().cart.some(item => item.id === product.id),
      updateProductQuantity: (product, quantity) => 
        set({
          cart: get().cart.map(item => 
            item.id === product.id 
              ? {...item, 
                quantity: updateQuantityAndCheckLimit(item.quantity, quantity),
                quantityPrice: calculatePrice(item.product.price, item.product.discount) * updateQuantityAndCheckLimit(item.quantity, quantity)
              }
              : {...item}
          )
        }),
      addProduct: (product, quantity) => set({cart: [...get().cart, newProduct(product, quantity)]}),
      addProductToCart: (product, quantity) => get().isProductInCart(product) ? get().updateProductQuantity(product, quantity) : get().addProduct(product, quantity),
      removeProductFromCart: product => set({cart: get().cart.filter(item => item.id !== product.id)}),
      filterInvalidCartProducts: products => set(
        {cart: get().cart.filter(
          item => products.filter(product => product.state === 'available')
            .some(product => item.id === product.id)
          )
        }
      )
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

const useOrderStore = create(
  persist(
    (set, get) => ({
      orderState: false,
      setOrderState: boolean => set({orderState: boolean}),
      headToCheckouts: false,
      setHeadToCheckouts: boolean => set({headToCheckouts: boolean})
    }),
    {
      name: 'order-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);


export {useWishlistStore, useCartStore, useOrderStore, useDataStore};