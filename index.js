document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch('http://localhost:3002/getalldata');

    if (response.ok) {
      const data = await response.json();
      var productListHTML = ""; // Initialize productListHTML with an empty string
      data.data.forEach(element => {
        productListHTML += `<li class="product-item">
          <div class="product-card" tabindex="0">
            <figure class="product-banner">
              <img src="./uploads/${element.imageUrl}" alt="">
            </figure>
            <div class="product-content">
              <a href="#" class="h4 product-title"></a>
              <div>
                <div>
                  <div>
                    <h4>Description: ${element.description}</h4>
                    <p>Price: ${element.price}</p>
                    <a href="#" class="author-username">Owner: ${element.xrpWalletAddress}</a>
                    <button  onclick="buyProduct(event, '${element.price}', '${element.xrpWalletAddress}',)" type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal">buy</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </li>`
      });

      var productListDiv = document.getElementById("productlist");
      productListDiv.innerHTML = productListHTML;

    } else {
      throw new Error('Error fetching data');
    }
  } catch (error) {
    console.error(error);
  }
});


const buyProduct = (e, xrpWalletAddress, price) => {
  e.preventDefault();
  document.getElementById("xrpWalletAddress1").textContent = xrpWalletAddress;
  document.getElementById("price1").textContent = price; 
};

document.getElementById("confirmPurchase").addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    const raddress = document.getElementById("xrpWalletAddress1").textContent;
    const familyseed = document.getElementById("secretKey").value;
    const price = document.getElementById("price1").textContent;

    console.log(raddress,familyseed,price)

    const res = await axios({
      method: 'POST',
      url: '/payment',
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
    alert('Product uploaded successfully');
  } catch (error) {
    alert('Error uploading product', error);
  }
});
