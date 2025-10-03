const currentUser=JSON.parse(localStorage.getItem("currentUser"));
    const booking=JSON.parse(localStorage.getItem("confirmedBookings"));
  async  function generateInvoice() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // === HEADER ===
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(44, 62, 80);
  doc.text("EazyStay Invoice", 105, 20, null, null, "center");

  // Amber divider line
  doc.setDrawColor(255, 193, 7);
  doc.setLineWidth(1);
  doc.line(20, 25, 190, 25);

  // === BOOKING INFO ===
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(33, 33, 33);
  doc.text(`Booking ID: ${booking.id}`, 20, 40);
  doc.text(`User: ${currentUser.name}`, 20, 48);
  doc.text(`Check-in: ${booking.checkin}`, 20, 56);
  doc.text(`Check-out: ${booking.checkout}`, 20, 64);
  doc.text(`Nights: ${booking.nights}`, 20, 72);
  doc.text(`Rooms Requested: ${booking.requestedRooms}`, 20, 80);
  
  doc.text(`Selected Rooms:`, 20, 88, { maxWidth: 170 });
  let y = 96;
  booking.selectedRooms.forEach(room => {
      doc.text(`Room Type: ${room.type} | Price: Rs. ${room.price}`, 25, y);
      y += 8;
  });

  // === CHARGES ===
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 102, 204);
  doc.text("Charges", 20, 105);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(33, 33, 33);
  doc.text(`Subtotal: Rs.${booking.subtotal}`, 20, 115);
  doc.text(`Tax: Rs.${booking.tax}`, 20, 123);

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(200, 0, 0);
  doc.text(`Total: Rs.${booking.total}`, 20, 135);

  // === FOOTER ===
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100);
  doc.text("Thank you for booking with EazyStay!", 105, 160, null, null, "center");

  return doc;
}

// === DOWNLOAD ===
async function downloadInvoice() {
  const doc = await generateInvoice();
  doc.save("invoice.pdf");
}

// === PRINT ===
async function printInvoice() {
  const doc = await generateInvoice();
  doc.autoPrint();
  const pdfBlob = doc.output("bloburl");
  const printWindow = window.open(pdfBlob);
  // Some browsers auto-open print, but if not:
  if (printWindow) {
    printWindow.onload = function () {
      printWindow.focus();
      printWindow.print();
    };
  }
}

    function goBack() {
      localStorage.removeItem("confirmedBookings");
      localStorage.removeItem("bookingData");
      window.location.href = "/index.html";
    }