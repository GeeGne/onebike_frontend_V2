async function deleteBanner (id) {
  try {
    const uri = `${import.meta.env.VITE_BACKEND_URI}/api/v1/banners/${id}`;
    
    const response = await fetch(uri, {
      method: 'DELETE',
      credentials: 'include'
    })
    if (!response.ok) {
      const error = await response.json();
      throw new Error (error.message);
    }

    const result = await response.json();
    return result;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export default deleteBanner;