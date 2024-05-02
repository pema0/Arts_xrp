const buyProduct = (e, xrpWalletAddress, price) => {
    e.preventDefault();
    document.getElementById("xrpWalletAddress").value = xrpWalletAddress
    document.getElementById("price").value = price
  };
  
  document.getElementById("confirmPurchase").addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const raddress = document.getElementById("xrpWalletAddress").value;
      const familyseed = document.getElementById("secretKey").value;
      const price = document.getElementById("price").value;
  
      const res = await axios({
        method: 'POST',
        url: 'http://127.0.0.1:3002/payment',
        data: {
          raddress,
          familyseed,
          price,
        },
      });
      if (res.data.status === "success") {
        alert(res.data.message);
        window.location.reload(true);
      }
      console.log('Product uploaded successfully');
    } catch (error) {
      console.error('Error uploading product', error);
    }
  });
  