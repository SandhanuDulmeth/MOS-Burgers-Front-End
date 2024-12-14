document.addEventListener('DOMContentLoaded', () => {
    displayOrders();
});

function displayOrders() {
    const orderTableBody = document.getElementById('orderTableBody');
    const noOrdersMessage = document.getElementById('noOrdersMessage');
    const orders = JSON.parse(sessionStorage.getItem('orders')) || [];

    orderTableBody.innerHTML = '';
    if (orders.length === 0) {
        noOrdersMessage.style.display = 'block';
        return;
    }
    noOrdersMessage.style.display = 'none';

    orders.forEach((order, index) => {
        const row = document.createElement('tr');

        const itemsList = Array.isArray(order.items)
            ? order.items
                  .map(
                      (item) =>
                          `<li>${item.name || 'Unknown Item'} (x${item.quantity || 0}) - Rs. ${(
                              (item.price || 0) * (item.quantity || 0)
                          ).toFixed(2)}</li>`
                  )
                  .join('')
            : '<li>No items</li>';

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${order.customerName || 'No Name'}</td>
            <td>${order.contactNo || 'No Contact'}</td>
            <td><ul>${itemsList}</ul></td>
            <td>Rs. ${(order.discount || 0).toFixed(2)}</td>
            <td>Rs. ${(order.totalPrice || 0).toFixed(2)}</td>
            <td><button class="btn btn-warning btn-sm" onclick="printOrderReport(${index})">Print Order Report</button></td>
        `;
        orderTableBody.appendChild(row);
    });
}


function saveOrdersToSessionStorage(orders) {
    sessionStorage.setItem('orders', JSON.stringify(orders));
}

function addOrder(newOrder) {
    let orders = JSON.parse(sessionStorage.getItem('orders')) || [];
    orders.push(newOrder);
    saveOrdersToSessionStorage(orders);
    displayOrders(); 
}

function printOrderReport(index) {
    const orders = JSON.parse(sessionStorage.getItem('orders')) || [];
    const order = orders[index];

    if (order) {
        const { customerName = 'No Name', contactNo = 'No Contact' } = order;
        const items = Array.isArray(order.items) ? order.items : [];
        const discount = Number(order.discount) || 0;
        const totalPrice = Number(order.totalPrice) || 0;

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Header
        doc.setFontSize(24);
        doc.setTextColor(255, 165, 0);
        doc.text("MOS BURGERS", 105, 20, { align: "center" });

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("SALES INVOICE", 105, 30, { align: "center" });

        // Customer details
        doc.setFontSize(12);
        doc.text(`Date: ${new Date().toLocaleString()}`, 10, 40);
        doc.text(`Customer: ${customerName}`, 10, 50);

        // Table Header
        doc.setFontSize(14);
        doc.text("Item", 10, 70);
        doc.text("Qty", 100, 70);
        doc.text("Price", 130, 70);
        doc.text("Total", 170, 70);

        // Table Content
        doc.setFontSize(12);
        let yPosition = 80;
        items.forEach((item) => {
            const quantity = Number(item.quantity) || 0;
            const price = Number(item.price) || 0;
            const total = quantity * price;

            doc.text(item.name || 'Unknown Item', 10, yPosition);
            doc.text(quantity.toString(), 100, yPosition, { align: "left" });
            doc.text(`Rs.${price.toFixed(2)}`, 130, yPosition, { align: "left" });
            doc.text(`Rs.${total.toFixed(2)}`, 170, yPosition, { align: "left" });

            yPosition += 10;
        });

        // Footer
        doc.setFontSize(14);
        doc.setTextColor(255, 165, 0);
        doc.text(`Total Amount: Rs.${totalPrice.toFixed(2)}`, 170, yPosition + 10, { align: "right" });

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text("Thank you for dining with us!", 105, yPosition + 30, { align: "center" });
        doc.setFontSize(10);
        doc.text("MOS Burgers - Delicious burgers, happy customers!", 105, yPosition + 40, { align: "center" });
        doc.text("www.mosburgers.lk", 105, yPosition + 50, { align: "center" });

        doc.save(`MOS_BURGERS_Invoice_${index + 1}.pdf`);
    } else {
        alert('Order not found!');
    }
}
