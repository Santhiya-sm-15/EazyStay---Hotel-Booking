var hamburger_btn=document.getElementById("hamburger-btn");
var sidebar=document.getElementById("sidebar");
hamburger_btn.addEventListener("click",function() {
  sidebar.classList.toggle("hidden");
});
       
var close_btn=document.getElementById("close-btn");
close_btn.addEventListener("click",function() {
  sidebar.classList.toggle("hidden");
});

let currentUser=JSON.parse(localStorage.getItem("currentUser"));
const navLogin = document.getElementById('nav-login');
const navUserDropdown = document.getElementById('nav-user-dropdown');
const navUsername = document.getElementById('nav-username');

if (currentUser && currentUser.status=="login") {
    navLogin.classList.add('hidden');
    navUserDropdown.classList.remove('hidden');
    navUsername.textContent = currentUser.name;
} else {
    navLogin.classList.remove('hidden');
    navUserDropdown.classList.add('hidden');
}

document.getElementById("profile").addEventListener("click",function(){
    window.location.href="../profile/profile.html";
});

const navUserBtn = document.getElementById('nav-user-btn');
const navUserMenu = document.getElementById('nav-user-menu');
const navDropdownArrow = document.getElementById('nav-dropdown-arrow');
const navLogoutBtn = document.getElementById('nav-logout-btn');

// Toggle user dropdown
navUserBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    navUserMenu.classList.toggle('hidden');
    navDropdownArrow.classList.toggle('rotate-180');
});

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    if (navUserMenu && !navUserBtn.contains(e.target) && !navUserMenu.contains(e.target)) {
        navUserMenu.classList.add('hidden');
        navDropdownArrow.classList.remove('rotate-180');
    }
});

navLogoutBtn.addEventListener('click',logout);

