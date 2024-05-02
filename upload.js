window.addEventListener("load", () => {
  const xrpWalletAddressInput = document.getElementById('xrpWalletAddress');
  const imageInput = document.getElementById('image');
  const descriptionInput = document.getElementById('description');
  const priceInput = document.getElementById('price');
  const addButton = document.getElementById('addArt');

  addButton.addEventListener('click', async () => {
    const xrpWalletAddress = xrpWalletAddressInput.value.trim();
    const imageFile = imageInput.files[0];
    const description = descriptionInput.value.trim();
    const price = priceInput.value.trim();

    if (!xrpWalletAddress || !imageFile || !description || !price) {
      alert('Please fill in all fields.');
      return;
    }

    const formData = new FormData();
    formData.append('xrpWalletAddress', xrpWalletAddress);
    formData.append('image', imageFile);
    formData.append('description', description);
    formData.append('price', price);

    try {
      const response = await axios({
        method: 'POST',
        url: '/uploadArt',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
        alert('Art uploaded successfully!');
      } else {
        alert('Error uploading art. Please try again later.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again later.');
    }
  });
});
