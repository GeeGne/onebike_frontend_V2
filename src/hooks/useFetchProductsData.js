// HOOKS
import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';

// STORE
import { useDataStore, useCartStore, useWishlistStore } from '/src/store/store';

function useFetchProductsData () {
  const { filterInvalidWishlistProducts } = useWishlistStore();
  const { filterInvalidCartProducts } = useCartStore();

  const products = useQuery('products', async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/api/v1/products`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const { products } = await response.json();

      // filterInvalidCartProducts(productsData);
      // filterInvalidWishlistProducts(productsData);

      return products;
    } catch (err) {
      console.error('Error while fetching products: ', err.message);
      return false;
    }
  });
}

export default useFetchProductsData;