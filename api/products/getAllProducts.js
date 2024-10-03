async function getAllProducts () {
  try {
    // fetch all products
    const uri = `${import.meta.env.VITE_BACKEND_URI}/api/v1/products`
    const response = await fetch(uri);
    if (!response.ok) {
      const error = await response.json();
      throw new Error (error.message);
    }
    const result = await response.json();

    return result.products;
  } catch (err) {
    console.error('Error while fetching products: ', err.message);
    return null;
  }
}

export default getAllProducts;