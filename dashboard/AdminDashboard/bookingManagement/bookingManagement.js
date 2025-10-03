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
    if(currentUser && currentUser.role=="user")
        window.location.href="../profile/profile.html";
    else    
        window.location.href="../profile/profile.html";
});

document.getElementById("dashboard").addEventListener("click",function(){
    window.location.href="../dashboard/dashboard.html";
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

// ==================== State ====================
let bookings = [];
let users = [];
let rooms = [];
let filteredBookings = [];
let currentPage = 1;
const rowsPerPage = 5;
let totalPages = 1;

// ==================== Fetch All Data ====================
async function fetchData() {
  try {
    const [bRes, uRes, rRes, tRes] = await Promise.all([
      fetch(BOOKINGS_URL),
      fetch(USERS_URL),
      fetch(ROOMS_URL),
      fetch(TRANS_URL)
    ]);
    bookings = await bRes.json();
    users = await uRes.json();
    rooms = await rRes.json();
    transactions = await tRes.json();

    // Map bookings with customer name & room types
    bookings = bookings.map(b => {
      const customer = users.find(u => u.id == b.user)?.name || b.customerId;
      const bookedRooms = b.selectedRooms.map(rid => rooms.find(r => r.id == rid) || { id: rid });
      const roomTypes = bookedRooms.map(r => r.type); // ["Deluxe", "Suite"]
      const trans = transactions.filter(t=>t.bookingId==b.id);
      return {...b, customerName: customer, bookedRooms,roomTypes,trans};
    });

    filteredBookings = [...bookings];
    renderTable();
  } catch (err) {
    console.error("Error fetching data:", err);
  }
}

// ==================== Render Table ====================
function renderTable() {
  const tbody = document.getElementById("bookingTableBody");
  tbody.innerHTML = "";

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageData = filteredBookings.slice(start, end);
  if (pageData.length === 0) {
    bookingTableBody.innerHTML = `<tr><td colspan="8" class="py-6">No data found</td></tr>`;
  } else {
    pageData.forEach(b => {
      const row = `
        <tr class="border-b">
          <td class="p-2 text-sm sm:text-base">${b.id}</td>
          <td class="p-2 text-sm sm:text-base">${b.customerName}</td>
          <td class="p-2 text-sm sm:text-base">${b.checkin}</td>
          <td class="p-2 text-sm sm:text-base">${b.checkout}</td>
          <td class="p-2 text-sm sm:text-base">${b.status}</td>
          <td class="p-2 text-sm sm:text-base">
            <button class="bg-gradient-to-r from-amber-300 to-amber-500 px-3 py-1 rounded-xl" onclick="viewBooking('${b.id}')">View</button>
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
    prevBtn.classList.add("opacity-20");
  else
    prevBtn.classList.remove("opacity-20");
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
    nextBtn.classList.add("opacity-20");
  else
    nextBtn.classList.remove("opacity-20");
  nextBtn.onclick = () => { currentPage++; renderTable(); };
  controls.appendChild(nextBtn);
}

// ==================== Search ====================
document.getElementById("searchInput").addEventListener("input", function() {
  const q = this.value.toLowerCase();
  filteredBookings = bookings.filter(b =>
    (b.id && b.id.toLowerCase().includes(q)) ||
    (b.customerName && b.customerName.toLowerCase().includes(q)) ||
    (b.roomTypes && b.roomTypes.join(", ").toLowerCase().includes(q)) ||
    (b.checkIn && b.checkIn.toString().toLowerCase().includes(q)) ||
    (b.checkOut && b.checkOut.toString().toLowerCase().includes(q)) ||
    (b.status && b.status.toLowerCase().includes(q))
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
    const checkIn = new Date(b.checkIn);
    const checkOut = new Date(b.checkOut);
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

// ==================== Filter Panel Toggle ====================
const filterBtn = document.getElementById("toggleFilters");
const filterPanel = document.getElementById("filterPanel");

filterBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  filterPanel.classList.toggle("hidden");
});

// Close panel when clicking outside
document.addEventListener("click", (e) => {
  if (!filterPanel.contains(e.target) && !filterBtn.contains(e.target)) 
    filterPanel.classList.add("hidden");
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
    <p>${
      booking.trans.length > 0
        ? booking.trans.map(r => `ID: ${r.id} | Amount: ₹${r.amount} | Mode: ${r.mode}`).join("<br>")
        : "No transactions"
    }</p>
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

// ==================== Export ====================
document.getElementById("exportBtn").addEventListener("click", () => {
  const ws = XLSX.utils.json_to_sheet(filteredBookings);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Bookings");
  XLSX.writeFile(wb, "bookings.xlsx");
});

// ==================== Print ====================
document.getElementById("printBtn").addEventListener("click", () => {
  let printContent = document.getElementById("bookingTable").outerHTML;
  let win = window.open("", "", "width=900,height=700");
  win.document.write("<html><head><title>Print Bookings</title></head><body>");
  win.document.write(printContent);
  win.document.write("</body></html>");
  win.document.close();
  win.print();
});

// ==================== Init ====================
fetchData();