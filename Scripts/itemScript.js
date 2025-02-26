let customers = JSON.parse(localStorage.getItem('customers')) || [];
let items = [];
let cart = [];
let orders = [];

function normalizeItems(rawItems) {
  return rawItems.map((item, index) => {
    if (!item.itemno && !item.id) {
      item.itemno = index.toString();
    } else if (!item.itemno) {
      item.itemno = item.id;
    }
    return item;
  });
}

function loadItemsFromJSON() {
  return new Promise((resolve, reject) => {
    const cachedItems = localStorage.getItem('items');
    if (cachedItems) {
      items = normalizeItems(JSON.parse(cachedItems));
      console.log("Loaded items from localStorage:", items);
      resolve(items);
    } else {
      fetch("http://localhost:8080/itemController/get-Items")
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          items = normalizeItems(data);
          localStorage.setItem('items', JSON.stringify(items));
          console.log("Fetched items from database and saved to localStorage:", items);
          resolve(items);
        })
        .catch(error => {
          console.error('Error loading items:', error);
          reject(error);
        });
    }
  });
}

function getItemIdentifier(item) {
  return item.itemno;
}

function renderMenu(itemsToRender) {
  const menuContent = document.getElementById('menu-content');
  menuContent.innerHTML = '';
  menuContent.classList.add('row', 'row-cols-1', 'row-cols-md-3', 'g-4');

  itemsToRender.forEach((item) => {
    const identifier = getItemIdentifier(item);
    const card = document.createElement('div');
    card.classList.add('col');
    card.innerHTML = `
      <div class="card h-100">
        <img src="${item.imageUrl}" class="card-img-top" alt="${item.name}" style="height: 150px; object-fit: cover;">
        <div class="card-body">
          <h5 class="card-title">${item.name}</h5>
          <p class="card-text">Rs.${item.price}</p>
          <button style="background-color: #FB710C;" class="btn btn-add-item" onclick="addToCart('${identifier}')">Add to Cart</button>
        </div>
      </div>
    `;
    menuContent.appendChild(card);
  });
}

function filterCategory(category) {
  const filteredItems = items.filter(item => 
    item.itemType.trim().toLowerCase() === category.trim().toLowerCase()
  );
  console.log("Filtering for:", category, "Found:", filteredItems);
  renderMenu(filteredItems);
}

function addToCart(itemId) {
  const item = items.find(item => getItemIdentifier(item) === itemId);
  if (!item) {
    console.error("Item not found:", itemId);
    return;
  }
  let cartItem = cart.find(ci => getItemIdentifier(ci) === itemId);
  if (cartItem) {
    cartItem.quantity++;
  } else {
    cart.push({ ...item, quantity: 1 });
  }
  renderCart();
}

function renderCart() {
  const cartItems = document.getElementById('cart-items');
  cartItems.innerHTML = '';
  let totalPrice = 0;
  cart.forEach((cartItem, index) => {
    const cartItemElem = document.createElement('div');
    cartItemElem.classList.add('cart-item');
    cartItemElem.innerHTML = `
      <span>${cartItem.name} - Rs.${cartItem.price}</span>
      <input type="number" value="${cartItem.quantity}" min="1" onchange="updateQuantity(${index}, this.value)">
      <span>Rs.${(parseFloat(cartItem.price) * cartItem.quantity).toFixed(2)}</span>
      <button class="btn btn-danger btn-remove" onclick="removeFromCart(${index})">Remove</button>
    `;
    cartItems.appendChild(cartItemElem);
    totalPrice += parseFloat(cartItem.price) * cartItem.quantity;
  });
  document.getElementById('totalPrice').textContent = totalPrice.toFixed(2);
}

function updateQuantity(index, quantity) {
  quantity = parseInt(quantity);
  if (quantity < 1) quantity = 1;
  cart[index].quantity = quantity;
  renderCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

function calculateTotal() {
  const discount = parseFloat(document.getElementById('discount').value) || 0;
  let totalPrice = parseFloat(document.getElementById('totalPrice').textContent);
  totalPrice -= discount;
  if (totalPrice < 0) totalPrice = 0;
  return totalPrice.toFixed(2);
}

function showTotal() {
  const totalPrice = calculateTotal();
  alert(`The total price after discount is Rs.${totalPrice}`);
}

function placeOrder() {
  const customerName = document.getElementById('customerName').value.trim();
  const contactNo = document.getElementById('contactNo').value.trim();
  const discount = parseFloat(document.getElementById('discount').value) || 0;
  const totalPrice = calculateTotal();

  if (!customerName || !contactNo) {
    Swal.fire("Please enter customer information");
    return;
  }

  let existingCustomer = customers.find(customer => customer.name === customerName && customer.phone === contactNo);
  if (!existingCustomer) {
    const newCustomer = { name: customerName, phone: contactNo, email: '', address: '' };
    customers.push(newCustomer);
    localStorage.setItem('customers', JSON.stringify(customers));
    populateCustomerDropdown();
    Swal.fire("New customer added to customer list!");
  }

  const order = {
    customerName,
    contactNo,
    items: cart.map(cartItem => ({
      name: cartItem.name,
      price: cartItem.price,
      quantity: cartItem.quantity
    })),
    discount,
    totalPrice
  };

  orders.push(order);
  saveOrders();
  console.log('Order placed:', order);
  Swal.fire('Order placed successfully!');

  cart = [];
  document.getElementById('customerName').value = '';
  document.getElementById('contactNo').value = '';
  document.getElementById('discount').value = '';
  renderCart();
}

function populateCustomerDropdown() {
  const customerSelect = document.getElementById('existingCustomer');
  customerSelect.innerHTML = '<option value="">-- Select a customer --</option>';
  customers.forEach((customer, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = `${customer.name} (${customer.phone})`;
    customerSelect.appendChild(option);
  });
}

function fillCustomerInfo() {
  const selectedIndex = document.getElementById('existingCustomer').value;
  if (selectedIndex !== "") {
    const customer = customers[selectedIndex];
    document.getElementById('customerName').value = customer.name;
    document.getElementById('contactNo').value = customer.phone;
  } else {
    document.getElementById('customerName').value = '';
    document.getElementById('contactNo').value = '';
  }
}

function loadOrders() {
  try {
    orders = JSON.parse(sessionStorage.getItem('orders')) || [];
  } catch (error) {
    console.error('Error loading orders:', error);
    orders = [];
  }
}

function saveOrders() {
  sessionStorage.setItem('orders', JSON.stringify(orders));
}

window.onload = function() {
  loadItemsFromJSON().then(() => {
    renderMenu(items);
    loadOrders();
    renderCart();
    populateCustomerDropdown();
  });
};

document.getElementById('placeOrder').addEventListener('click', placeOrder);
