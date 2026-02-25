// ===============================
// DOM READY
// ===============================
document.addEventListener("DOMContentLoaded", () => {

  // Mobile menu
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (menuToggle && navLinks) {
    menuToggle.onclick = () => navLinks.classList.toggle("show");
  }

  // Smooth scroll
  window.scrollToSection = id => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  // Sticky navbar
  const navbar = document.querySelector(".navbar");
  window.addEventListener("scroll", () => {
    navbar?.classList.toggle("scrolled", window.scrollY > 20);
  });

  // Disable past date
  const dateInput = document.getElementById("date");
  if (dateInput) {
    dateInput.min = new Date().toISOString().split("T")[0];
  }

  // Reservation form
  const form = document.getElementById("reservationForm");
  if (form) {
    form.onsubmit = e => {
      e.preventDefault();
      Swal.fire("Table Reserved 🍽️", "See you soon!", "success");
      form.reset();
    };
  }
});


// ===============================
// BILL SYSTEM
// ===============================
let bill = [];
let total = 0;

window.addToBill = (item, price) => {
  bill.push({ item, price });
  total += price;
  updateBill();
};

function updateBill() {
  const billDiv = document.getElementById("billItems");
  const totalSpan = document.getElementById("totalAmount");

  if (!billDiv || !totalSpan) return;

  billDiv.innerHTML = bill.length
    ? bill.map((b, i) => `<p>${i + 1}. ${b.item} – ₹${b.price}</p>`).join("")
    : "<p>No items selected.</p>";

  totalSpan.textContent = total;
}


// ===============================
// PAYMENT UI
// ===============================
window.openPayment = () => {
  if (total === 0) {
    Swal.fire("Empty Bill", "Add items first 🍗", "warning");
    return;
  }

  Swal.fire({
    title: "Choose Payment Method",
    html: `
      <p><b>Total: ₹${total}</b></p><hr>
      <button onclick="startPayment('upi')" class="pay-btn primary">UPI</button>
      <button onclick="startPayment('card')" class="pay-btn">Card</button>
      <button onclick="startPayment('net')" class="pay-btn">Net Banking</button>
      <button onclick="startPayment('wallet')" class="pay-btn">Wallet</button>
      <button onclick="startPayment('cod')" class="pay-btn">Cash</button>
    `,
    showConfirmButton: false
  });
};


// ===============================
// PAYMENT PROCESS
// ===============================
function startPayment(method) {

  const methods = {
    upi: "UPI Payment",
    card: "Card Payment",
    net: "Net Banking",
    wallet: "Wallet",
    cod: "Cash / Pay at Counter"
  };

  Swal.fire({
    title: "Processing...",
    html: `Method: <b>${methods[method]}</b><br>Amount: ₹${total}`,
    timer: 2000,
    didOpen: () => Swal.showLoading(),
    allowOutsideClick: false
  }).then(() => {

    // COD always success
    if (method === "cod" || Math.random() > 0.3) {
      paymentSuccess(methods[method]);
    } else {
      Swal.fire("Payment Failed ❌", "Try again", "error");
    }
  });
}


