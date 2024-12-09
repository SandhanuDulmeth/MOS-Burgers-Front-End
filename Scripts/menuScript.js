let items = [];

function init() {
    if (JSON.parse(localStorage.getItem("items")) == null) {
        fetch("json/items.json")
            .then((response) => response.json())
            .then((data) => {
                items = data;
                const newArray = items.map((_, index) => index);
                renderMenu(items, newArray);
            });
    } else {
        items = JSON.parse(localStorage.getItem("items"));
        const newArray = items.map((_, index) => index);
        renderMenu(items, newArray);
    }
}

let cart = [];
let orders = JSON.parse(localStorage.getItem("orders")) || [];

function renderMenu(items, code) {
    console.log(code); // Logs the array of indices
    const menuContent = document.getElementById("menu-content");
    menuContent.innerHTML = "";

    const row = document.createElement("div");
    row.classList.add("row");

    items.forEach((item, index) => {
        const col = document.createElement("div");
        col.classList.add("col-md-4", "mb-4");

        const card = document.createElement("div");
        card.classList.add("card", "h-100");

        card.innerHTML = `
            <img src="${item.imageUrl}" class="card-img-top" alt="${item.name}">
            <div class="card-body dark-brown">
                <h5 class="card-title">${item.name}</h5>
                <p class="card-text">Price: Rs.${item.price}</p>
                <button class="btn btn-primary btn-add-item button" onclick="addToCart(${code[index]})">Add item</button>
            </div>
        `;
        col.appendChild(card);
        row.appendChild(col);
    });

    menuContent.appendChild(row);
}

// function renderMenu(items) {
//     const menuContent = document.getElementById("menu-content");
//     menuContent.innerHTML = "";

//     const row = document.createElement("div");
//     row.classList.add("row");

//     items.forEach((item, index) => {
//         const col = document.createElement("div");
//         col.classList.add("col-md-4", "mb-4");

//         const card = document.createElement("div");
//         card.classList.add("card", "h-100");

//         card.innerHTML = `
//             <img src="${item.imageUrl}" class="card-img-top" alt="${item.name}">
//             <div class="card-body dark-brown">
//                 <h5 class="card-title">${item.name}</h5>
//                 <p class="card-text">Price: Rs.${item.price}</p>
//                 <button class="btn btn-primary btn-add-item button" onclick="addToCart(${index})">Add Item</button>
//             </div>
//         `;

//         col.appendChild(card);
//         row.appendChild(col);
//     });

//     menuContent.appendChild(row); // Add row to the menu content
// }

function filterCategory(category) {
    if (category === "All") {
        const newArray = items.map((_, index) => index);
        renderMenu(items, newArray);
    } else {
        const filteredIndices = items
            .map((item, index) => (item.itemtype === category ? index : null))
            .filter((index) => index !== null);
        console.log(filteredIndices);
        renderMenu(
            items.filter((item) => item.itemtype === category),
            filteredIndices
        );
    }
}

