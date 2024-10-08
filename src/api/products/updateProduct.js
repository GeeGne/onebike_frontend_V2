async function updateProduct ({ productData, img, index }) {
  try {
    const { id, face, color } = productData;
    const uri = `${import.meta.env.VITE_BACKEND_URI}/api/v1/products/${id}`;
    const response = await fetch(uri, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(productData)
    })
    if (!response.ok) {
      const error = response.json();
      throw new Error (error.message);
    }

    const result = await response.json();

    if (img) {
      const body = new FormData();
      body.append('file', img);
      const uploadUri = `${import.meta.env.VITE_BACKEND_URI}/api/v1/uploads/products/${id}/${face}/${color}`;
      const uploadResponse = await fetch(uploadUri, {
        method: 'POST',
        credentials: 'include',
        body
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error (error.message);
      } 
    }
    // console.log({ result, index });
    return { result , index };
  } catch (err) {
    console.error('Error while updating product: ', err);
    throw err;
  }
}

export default updateProduct;