async function logout() {
  await fetch(`http://localhost:5000/users/${currentUser.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "logout" }),
  });
  window.location.href = "/index.html";
  localStorage.removeItem("currentUser");
}

const BOOKINGS_URL = "http://localhost:5000/bookings";
const USERS_URL = "http://localhost:5000/users";
const ROOMS_URL = "http://localhost:5000/rooms";
const TRANS_URL = "http://localhost:5000/transactions";
const FEEDBACK_URL = "http://localhost:5000/feedbacks";

// ==================== State ====================
let bookings = [];
let users = [];
let rooms = [];
let filteredBookings = [];
let currentPage = 1;
const rowsPerPage = 5;
let totalPages = 1;
let bookingsAllUsers = [];

// ==================== Fetch All Data ====================
async function fetchData() {
  try {
    const [bRes, uRes, rRes, tRes, fRes] = await Promise.all([
      fetch(BOOKINGS_URL),
      fetch(USERS_URL),
      fetch(ROOMS_URL),
      fetch(TRANS_URL),
      fetch(FEEDBACK_URL)
    ]);
    bookingsAllUsers = await bRes.json();
    users = await uRes.json();
    rooms = await rRes.json();
    transactions = await tRes.json();
    feedbacks = await fRes.json();

    // Map bookings with customer name & room types
    bookings = bookingsAllUsers
    .filter(b => b.user == currentUser.id)   // only this user’s bookings
    .map(b => {
      const customer = users.find(u => u.id == b.user)?.name || b.customerId;
      const bookedRooms = (b.selectedRooms || []).map(rid => 
        rooms.find(r => r.id == rid) || { id: rid }
      );
      const roomTypes = bookedRooms.map(r => r.type);
      const trans = transactions.filter(t => t.bookingId == b.id);
      const feed = feedbacks.find(f=>f.bookingId==b.id);

      return { ...b, customerName: customer, bookedRooms, roomTypes, trans ,feedback:feed};
    });
    filteredBookings = [...bookings];
    renderTable();
  } catch (err) {
    console.error("Error fetching data:", err);
  }
}

document.addEventListener('DOMContentLoaded', function() {
    renderTable();
    initializeEventListeners();
});

function initializeEventListeners() {
  // Star rating functionality
  document.querySelectorAll('.star').forEach(star => {
    star.addEventListener('click', function() {
      currentRating = parseInt(this.getAttribute('data-rating'));
      updateStarRating(currentRating);
    });

    star.addEventListener('mouseover', function() {
      const rating = parseInt(this.getAttribute('data-rating'));
      updateStarRating(rating);
    });
  });

  document.querySelector('.star-rating').addEventListener('mouseleave', function() {
    updateStarRating(currentRating);
  });

  // Other existing event listeners...
  document.getElementById('hamburger-btn').addEventListener('click', function() {
    document.getElementById('sidebar').classList.remove('hidden');
  });

  document.getElementById('close-btn').addEventListener('click', function() {
    document.getElementById('sidebar').classList.add('hidden');
  });

  document.getElementById('toggleFilters').addEventListener('click', function() {
    const panel = document.getElementById('filterPanel');
    panel.classList.toggle('hidden');
  });
}

function updateStarRating(rating) {
  document.querySelectorAll('.star').forEach((star, index) => {
    if (index < rating) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });
}

function addFeedback(bookingId) {
  currentBookingId = bookingId;
  currentRating = 0;
  openFeedbackModal();
  document.getElementById('feedbackModalTitle').textContent = 'Add Feedback';
  document.getElementById('feedbackComment').value = '';
  document.getElementById('saveFeedbackBtn').textContent = 'Save Feedback';
  document.getElementById('deleteFeedbackBtn').classList.add('hidden');
    
  updateStarRating(0);
  document.getElementById('feedbackModal').classList.remove('hidden');
  document.getElementById('feedbackModal').classList.add('flex');
}

function editFeedback(bookingId) {
  currentBookingId = bookingId;
  const booking = bookings.find(b => b.id === bookingId);
  openFeedbackModal(booking.feedbackId)
  if (booking && booking.feedback) {
    currentRating = booking.feedback.rating;
        
    document.getElementById('feedbackModalTitle').textContent = 'Edit Feedback';
    document.getElementById('feedbackComment').value = booking.feedback.comment;
    document.getElementById('saveFeedbackBtn').textContent = 'Update Feedback';
    document.getElementById('deleteFeedbackBtn').classList.remove('hidden');
          
    updateStarRating(currentRating);
    document.getElementById('feedbackModal').classList.remove('hidden');
    document.getElementById('feedbackModal').classList.add('flex');
  }
}

function closeFeedbackModal() {
  document.getElementById('feedbackModal').classList.add('hidden');
  document.getElementById('feedbackModal').classList.remove('flex');
  currentBookingId = null;
  currentRating = 0;
}

// ==================== Render Table ====================
function renderTable() {
  const tbody = document.getElementById("bookingTableBody");
  tbody.innerHTML = "";

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageData = filteredBookings.slice(start, end);

  const today = new Date().setHours(0, 0, 0, 0); // normalize

  if(pageData.length==0) {
    bookingTableBody.innerHTML = `<tr><td colspan="8" class="py-6">No bookings found</td></tr>`;
  } else {
    pageData.forEach(b => {
      const checkin = new Date(b.checkin).setHours(0, 0, 0, 0);
      const checkout = new Date(b.checkout).setHours(0, 0, 0, 0);

      const feedbackContent = (() => {
        if (b.status !== "Completed") return "-";
        if (!b.feedback) 
          return `<button onclick="addFeedback('${b.id}')" class="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded text-xs">Add Feedback</button>`;
        return `<button onclick="editFeedback('${b.id}')" class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs">Edit Feedback</button>`;
      })();
      let statusContent = "";

      if (b.status=="Completed") {
        // Past booking
        statusContent = `<span class="text-gray-600 font-semibold">Completed</span>`;
      } else if (b.status=="Upcoming") {
        // Upcoming booking
        statusContent = `
          <div class="flex flex-col items-center gap-1">
            <span class="text-green-600 font-semibold">Upcoming</span>
            <div class="flex gap-1">
              <button onclick="openEditBooking('${b.id}')"
                class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs">
                Edit
              </button>
              <button onclick="cancelBooking('${b.id}')"
                class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs">
                Cancel
              </button>
            </div>
          </div>
        `;
      } else if(b.status=="Ongoing"){
        // Ongoing booking
        statusContent = `<span class="text-amber-600 font-semibold">Ongoing</span>`;
      }
      else {
        //  Cancelled booking
        statusContent = `<span class="text-red-400 font-semibold">Cancelled</span>`;
      }

      const row = `
        <tr class="border-b">
          <td class="p-2">${b.id}</td>
          <td class="p-2">${b.checkin}</td>
          <td class="p-2">${b.checkout}</td>
          <td class="p-2">${statusContent}</td>
          <td class="p-2">${feedbackContent}</td>
          <td class="p-2">
            <button class="bg-gradient-to-r from-amber-300 to-amber-500 rounded-xl px-3 py-1" onclick="viewBooking('${b.id}')">View</button>
          </td>
        </tr>
      `;
      tbody.innerHTML += row;
    });
  }
  renderPagination();
}

