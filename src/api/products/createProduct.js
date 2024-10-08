import fetchEmptyImgAsBlob from '/src/utils/fetchEmptyImgAsBlob';
import emptyImgURL from '/assets/img/empty/empty.webp';


async function createProduct ({ productData, productImage }) {
  try {
    // Add new product to db
    const uri = `${import.meta.env.VITE_BACKEND_URI}/api/v1/products`;
    const response = await fetch(uri, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify(productData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error (error.message);
    }
    const result = await response.json();

    // upload new product image to storage
    const uploadImg = productImage || await fetchEmptyImgAsBlob(emptyImgURL);
    const body = new FormData();
    body.append('file', uploadImg, `${result.productId}.webp`);
    const uploadUri = `${import.meta.env.VITE_BACKEND_URI}/api/v1/uploads/products/${result.productId}/${productData.face}/${productData.color}`;
    const response1 = await fetch(uploadUri, {
      method: 'POST',
      credentials: 'include',
      body
    });
    if (!response1.ok) {
      const error = await response1.json();
      throw new Error (error.message);
    }

    return result;
  } catch (err) {
    console.error('Error while creating new product: ', err.message);
    throw err;
  }

}

export default createProduct;