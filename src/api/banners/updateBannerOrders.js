async function updateBannerOrders (banners) {
  try {
    const uri = `${import.meta.env.VITE_BACKEND_URI}/api/v1/banners`;
    const response = await fetch(uri, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(banners)
    })

    if (!response.ok) {
      const error = await response.json();
      throw new Error (error.message);
    }

    const result = await response.json();
    return result;
  } catch (err) {
    console.error(err)
    throw err;
  }
}

export default updateBannerOrders;