// ==================== Pagination ====================
function renderPagination() {
  const controls = document.getElementById("paginationControls");
  controls.innerHTML = "";
  totalPages = Math.ceil(filteredBookings.length / rowsPerPage);

  // Prev
  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Prev";
  prevBtn.className = "px-3 py-1 border rounded bg-gray-200 mr-2";
  prevBtn.disabled = currentPage === 1;
  if(currentPage==1)
    prevBtn.classList.add("opacity-60");
  else
    prevBtn.classList.remove("opacity-60");
  prevBtn.onclick = () => { currentPage--; renderTable(); };
  controls.appendChild(prevBtn);

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = `px-3 py-1 border rounded mx-1 ${i === currentPage ? "bg-gradient-to-r from-amber-300 to-amber-500" : "bg-white"}`;
    btn.onclick = () => { currentPage = i; renderTable(); };
    controls.appendChild(btn);
  }

  // Next
  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";
  nextBtn.className = "px-3 py-1 border rounded bg-gray-200 ml-2";
  nextBtn.disabled = currentPage === totalPages;
  if(currentPage==totalPages)
    nextBtn.classList.add("opacity-60");
  else
    nextBtn.classList.remove("opacity-60");
  nextBtn.onclick = () => { currentPage++; renderTable(); };
  controls.appendChild(nextBtn);
}

// ==================== Search ====================
document.getElementById("searchInput").addEventListener("input", function() {
  const q = this.value.toLowerCase();
  filteredBookings = bookings.filter(b =>
    b.id.toLowerCase().includes(q) ||
    b.roomTypes.join(", ").toLowerCase().includes(q) ||
    b.checkin.toLowerCase().includes(q) ||
    b.checkout.toLowerCase().includes(q) ||
    b.status.toLowerCase().includes(q)
  );
  currentPage = 1;
  renderTable();
});

// ==================== Filters ====================
function applyFilters() {
  const statusChecked = Array.from(document.querySelectorAll(".filter-status:checked")).map(cb => cb.value);
  const typeChecked = Array.from(document.querySelectorAll(".filter-room-type:checked")).map(cb => cb.value);
  const start = document.getElementById("startDate").value;
  const end = document.getElementById("endDate").value;
  filteredBookings = bookings.filter(b => {
    // Status filter
    const statusMatch = statusChecked.length === 0 || statusChecked.includes(b.status);

    // Room type filter
    const typeMatch = typeChecked.length === 0 || b.roomTypes.some(rt => typeChecked.includes(rt));

    // Date range filter
    let dateMatch = true;
    const checkIn = new Date(b.checkin);
    const checkOut = new Date(b.checkout);
    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;

    const afterStart = !startDate || checkOut >= startDate;
    const beforeEnd = !endDate || checkIn <= endDate;
    dateMatch = afterStart && beforeEnd;

    return statusMatch && typeMatch && dateMatch;
  });

  currentPage = 1;
  renderTable();
  closeFilterPanel();
}

let selectedRating = 0;
let currentFeedbackId = null; // Track feedback being edited

// ====== STAR SELECTION ======
document.querySelectorAll(".star").forEach(star => {
  star.addEventListener("click", function () {
    selectedRating = this.dataset.rating;
    updateStars(selectedRating);
  });
});

function updateStars(rating) {
  document.querySelectorAll(".star").forEach(star => {
    star.style.color = star.dataset.rating <= rating ? "gold" : "gray";
  });
}

