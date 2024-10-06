async function getBanners () {
  try {
    const uri = `${import.meta.env.VITE_BACKEND_URI}/api/v1/banners`;

    const response = await fetch(uri);
    if (!response.ok) {
      const error = await response.json();  
      throw new Error (error.message);
    } 
      
    const banners = await response.json();
    return banners
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export default getBanners;