function addToCart(index) {
    const item = items[index];
    const cartItem = cart.find((cartItem) => cartItem.index === index);
    if (cartItem) {
        cartItem.quantity++;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    renderCart();
}

function renderCart() {
    const cartItems = document.getElementById("cart-items");
    cartItems.innerHTML = "";
    let totalPrice = 0;
    cart.forEach((cartItem, index) => {
        const cartItemElem = document.createElement("div");
        cartItemElem.classList.add("cart-item");
        cartItemElem.innerHTML = `
            <span>${cartItem.name} - Rs.${cartItem.price}</span>
            <input type="number" value="${
                cartItem.quantity
            }" min="1" onchange="updateQuantity(${index}, this.value)">
            <span>Rs.${(cartItem.price * cartItem.quantity).toFixed(2)}</span>
            <button class="btn btn-danger btn-remove" onclick="removeFromCart(${index})">Remove</button>
        `;
        cartItems.appendChild(cartItemElem);
        totalPrice += cartItem.price * cartItem.quantity;
    });
    document.getElementById("totalPrice").textContent = totalPrice.toFixed(2);
}

function updateQuantity(index, quantity) {
    if (quantity < 1) quantity = 1;
    cart[index].quantity = Number(quantity);
    renderCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
}

function calculateTotal() {
    const discount = Number(document.getElementById("discount").value) || 0;
    let totalPrice = cart.reduce(
        (total, cartItem) => total + cartItem.price * cartItem.quantity,
        0
    );
    return totalPrice - discount;
}

function showTotal() {
    const total = calculateTotal();
    document.getElementById("totalPrice").textContent = `${total.toFixed(2)}`;
}

function placeOrder() {
    const customerName = document.getElementById("customerName").value;
    const contactNo = document.getElementById("contactNo").value;
    const discount = Number(document.getElementById("discount").value) || 0;
    const totalPrice = calculateTotal();

    if (!customerName || !contactNo) {
        alert("Please enter customer information");
        return;
    }

    const order = {
        customerName,
        contactNo,
        items: cart.map((cartItem) => ({
            name: cartItem.name,
            price: cartItem.price,
            quantity: cartItem.quantity,
        })),
        discount,
        totalPrice,
    };
    orders.push(order);
    localStorage.setItem("orders", JSON.stringify(orders));

    console.log("Order placed:", order);
    //alert("Order placed successfully!");
    cart = [];
    document.getElementById("customerName").value = "";
    document.getElementById("contactNo").value = "";
    document.getElementById("discount").value = "";
    renderCart();
    //generatePDF(order);
    printBill(order);
}

document.getElementById("calculateTotal").addEventListener("click", showTotal);
document.getElementById("placeOrder").addEventListener("click", placeOrder);

window.onload = function () {
    init();
};
/////////////////
let customers = JSON.parse(localStorage.getItem("customers")) || [];
console.log(customers);

const searchInput = document.getElementById("searchInput");
const dropdownList = document.getElementById("dropdownList");

function filterData(query) {
    return customers.filter((customer) =>
        customer.name.toLowerCase().includes(query.toLowerCase())
    );
}

function displayDropdown(matches) {
    dropdownList.innerHTML = "";
    if (matches.length > 0) {
        matches.forEach((match) => {
            const li = document.createElement("li");
            li.classList.add("dropdown-item");
            li.textContent = match.name;
            li.onclick = () => selectCustomer(match);
            dropdownList.appendChild(li);
        });
        dropdownList.style.display = "block";
    } else {
        dropdownList.style.display = "none";
    }
}

function selectCustomer(customer) {
    const customerName = document.getElementById("customerName");
    const contactNo = document.getElementById("contactNo");

    searchInput.value = customer.name;
    customerName.value = customer.name;
    contactNo.value = customer.phone;
    dropdownList.style.display = "none";
}

searchInput.addEventListener("input", () => {
    const query = searchInput.value;
    const matches = filterData(query);
    displayDropdown(matches);
});

document.addEventListener("click", (event) => {
    if (
        !searchInput.contains(event.target) &&
        !dropdownList.contains(event.target)
    ) {
        dropdownList.style.display = "none";
    }
});

/////
window.printBill = function (order) {
    const total = order.totalPrice;
    const date = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    const billContent = `
            <html>
            <head>
                <title>MOS Burgers Bill</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                        background-color: #f5f5f5;
                    }
                    .bill-container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: white;
                        padding: 30px;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    .bill-header {
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    .company-name {
                        font-size: 28px;
                        font-weight: bold;
                        color: #f9b209;
                    }
                    .bill-title {
                        font-size: 20px;
                        color: #333;
                    }
                    .bill-details {
                        margin: 20px 0;
                        padding: 15px 0;
                        border-top: 1px solid #ddd;
                        border-bottom: 1px solid #ddd;
                    }
                    .detail-row {
                        display: flex;
                        justify-content: space-between;
                        margin: 5px 0;
                        color: #555;
                    }
                    .items-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                    }
                    .items-table th,
                    .items-table td {
                        padding: 10px 5px;
                        border-bottom: 1px solid #ddd;
                        text-align: left;
                        color: #333;
                    }
                    .items-table th {
                        font-weight: bold;
                    }
                    .total-section {
                        margin-top: 20px;
                        padding-top: 15px;
                        border-top: 1px solid #ddd;
                    }
                    .total-row {
                        display: flex;
                        justify-content: space-between;
                        font-size: 18px;
                        font-weight: bold;
                        color: #f9b209;
                    }
                    .thank-you {
                        text-align: center;
                        margin-top: 20px;
                        font-size: 16px;
                        color: #f9b209;
                    }
                    .footer {
                        margin-top: 30px;
                        text-align: center;
                        color: #888;
                        font-size: 14px;
                    }
                    @media print {
                        body {
                            background-color: white;
                        }
                        .bill-container {
                            box-shadow: none;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="bill-container">
                    <div class="bill-header">
                        <div class="company-name">MOS BURGERS</div>
                        <div class="bill-title">SALES INVOICE</div>
                    </div>
                    
                    <div class="bill-details">
                        <div class="detail-row">
                            <span>Date:</span>
                            <span>${date}</span>
                        </div>
                        <div class="detail-row">
                            <span>Customer:</span>
                            <span>${order.customerName}</span>
                        </div>
                    </div>

                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items
                                .map(
                                    (item) => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.quantity}</td>
                                    <td>Rs.${parseFloat(item.price).toFixed(
                                        2
                                    )}</td>
                                    <td>Rs.${(
                                        parseFloat(item.price) * item.quantity
                                    ).toFixed(2)}</td>
                                </tr>
                            `
                                )
                                .join("")}
                        </tbody>
                    </table>

                    <div class="total-section">
                        <div class="total-row">
                            <span>Total Amount:</span>
                            <span>Rs.${total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div class="thank-you">
                        Thank you for dining with us!
                    </div>
                    
                    <div class="footer">
                        <p>MOS Burgers - Delicious burgers, happy customers!</p>
                        <p> 🌐 www.mosburgers.lk</p>
                    </div>
                </div>
            </body>
            </html>
        `;

    const printWindow = window.open("", "", "height=800,width=800");
    printWindow.document.write(billContent);
    printWindow.document.close();
    printWindow.print();
};
