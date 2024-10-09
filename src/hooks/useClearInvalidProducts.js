// HOOKS
import React, { useEffect, useState, useRef } from 'react';
import { useQuery } from 'react-query';

// API
import getAllProducts from '/src/api/products/getAllProducts';
import checkAuthAndGetProfile from '/src/api/users/checkAuthAndGetProfile';

// STORE 
import { useCartStore, useWishlistStore } from '/src/store/store';

function useClearInvalidProducts () {

  const { data: user } = useQuery(['user'], checkAuthAndGetProfile);
  const { data: products } = useQuery(['products'], getAllProducts);

  const filterInvalidCartProducts = useCartStore(state => state.filterInvalidCartProducts);
  const filterInvalidWishlistProducts = useWishlistStore(state => state.filterInvalidWishlistProducts);

  useEffect(() => {
    if (products) {
      filterInvalidCartProducts(products);
      filterInvalidWishlistProducts(products);
    }  
  }, [ products ]);
}

export default useClearInvalidProducts;