// ====== OPEN MODAL (Add / Edit) ======
async function openFeedbackModal(feedbackId = null) {
  const modal = document.getElementById("feedbackModal");
  modal.classList.remove("hidden");
  
  currentFeedbackId = feedbackId;

  if (feedbackId) {
    // Editing feedback -> fetch existing data
    try {
      const res = await fetch(`http://localhost:5000/feedbacks/${feedbackId}`);
      if (!res.ok) throw new Error("Feedback not found");
      const feedback = await res.json();
      document.getElementById("feedbackModalTitle").textContent = "Edit Feedback";
      document.getElementById("feedbackComment").value = feedback.comment;
      selectedRating = feedback.rating;
      updateStars(selectedRating);

      document.getElementById("deleteFeedbackBtn").classList.remove("hidden");
    } catch (err) {
      console.error("Error fetching feedback:", err);
      alert("Could not load feedback.");
      closeFeedbackModal();
    }
  } else {
    // Adding new feedback
    document.getElementById("feedbackModalTitle").textContent = "Add Feedback";
    document.getElementById("feedbackComment").value = "";
    selectedRating = 0;
    updateStars(0);

    document.getElementById("deleteFeedbackBtn").classList.add("hidden");
  }
}

// ====== SAVE FEEDBACK ======
async function saveFeedback() {
  const comment = document.getElementById("feedbackComment").value.trim();
  if (!selectedRating) {
    alert("Please select a rating!");
    return;
  }

  const payload = { rating: selectedRating, comment,bookingId:currentBookingId};

  try {
    let res;
    console.log(currentFeedbackId)
    if (currentFeedbackId) {
      // Update existing feedback
      res = await fetch(`http://localhost:5000/feedbacks/${currentFeedbackId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      // Add new feedback
      payload.date=new Date().toISOString().split('T')[0]
      res = await fetch(`http://localhost:5000/feedbacks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    if (!res.ok) throw new Error("Failed to save feedback");

    alert("Feedback saved successfully!");
    closeFeedbackModal();
    location.reload(); // reload list if needed
  } catch (err) {
    console.error(err);
    alert("Error saving feedback");
  }
}

// ====== DELETE FEEDBACK ======
async function deleteFeedback() {
  if (!currentFeedbackId) return;

  if (!confirm("Are you sure you want to delete this feedback?")) return;

  try {
    const res = await fetch(`http://localhost:5000/feedbacks/${currentFeedbackId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete feedback");

    alert("Feedback deleted successfully!");
    closeFeedbackModal();
    location.reload();
  } catch (err) {
    console.error(err);
    alert("Error deleting feedback");
  }
}

// ====== CLOSE MODAL ======
function closeFeedbackModal() {
  document.getElementById("feedbackModal").classList.add("hidden");
  currentFeedbackId = null;
  selectedRating = 0;
  updateStars(0);
}

// ==================== Filter Panel Toggle ====================
const filterBtn = document.getElementById("toggleFilters");
const filterPanel = document.getElementById("filterPanel");

filterBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  filterPanel.classList.toggle("hidden");
});

// Close panel when clicking outside
document.addEventListener("click", (e) => {
  if (!filterPanel.contains(e.target) && !filterBtn.contains(e.target)) {
    filterPanel.classList.add("hidden");
  }
});

function closeFilterPanel() {
  filterPanel.classList.add("hidden");
}

// ==================== View Booking ====================
function viewBooking(id) {
  const booking = bookings.find(b => b.id === id);
  if (!booking) return;

  const content = `
    <p><strong>ID:</strong> ${booking.id}</p>
    <p><strong>Customer:</strong> ${booking.customerName}</p>
    <p><strong>Rooms:</strong></p>
    <p>${
      booking.bookedRooms
        .map(r => `Type ${r.type} | Price ₹${r.price}`)
        .join("<br>")
    }</p>
    <p><strong>Check-in:</strong> ${booking.checkin}</p>
    <p><strong>Check-out:</strong> ${booking.checkout}</p>
    <p><strong>Payment:</strong></p>
    <p>
 <p>${
  booking.trans.length > 0
    ? booking.trans.map(r => `ID: ${r.id} | Amount: ₹${r.amount} | Mode: ${r.mode}`).join("<br>")
    : "No transactions"
}</p>
    <p><strong>Check-in:</strong> ${booking.checkin}</p>
    <p><strong>Check-out:</strong> ${booking.checkout}</p>
    <p><strong>Status:</strong> ${booking.status}</p>
  `;
  document.getElementById("viewBookingContent").innerHTML = content;
  document.getElementById("viewBookingModal").classList.remove("hidden");
  document.getElementById("viewBookingModal").classList.add("flex");
}

function closeViewBooking() {
  document.getElementById("viewBookingModal").classList.add("hidden");
  document.getElementById("viewBookingModal").classList.remove("flex");
}

// ==================== Init ====================
fetchData();

var today = new Date();
var yyyy = today.getFullYear();
var mm = String(today.getMonth() + 1).padStart(2, '0');
var dd = String(today.getDate()).padStart(2, '0');
var currentDate = `${yyyy}-${mm}-${dd}`;
var checkIn = document.getElementById("editCheckin");
var checkOut = document.getElementById("editCheckout");

// Set initial min attributes
checkIn.setAttribute("min", currentDate);
checkOut.setAttribute("min", currentDate);

// On check-in blur event
checkIn.addEventListener("change", function () {
    let dIn = new Date(checkIn.value);
    let todayDate = new Date(currentDate);
    if(checkIn.value==="")
        checkOut.setAttribute("min", currentDate);
    else if (dIn < todayDate) {
        alert("Check-in date cannot be before today");
        checkIn.value = "";
        checkOut.setAttribute("min", currentDate);
    } else {
        // Set check-out min to match check-in date
        checkOut.setAttribute("min", checkIn.value);

        // Auto-clear check-out if earlier than new min
        if (checkOut.value && new Date(checkOut.value) <= dIn) 
            checkOut.value = "";
    }
});

// On check-out blur event
checkOut.addEventListener("change", function () {
    let dIn = new Date(checkIn.value);
    let dOut = new Date(checkOut.value);

    if (!checkIn.value) {
        alert("Please select check-in date first");
        checkOut.value = "";
        checkOut.setAttribute("min", currentDate);
    } else if (dOut <= dIn) {
        alert("Check-out must be after check-in date");
        checkOut.value = "";
    }
});


let editBookingData = null;
let cancelBookingData = null;
let unavailableRooms = [];

// =============================
// EDIT BOOKING
// =============================
function openEditBooking(bookingId) {
  const booking = bookings.find(b => b.id == bookingId);
  if (!booking) return;

  editBookingData = booking;
  document.getElementById("editCheckin").value = booking.checkin;
  document.getElementById("editCheckout").value = booking.checkout;

  document.getElementById("editBookingModal").classList.remove("hidden");
  document.getElementById("editBookingModal").classList.add("flex");
}

function closeEditBooking() {
  document.getElementById("editBookingModal").classList.add("hidden");
  document.getElementById("editBookingModal").classList.remove("flex");
  // editBookingData = null;
}

// Helper: check if room is available for given dates
function isRoomAvailable(roomId, checkin, checkout, excludeBookingId = null) {
  const ci = new Date(checkin).setHours(0,0,0,0);
  const co = new Date(checkout).setHours(0,0,0,0);

  for (let b of bookingsAllUsers) {   // <--- Use ALL bookings
    if (b.id == excludeBookingId) continue;
    if (!b.selectedRooms?.includes(roomId)) continue;

    const bci = new Date(b.checkin).setHours(0,0,0,0);
    const bco = new Date(b.checkout).setHours(0,0,0,0);

    if (ci < bco && co > bci) {
      return false;
    }
  }
  return true;
}


// =============================
// CANCEL BOOKING
// =============================
function cancelBooking(bookingId, fromEdit = false) {
  const booking = bookings.find(b => b.id === bookingId);
  if (!booking) return;

  cancelBookingData = booking;
  const container = document.getElementById("bookingRoomList");
  container.innerHTML = "";

  booking.selectedRooms.forEach(roomId => {
    const r = rooms.find(room => room.id === roomId);
    if (!r) return;

    const isUnavailable = unavailableRooms.includes(roomId);

    const card = document.createElement("div");
    card.className = 'bg-white p-4 rounded-2xl shadow-md flex flex-col md:flex-row gap-4 items-center';
    card.innerHTML = `
      <div class="flex flex-col md:flex-row gap-4 flex-1">
        <img src="/images/gallery3.jpg" alt="${r.type}" class="w-36 h-36 object-cover rounded"/>
        <div>
          <h3 class="text-lg font-semibold">${r.type}</h3>
          <p class="text-sm text-gray-600 mt-2">${r.details || ""}</p>
          <div class="text-xs text-gray-500 mt-2">Capacity: ${r.capacity} · Bed: ${r.bedType}</div>
          <div class="text-sm text-gray-500 mt-1">₹${r.price} / night</div>
        </div>
      </div>
      <div>
        <input type="checkbox" class="cancel-room-checkbox" value="${r.id}" 
          ${isUnavailable ? "checked disabled" : ""}/>
      </div>
    `;
    container.appendChild(card);
  });

  document.getElementById("bookingRoomModal").classList.remove("hidden");
  document.getElementById("bookingRoomModal").classList.add("flex");
}

document.getElementById("closeBookingRoomModal").addEventListener("click", () => {
  document.getElementById("bookingRoomModal").classList.add("hidden");
  document.getElementById("bookingRoomModal").classList.remove("flex");
  cancelBookingData = null;
  unavailableRooms = [];
});


// =============================
// SAVE EDIT BOOKING
// =============================
async function saveEditBooking() {
  if (!editBookingData) return;

  const newCheckin = document.getElementById("editCheckin").value;
  const newCheckout = document.getElementById("editCheckout").value;

  if (!newCheckin || !newCheckout || newCheckin >= newCheckout) {
    alert("Please select valid check-in and check-out dates.");
    return;
  }

  // Check availability for each room
  unavailableRooms = [];
  for (let roomId of editBookingData.selectedRooms) {
    if (!isRoomAvailable(roomId, newCheckin, newCheckout, editBookingData.id)) {
      unavailableRooms.push(roomId);
    }
  }

  if (unavailableRooms.length > 0) {
    alert("Some rooms are unavailable for the selected dates.");
    closeEditBooking();
    cancelBooking(editBookingData.id, true);
    return;
  }

  // Calculate total for new dates
  const nights = (new Date(newCheckout) - new Date(newCheckin)) / (1000 * 60 * 60 * 24);
  let newTotal = 0;
  editBookingData.selectedRooms.forEach(roomId => {
    const r = rooms.find(r => r.id === roomId);
    if (r) newTotal += r.price * nights;
  });

  // Check if extra payment needed
  if (newTotal > editBookingData.total) {
    const extraPayment = newTotal - editBookingData.total;
    const con=confirm(`You need to pay ${extraPayment} amount`);
    if(!con){
      alert("No changes made!");
      closeEditBooking();
      return;
    }
    // Fetch existing transaction for this booking
    const transRes = await fetch("http://localhost:5000/transactions");
    const allTransactions = await transRes.json();
    const existingTx = allTransactions.find(t => t.bookingId === editBookingData.id);

    // Add transactionId to confirmedBookings if exists
    let newbookings={
      ...editBookingData,
      checkin: newCheckin,
      checkout: newCheckout,
      total: newTotal,
      nights,
      extraPayment,
      transactionId: existingTx ? existingTx.id : null // will show in payment page
    };
    console.log(newbookings)
    localStorage.setItem("confirmedBookings", JSON.stringify(newbookings));

    // Redirect to payment page for extra amount
    window.location.href = "/booking/bookingForm/bookingForm.html";
    return;
  }

  // No extra payment → update directly
  editBookingData.checkin = newCheckin;
  editBookingData.checkout = newCheckout;
  editBookingData.total = newTotal;

  await fetch(`${BOOKINGS_URL}/${editBookingData.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      checkin: newCheckin,
      checkout: newCheckout,
      total: newTotal,
    }),
  });

  // Update rooms JSON for availability
  editBookingData.selectedRooms.forEach(roomId => {
    const r = rooms.find(r => r.id === roomId);
    if (!r) return;
    const bookingIndex = r.bookings.findIndex(b => b.bookingId === editBookingData.id);
    if (bookingIndex >= 0) {
      r.bookings[bookingIndex].checkin = newCheckin;
      r.bookings[bookingIndex].checkout = newCheckout;
    }
  });

  closeEditBooking();
  renderTable();
}


// =============================
// CANCEL BOOKING
// =============================
document.getElementById("confirmBookingRooms").addEventListener("click", async () => {
  if (!cancelBookingData) return;

  const selected = Array.from(document.querySelectorAll(".cancel-room-checkbox:checked"))
    .map(cb => cb.value);

  if (selected.length === 0) {
    alert("Select at least one room to cancel.");
    return;
  }

  let con = confirm("Are you sure want to cancel the rooms?");
  if (!con) {
    alert("No changes made!");
    closeCancelModal();
    renderTable();
    return;
  }

  // --- Calculate refund percentage based on hours before checkin ---
  const today = new Date();
  const checkin = new Date(cancelBookingData.checkin);
  const diffHours = (checkin - today) / (1000 * 60 * 60);

  let refundPercent = 0;
  if (diffHours >= 48) refundPercent = 100;
  else if (diffHours >= 24) refundPercent = 80;

  // --- Calculate nights (whole days, at least 1) ---
  const ci = new Date(cancelBookingData.checkin);
  const co = new Date(cancelBookingData.checkout);
  const nights = Math.max(1, Math.round((co - ci) / (1000 * 60 * 60 * 24)));

  let refundAmount = 0;

  // --- If all rooms cancelled ---
  if (selected.length === cancelBookingData.selectedRooms.length) {
    refundAmount = (cancelBookingData.total || 0) * (refundPercent / 100);

    // Remove bookings from each room
    selected.forEach(roomId => {
      const r = rooms.find(room => room.id === roomId);
      if (r) {
        const bookingIndex = r.bookings.findIndex(b => b.bookingId === cancelBookingData.id);
        if (bookingIndex >= 0) r.bookings.splice(bookingIndex, 1);
      }
    });

    await fetch(`${BOOKINGS_URL}/${cancelBookingData.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "Cancelled",
        refund: refundAmount,
      }),
    });

    alert(`All rooms cancelled. Refund: ₹${refundAmount.toFixed(2)}. It will be processed in 2-3 days.`);
  } 
  // --- Partial cancellation ---
  else {
    // Calculate total amount of cancelled rooms
    let removedBaseAmount = 0;
    selected.forEach(roomId => {
      const r = rooms.find(room => room.id === roomId);
      if (r) {
        removedBaseAmount += r.price * nights;

        // Remove booking entry from room
        const bookingIndex = r.bookings.findIndex(b => b.bookingId === cancelBookingData.id);
        if (bookingIndex >= 0) r.bookings.splice(bookingIndex, 1);
      }
    });

    refundAmount = removedBaseAmount * (refundPercent / 100);

    // Update remaining rooms in the booking
    cancelBookingData.selectedRooms = cancelBookingData.selectedRooms.filter(r => !selected.includes(r));

    let newTotal = 0;
    cancelBookingData.selectedRooms.forEach(roomId => {
      const r = rooms.find(room => room.id === roomId);
      if (r) newTotal += r.price * nights;

      // Keep booking dates updated for remaining rooms
      const booking = r.bookings.find(b => b.bookingId === cancelBookingData.id);
      if (booking) {
        booking.checkin = cancelBookingData.checkin;
        booking.checkout = cancelBookingData.checkout;
      }
    });

    cancelBookingData.total = newTotal;

    await fetch(`${BOOKINGS_URL}/${cancelBookingData.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        total: cancelBookingData.total,
        selectedRooms: cancelBookingData.selectedRooms,
        refund: refundAmount > 0 ? refundAmount : undefined,
        status:"Rescheduled"
      }),
    });

    alert(refundAmount > 0 
      ? `Refund: ₹${refundAmount.toFixed(2)}. It will be processed in 2-3 days.`
      : "Rooms updated successfully.");
  }

  closeCancelModal();
  renderTable();
});

// helper
function closeCancelModal() {
  document.getElementById("bookingRoomModal").classList.add("hidden");
  document.getElementById("bookingRoomModal").classList.remove("flex");
  cancelBookingData = null;
  unavailableRooms = [];
}