async function signin (formData) {
  const {email, password} = formData;
  try {
    const uri = `${import.meta.env.VITE_BACKEND_URI}/api/v1/signin`;
    const response = await fetch(uri, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error (error.message);
    }

    const user = await response.json();
    return user;
  } catch (err) {
    console.error('Error: failed to signup: ', err);
    // setAlertText(handleAuthError(err, en));
    setAlertText(err.message);
    setNewAlert(Math.random());
    return false;
  } 
}

export default signin;