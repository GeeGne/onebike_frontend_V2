async function signup (formData) {
  const {fname, lname, email, phone, password, newsLetter} = formData
  try {
    const uri = `${import.meta.env.VITE_BACKEND_URI}/api/v1/signup`;
    const response = await fetch(uri, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name: fname + lname, email, phone, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const user = await response.json();
    return user;
  } catch (err) {
    console.error('Error while signing up: ', err);
    throw err;
  }
}

export default signup;