// ===============================
// PAYMENT SUCCESS
// ===============================
function paymentSuccess(methodName) {
  const orderId = "RUCHI-" + Math.floor(100000 + Math.random() * 900000);
  const itemsCopy = [...bill];
  const totalCopy = total;

  Swal.fire({
    icon: "success",
    title: "Payment Successful 🎉",
    html: `
      <p><b>Order ID:</b> ${orderId}</p>
      <p><b>Method:</b> ${methodName}</p>
      <p><b>Total:</b> ₹${totalCopy}</p>
      <button onclick="printBill('${orderId}','${methodName}',${totalCopy})">
        🖨️ Print Bill
      </button>
    `
  });

  bill = [];
  total = 0;
  updateBill();

  window.printBill = (id, method, totalAmt) => {
    const win = window.open("", "", "width=400,height=600");
    win.document.write(`
      <h2>RUCHI Restaurant</h2>
      <p>Order ID: ${id}</p>
      <p>Payment: ${method}</p><hr>
      ${itemsCopy.map(i => `${i.item} - ₹${i.price}`).join("<br>")}
      <hr><b>Total: ₹${totalAmt}</b>
    `);
    win.print();
  };
}
let reservationBill = [];
let reservationTotal = 0;
function reserveTable() {
  const name = document.getElementById("resName").value;
  const date = document.getElementById("resDate").value;
  const time = document.getElementById("resTime").value;
  const persons = document.getElementById("resPersons").value;

  if (!name || !date || !time || !persons) {
    Swal.fire("Missing!", "All fields fill pannu machan 😅", "warning");
    return;
  }

  // Fixed reservation charge
  reservationBill = [{
    item: "Table Reservation Advance",
    price: 200
  }];
  reservationTotal = 200;

  Swal.fire({
    icon: "success",
    title: "Reservation Bill Generated 🧾",
    html: `
      <p><b>Name:</b> ${name}</p>
      <p><b>Date:</b> ${date}</p>
      <p><b>Time:</b> ${time}</p>
      <p><b>Persons:</b> ${persons}</p>
      <hr>
      <p><b>Advance Amount:</b> ₹${reservationTotal}</p>
    `,
    confirmButtonText: "Proceed to Payment 💳"
  }).then(() => {
    openReservationPayment();
  });
}
function openReservationPayment() {
  Swal.fire({
    title: "Pay Reservation Advance",
    html: `
      <button class="btn-primary full-width" onclick="reservationPaymentSuccess('UPI')">UPI</button><br><br>
      <button class="btn-outline full-width" onclick="reservationPaymentSuccess('Card')">Card</button><br><br>
      <button class="btn-outline full-width" onclick="reservationPaymentSuccess('Cash')">Cash</button>
    `,
    showConfirmButton: false
  });
}
function reservationPaymentSuccess(method) {
  Swal.fire({
    icon: "success",
    title: "Reservation Confirmed 🎉",
    html: `
      <p><b>Payment Method:</b> ${method}</p>
      <p><b>Paid:</b> ₹${reservationTotal}</p>
      <p>Your table is booked successfully 🍽️</p>
    `,
    confirmButtonColor: "#27ae60"
  });

  reservationBill = [];
  reservationTotal = 0;
}
let advanceAmount = 0;

document.getElementById("reservationForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const guests = document.getElementById("guests").value;

  // simple advance logic
  advanceAmount = guests * 100; // ₹100 per person

  // show in bill section
  document.getElementById("billItems").innerHTML = `
    <p><strong>Table Reserved for:</strong> ${name}</p>
    <p><strong>No of Guests:</strong> ${guests}</p>
    <p><strong>Advance Charge:</strong> ₹${advanceAmount}</p>
  `;

  document.getElementById("totalAmount").innerText = advanceAmount;

  Swal.fire({
    icon: "success",
    title: "Table Reserved!",
    text: "Advance added to your bill",
  });

  // auto scroll to bill
  document.getElementById("bill").scrollIntoView({ behavior: "smooth" });
});
function openPayment() {
  Swal.fire({
    title: "Proceed to Pay",
    text: `Pay Advance ₹${document.getElementById("totalAmount").innerText}`,
    icon: "info",
    showCancelButton: true,
    confirmButtonText: "Pay Now",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire(
        "Payment Successful 🎉",
        "Your table is confirmed!",
        "success"
      );
    }
  });
}
document.getElementById("reservationForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const guests = document.getElementById("guests").value;

  const whatsappNumber = "917305756375"; // un WhatsApp number

  const message = `
🍽️ *Table Reservation Request*

👤 Name: ${name}
📞 Phone: ${phone}
📅 Date: ${date}
⏰ Time: ${time}
👥 Guests: ${guests}

Please confirm my reservation.
`;

  const whatsappURL =
    "https://wa.me/" +
    whatsappNumber +
    "?text=" +
    encodeURIComponent(message);

  // open WhatsApp
  window.open(whatsappURL, "_blank");

  Swal.fire({
    icon: "success",
    title: "Redirecting to WhatsApp",
    text: "Sending your reservation details…",
  });

  // optional: reset form
  document.getElementById("reservationForm").reset();
});
