async function signin (formData) {
  const { email, password } = formData;
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

    const result = await response.json();
    return result;
  } catch (err) {
    console.error('Error: failed to signup: ', err);
    throw err;
  } 
}

export default signin;