let items = [];
if (JSON.parse(localStorage.getItem("items")) == null) {
    console.log("done");
    loadInitialItems();
} else {
    items = JSON.parse(localStorage.getItem("items"));
    refreshTable();
}
let editingIndex = -1;

// submission
document.getElementById("itemForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const itemno = document.getElementById("itemno").value.trim();
    const itemtype = document.getElementById("itemtype").value.trim();
    const name = document.getElementById("name").value.trim();
    const price = document.getElementById("price").value.trim();
    const image = document.getElementById("image").files[0];

    if (
        itemno === "" ||
        itemtype === "" ||
        name === "" ||
        price === "" ||
        !image
    ) {
        alert("Please fill in all fields and select an image");
        return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = function () {
        const imageUrl = reader.result;

        if (editingIndex === -1) {
            addItem({ itemno, itemtype, name, price, imageUrl });
        } else {
            updateItem(editingIndex, {
                itemno,
                itemtype,
                name,
                price,
                imageUrl,
            });
            document.querySelector("#itemForm button").innerText = "Add Item";
            editingIndex = -1;
        }

        // Reset
        document.getElementById("itemForm").reset();
    };
});

// add
function addItem(item) {
    items.push(item);
    localStorage.setItem("items", JSON.stringify(items));
    addItemToTable(item, items.length - 1);
}

//update
function updateItem(index, updatedItem) {
    items[index] = updatedItem;
    updateItemInTable(index, updatedItem);
}

//add
function addItemToTable(item, index) {
    const tableBody = document.querySelector("#itemTable tbody");
    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${item.itemno}</td>
        <td>${item.itemtype}</td>
        <td>${item.name}</td>
        <td>${item.price}</td>
        <td><img src="${item.imageUrl}" alt="${item.name}" class="item-image"></td>
        <td class="actions">
            <button onclick="editItem(${index})" class="button">Edit</button>
            <button onclick="deleteItem(${index})" class="button">Delete</button>
        </td>
    `;

    tableBody.appendChild(row);
}

// update
function updateItemInTable(index, item) {
    const tableBody = document.querySelector("#itemTable tbody");
    const row = tableBody.rows[index];

    row.cells[0].innerText = item.itemno;
    row.cells[1].innerText = item.itemtype;
    row.cells[2].innerText = item.name;
    row.cells[3].innerText = item.price;
    row.cells[4].innerHTML = `<img src="${item.imageUrl}" alt="${item.name}" class="item-image">`;
}

//delete
function deleteItem(index) {
    items.splice(index, 1);
    refreshTable();
}

// edit
function editItem(index) {
    const item = items[index];
    document.getElementById("itemno").value = item.itemno;
    document.getElementById("itemtype").value = item.itemtype;
    document.getElementById("name").value = item.name;
    document.getElementById("price").value = item.price;

    document.querySelector("#itemForm button").innerText = "Update Item";
    editingIndex = index;
}

function searchItem() {
    const searchInput = document
        .getElementById("searchInput")
        .value.toLowerCase();
    const tableRows = document.querySelectorAll("#itemTable tbody tr");

    tableRows.forEach((row, index) => {
        const name = row.cells[2].innerText.toLowerCase();
        if (name.includes(searchInput)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}

function refreshTable() {
    const tableBody = document.querySelector("#itemTable tbody");
    tableBody.innerHTML = "";
    items.forEach((item, index) => {
        addItemToTable(item, index);
    });
}

// load
function loadInitialItems() {
    fetch("json/items.json")
        .then((response) => response.json())
        .then((data) => {
            data.forEach((item) => {
                items.push(item);
                addItem(item);
            });
            localStorage.setItem("items", JSON.stringify(data));
            console.log(data);
        });
    refreshTable();
}
