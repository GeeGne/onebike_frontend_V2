async function signout () {
  try {
    const uri = `${import.meta.env.VITE_BACKEND_URI}/api/v1/signout`;
    const response = await fetch(uri, {
      method: 'POST',
      credentials: 'include'
    });
    if (!response.ok) {
      const error = response.json()
      throw new Error (error.message);
    }

    const result = await response.json();
    setTimeout(() => window.scroll({top: 0, behavior: 'smooth'}), 500);
    return result;
  } catch (err) {
    console.error('Error while removed jwt token: ', err);
    throw err;
  }
}

export default signout;