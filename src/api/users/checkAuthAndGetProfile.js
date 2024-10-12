async function checkAuthAndGetProfile () {
  try {
    const uri = `${import.meta.env.VITE_BACKEND_URI}/api/v1/auth/me`
    const response = await fetch(uri, {
      method: 'GET',
      credentials: 'include'
    });
    if (!response.ok) {
      const error = response.json();
      throw new Error (error.messge);
    };

    const user = await response.json();
    return user;
  } catch (err) {
    console.info('note: ', err.message);
    return false;
  }
}

export default checkAuthAndGetProfile;