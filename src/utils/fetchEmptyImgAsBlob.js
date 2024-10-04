const fetchEmptyImgAsBlob = async imgUrl => {
  try {
    const response = await fetch(imgUrl);
    const blob = await response.blob();
    return blob;
  } catch(error) {
    console.error('Error: fetching image: ', error);
  }
}

export default fetchEmptyImgAsBlob