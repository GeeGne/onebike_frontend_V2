async function updateBannerAlt ({ alt, id }) {
  try {
    const uri = `${import.meta.env.VITE_BACKEND_URI}/api/v1/banners/${id}`;
    const response = await fetch(uri, {
      method: 'PUT',
      headers: { 'Content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ alt })
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

export default updateBannerAlt;