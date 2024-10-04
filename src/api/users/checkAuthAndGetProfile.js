async function checkAuthAndGetProfile () {
  try {
    const uri = `${import.meta.env.VITE_BACKEND_URI}/api/v1/auth/me`
    const response = await fetch(uri, {
      method: 'POST',
      credentials: 'include'
    });
    if (!response.ok) throw new Error ('no user to auth');

    const user = await response.json();
    return user;
  } catch (err) {
    console.info('note: ', err.message);
    return null;
  }
}

export default checkAuthAndGetProfile;