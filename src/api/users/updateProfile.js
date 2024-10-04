async function updateProfile ({ profileData, userId, newProfile}) {
  try {
    const uri = `${import.meta.env.VITE_BACKEND_URI}/api/v1/user/profile/${userId}`
    const response = await fetch(uri, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(profileData)
    })
    if (!response.ok) throw new Error ('failed to update profile');

    const updatedUser = await response.json();
    if (!updatedUser) ('unknown error has accured');


    // Upload new profile if there's
    if (newProfile) {
      const body = new FormData();
      body.append('file', newProfile);
      const uploadUri = `${import.meta.env.VITE_BACKEND_URI}/api/v1/uploads/profiles/${userId}`;
      await fetch(uploadUri, {
        method: 'POST',
        body
      })
    }

    return updatedUser;
  } catch (err) {
    console.error('Error while updaing profile: ', err);
    throw err;
  }
}

export default updateProfile;