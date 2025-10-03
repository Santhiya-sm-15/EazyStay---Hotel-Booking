function showTab(tabId) {
  document.querySelectorAll('#upi-btn, #credit-btn, #debit-btn, #net-btn').forEach(btn => {
    btn.classList.remove("bg-gradient-to-r", "from-amber-300", "to-amber-500");
    btn.classList.add("hover:bg-gradient-to-r", "from-amber-300", "to-amber-500");
  });

  // Add gradient to clicked button
  const activeBtn = document.getElementById(`${tabId}-btn`);
  activeBtn.classList.add("bg-gradient-to-r", "from-amber-300", "to-amber-500");
  activeBtn.classList.remove("hover:bg-gradient-to-r");
  document.querySelectorAll('.tab').forEach(tab => tab.classList.add('hidden'));
  document.getElementById(tabId).classList.remove('hidden');
}

async function validatePayment(type) {
  let valid = false;
  let msg = "";

  if(type === 'upi') {
    const upi = document.getElementById('upiId').value.trim();
    if(upi==="")
      msg="Enter UPI ID";
    else if(upi && upi.includes('@')) valid = true;
    else msg = "Invalid UPI ID";
  }

  if(type === 'credit') {
    const name = document.getElementById('cName').value.trim();
    const number = document.getElementById('cNumber').value.trim();
    const cvv = document.getElementById('cCVV').value.trim();
    const expiry = document.getElementById('cExpiry').value.trim();
    if(name==="")
      msg="Enter name";
    else if(number.length==0)
      msg="Enter your card number";
    else if(number.length<16)
      msg="Card number should be 16 digits";
    else if(cvv.length==0)
      msg="Enter CVV";
    else if(cvv.length<3)
      msg="CVV should be 3 digits";
    else if(expiry.length==0)
      msg="Enter expiry date";
    else if(name && number.length === 16 && !isNaN(number) && cvv.length === 3 && !isNaN(cvv) && /^([0-1][0-9])\/\d{2}$/.test(expiry)) 
      valid = true;
    else 
      msg = "Invalid Credit Card Details";
  }

  if(type === 'debit') {
    const name = document.getElementById('dName').value.trim();
    const number = document.getElementById('dNumber').value.trim();
    const cvv = document.getElementById('dCVV').value.trim();
    const expiry = document.getElementById('dExpiry').value.trim();
    if(name==="")
      msg="Enter name";
    else if(number.length==0)
      msg="Enter your card number";
    else if(number.length<16)
      msg="Card number should be 16 digits";
    else if(cvv.length==0)
      msg="Enter CVV";
    else if(cvv.length<3)
      msg="CVV should be 3 digits";
    else if(expiry.length==0)
      msg="Enter expiry date";
    else if(name && number.length === 16 && !isNaN(number) && cvv.length === 3 && !isNaN(cvv) && /^([0-1][0-9])\/\d{2}$/.test(expiry)) 
      valid = true;
    else 
      msg = "Invalid Debit Card Details";
  }

  if(type === 'net') {
    const bank = document.getElementById('bankSelect').value;
    if(bank) valid = true;
    else msg = "Please select a bank";
  }

  if (valid) {
    try {
        const API = "http://localhost:5000/bookings";
        const API_R = "http://localhost:5000/rooms";
        const TRAN_API = "http://localhost:5000/transactions";

        // Fetch confirmed booking
        const booking = JSON.parse(localStorage.getItem("confirmedBookings"));
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        const allBookingsRes = await fetch(API);
        const allBookings = await allBookingsRes.json();

        booking.user = currentUser.id;
        // Check if transactionid exists
        if (booking.transactionId) {
            // EXISTING BOOKING → PATCH only the necessary fields
            const updatedFields = {
              checkin: booking.checkin,
              checkout: booking.checkout,
              nights: booking.nights,
              total: booking.total + booking.extraPayment,
              status:"Rescheduled"
            };

          await fetch(`${API}/${booking.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedFields)
          });

          // Update rooms for new dates, do not change selectedRooms
          for (const roomId of booking.selectedRooms) {
            const res = await fetch(`${API_R}/${roomId}`);
            const room = await res.json();

            // Find the booking entry for this room and update dates
            const bIndex = room.bookings.findIndex(b => b.bookingId === booking.id);
            if (bIndex >= 0) {
                room.bookings[bIndex].from = booking.checkin;
                room.bookings[bIndex].to = booking.checkout;
            }

            await fetch(`${API_R}/${roomId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookings: room.bookings })
            });
          }
        } else {
          // NEW BOOKING → POST full object as before
          booking.id = `B${allBookings.length + 1}`;
          localStorage.setItem("confirmedBookings", JSON.stringify(booking));
          booking.selectedRooms=booking.selectedRooms.map(b=>b.id);
          booking.status="Upcoming";
          await fetch(`${API}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(booking)
          });
          // Update rooms for new booking
          for (const r of booking.selectedRooms) {
            const res = await fetch(`${API_R}/${r}`);
            const room = await res.json();
            room.bookings.push({
                from: booking.checkin,
                to: booking.checkout,
                bookingId: booking.id
            });
            await fetch(`${API_R}/${r}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookings: room.bookings })
            });
          }
        }

      // Record transaction
      let transaction = {
        bookingId: booking.id,
        mode: type,
        date: new Date().toISOString(),
        amount: booking.extraPayment || booking.total || 0
      };
      await fetch(TRAN_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction)
      });

      // Redirect
      window.location.href = "../paymentSuccess/paymentSuccess.html";

    } catch (err) { 
      alert("Something went wrong while processing payment");
    }
  }
  else {
    alert("Payment: " + msg);
  }
}