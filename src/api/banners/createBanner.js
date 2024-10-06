import fetchEmptyImgAsBlob from '/src/utils/fetchEmptyImgAsBlob';
import emptyImgURL from '/assets/img/empty/empty.webp';

async function createBanner ({ order, img }) {
  try {
    // Create new Banner record
    const uri = `${import.meta.env.VITE_BACKEND_URI}/api/v1/banners`;
    const response = await fetch(uri, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ order })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error (error.message);
    }

    const { result } = await response.json();
    console.log(result, 'result');
    // Upload banner Img
    const uploadImg = img || await fetchEmptyImgAsBlob(emptyImgURL);
    const body = new FormData();
    body.append('file', uploadImg);
    const uploadUri = `${import.meta.env.VITE_BACKEND_URI}/api/v1/uploads/banners/${result.insertId}`;
    const uploadResponse = await fetch(uploadUri, {
      method: 'POST',
      credentials: 'include',
      body
    })
    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      throw new Error (error.message);
    }

    return result;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export default createBanner;