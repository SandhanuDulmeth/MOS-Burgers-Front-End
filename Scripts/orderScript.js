document.addEventListener('DOMContentLoaded', () => {
    displayOrders();
  });
  
  function displayOrders() {
    const ordersContainer = document.getElementById('ordersContainer');
    if (!ordersContainer) return;
  
    const orders = JSON.parse(sessionStorage.getItem('orders')) || [];
    ordersContainer.innerHTML = '';
  
    if (orders.length === 0) {
      document.getElementById('noOrdersMessage').style.display = 'block';
      return;
    } else {
      document.getElementById('noOrdersMessage').style.display = 'none';
    }
  
    orders.forEach((order, index) => {
      const card = document.createElement('div');
      card.className = 'card order-card';
  
      // Card header with Order number and Customer Name
      const header = document.createElement('div');
      header.className = 'card-header';
      header.innerHTML = `<strong>Order #${index + 1}</strong> - ${order.customerName || 'No Name'}`;
      card.appendChild(header);
  
      // Card body with details
      const body = document.createElement('div');
      body.className = 'card-body';
  
      let itemsList = '';
      if (Array.isArray(order.items) && order.items.length > 0) {
        itemsList = '<ul>';
        order.items.forEach(item => {
          const quantity = Number(item.quantity) || 0;
          const price = Number(item.price) || 0;
          itemsList += `<li>${item.name || 'Unknown Item'} (x${quantity}) - Rs. ${(price * quantity).toFixed(2)}</li>`;
        });
        itemsList += '</ul>';
      } else {
        itemsList = '<p>No items available.</p>';
      }
  
      const discount = Number(order.discount) || 0;
      const totalPrice = Number(order.totalPrice) || 0;
  
      body.innerHTML = `
        <p><strong>Contact:</strong> ${order.contactNo || 'No Contact'}</p>
        <p><strong>Items:</strong></p>
        ${itemsList}
        <p><strong>Discount:</strong> Rs. ${discount.toFixed(2)}</p>
        <p><strong>Total Price:</strong> Rs. ${totalPrice.toFixed(2)}</p>
      `;
  
      // Print Invoice Button
      const printBtn = document.createElement('button');
      printBtn.className = 'btn btn-custom mt-3';
      printBtn.innerText = 'Print Invoice';
      printBtn.onclick = () => printOrderReport(index);
      body.appendChild(printBtn);
  
      card.appendChild(body);
      ordersContainer.appendChild(card);
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
  
      doc.setFontSize(24);
      doc.setTextColor(255, 165, 0);
      doc.text("MOS BURGERS", 105, 20, null, null, "center");
  
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("SALES INVOICE", 105, 30, null, null, "center");
  
      doc.setFontSize(12);
      doc.text(`Date: ${new Date().toLocaleString()}`, 10, 40);
      doc.text(`Customer: ${customerName}`, 10, 50);
  
      doc.setFontSize(14);
      doc.text("Item", 10, 70);
      doc.text("Qty", 100, 70);
      doc.text("Price", 130, 70);
      doc.text("Total", 170, 70);
  
      doc.setFontSize(12);
      let yPosition = 80;
      items.forEach(item => {
        const quantity = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        const total = quantity * price;
  
        doc.text(item.name || 'Unknown Item', 10, yPosition);
        doc.text(quantity.toString(), 100, yPosition);
        doc.text(`Rs.${price.toFixed(2)}`, 130, yPosition);
        doc.text(`Rs.${total.toFixed(2)}`, 170, yPosition);
  
        yPosition += 10;
      });
  
      doc.setFontSize(14);
      doc.setTextColor(255, 165, 0);
      doc.text(`Total Amount: Rs.${totalPrice.toFixed(2)}`, 170, yPosition + 10, null, null, "right");
  
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("Thank you for dining with us!", 105, yPosition + 30, null, null, "center");
      doc.setFontSize(10);
      doc.text("MOS Burgers - Delicious burgers, happy customers!", 105, yPosition + 40, null, null, "center");
      doc.text("www.mosburgers.lk", 105, yPosition + 50, null, null, "center");
  
      doc.save(`MOS_BURGERS_Invoice_${index + 1}.pdf`);
    } else {
      alert('Order not found!');
    }
  }
  