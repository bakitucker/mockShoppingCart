var addToCart = document.getElementsByClassName("fa-cart-plus");
var trash = document.getElementsByClassName("fa-trash");
var trashForCart = document.getElementsByClassName("fa-xmark");

Array.from(addToCart).forEach(function(element) {
      element.addEventListener('click', function(){
        const name = this.parentNode.parentNode.childNodes[1].innerText
        const price = this.parentNode.parentNode.childNodes[3].innerText
        fetch('messages', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            'name': name,
            'price': price,
            
          })
        })
        .then(response => {
          if (response.ok) return response.json()
        })
        .then(data => {
          console.log(data)
          alert ('added to cart!!')
          window.location.reload(true)
        })
      });
});


Array.from(trash).forEach(function(element) {
      element.addEventListener('click', function(){
        const name = this.parentNode.parentNode.childNodes[1].innerText
        const price = this.parentNode.parentNode.childNodes[3].innerText
        fetch('messages', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            'name': name,
            'price': price
          })
        }).then(function (response) {
          window.location.reload()
        })
      });
});



Array.from(trashForCart).forEach(function(element) {
  element.addEventListener('click', function(){
    const name = this.dataset.name;
    const price = this.dataset.price;
    fetch('deleteCartItem', {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'name': name,
        'price': price
      })
    }).then(function (response) {
      window.location.reload()
    })
  });
});
