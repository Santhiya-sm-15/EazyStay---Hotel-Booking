var hamburger_btn=document.getElementById("hamburger-btn");
var sidebar=document.getElementById("sidebar");
hamburger_btn.addEventListener("click",function() {
  sidebar.classList.toggle("hidden");
});
       
var close_btn=document.getElementById("close-btn");
close_btn.addEventListener("click",function() {
  sidebar.classList.toggle("hidden");
});

document.getElementById("nav-login").addEventListener("click",function(){
    document.getElementById("login-modal").classList.remove("hidden");
});

document.getElementById("side-login").addEventListener("click",function(){
    document.getElementById("login-modal").classList.remove("hidden");
});

document.getElementById("login-change").addEventListener("click",function(){
    document.getElementById("signup-modal").classList.add("hidden");
    document.getElementById("login-modal").classList.remove("hidden");
});

document.getElementById("signup-change").addEventListener("click",function(){
document.getElementById("signup-modal").classList.remove("hidden");
    document.getElementById("login-modal").classList.add("hidden");
});

document.getElementById("reset-change").addEventListener("click",function(){
    document.getElementById("login-modal").classList.add("hidden");
    document.getElementById("reset-modal").classList.remove("hidden");
});

document.getElementById("forget-change").addEventListener("click",function(){
    document.getElementById("login-modal").classList.add("hidden");
    document.getElementById("forget-modal").classList.remove("hidden");
});

document.getElementById("close-signup-modal").addEventListener("click",function(){
  document.getElementById("signup-modal").classList.add("hidden");
});

document.getElementById("close-login-modal").addEventListener("click",function(){
  document.getElementById("login-modal").classList.add("hidden");
});

document.getElementById("close-reset-modal").addEventListener("click",function(){
  document.getElementById("reset-modal").classList.add("hidden");
});

document.getElementById("close-forget-modal").addEventListener("click",function(){
  document.getElementById("forget-modal").classList.add("hidden");
});

const currentUser=JSON.parse(localStorage.getItem("currentUser"));
const navLogin = document.getElementById('nav-login');
const navUserDropdown = document.getElementById('nav-user-dropdown');
const navUsername = document.getElementById('nav-username');
const sideUserSection = document.getElementById('side-user-section');
const sideUsername = document.getElementById('side-username');
const sideLogin = document.getElementById('side-login');

if (currentUser && currentUser.status=="login") {
    navLogin.classList.add('hidden');
    navUserDropdown.classList.remove('hidden');
    navUsername.textContent = currentUser.name;

    sideLogin.classList.add('hidden');
    sideUserSection.classList.remove('hidden');
    sideUsername.textContent = currentUser.name;
} else {
    navLogin.classList.remove('hidden');
    navUserDropdown.classList.add('hidden');
    
    sideLogin.classList.remove('hidden');
    sideUserSection.classList.add('hidden');
}

document.getElementById("nav-profile").addEventListener("click",function(){
    if(currentUser && currentUser.role=="user")
        window.location.href="/dashboard/UserDashboard/profile/profile.html";
    else    
        window.location.href="/dashboard/AdminDashboard/profile/profile.html";
});

document.getElementById("nav-dashboard").addEventListener("click",function(){
    window.location.href="/dashboard/AdminDashboard/dashboard/dashboard.html";
});
document.getElementById("nav-my-bookings").addEventListener("click",function(){
    window.location.href="/dashboard/UserDashboard/bookings/bookings.html";
});

document.getElementById("side-profile").addEventListener("click",function(){
    if(currentUser && currentUser.role=="user")
        window.location.href="/dashboard/UserDashboard/profile/profile.html";
    else    
        window.location.href="/dashboard/AdminDashboard/profile/profile.html";
});

document.getElementById("side-dashboard").addEventListener("click",function(){
    window.location.href="/dashboard/AdminDashboard/dashboard/dashboard.html";
});
document.getElementById("side-my-bookings").addEventListener("click",function(){
    window.location.href="/dashboard/UserDashboard/bookings/bookings.html";
});

if(currentUser && currentUser.role=="admin")
{
    document.getElementById("nav-my-bookings").classList.add("hidden");
    document.getElementById("nav-dashboard").classList.remove("hidden");
    document.getElementById("side-my-bookings").classList.add("hidden");
    document.getElementById("side-dashboard").classList.remove("hidden");
}
else
{
    document.getElementById("nav-dashboard").classList.add("hidden");
    document.getElementById("nav-my-bookings").classList.remove("hidden");
    document.getElementById("side-dashboard").classList.add("hidden");
    document.getElementById("side-my-bookings").classList.remove("hidden");
}

const navUserBtn = document.getElementById('nav-user-btn');
const navUserMenu = document.getElementById('nav-user-menu');
const navDropdownArrow = document.getElementById('nav-dropdown-arrow');
const navLogoutBtn = document.getElementById('nav-logout-btn');
const sideLogoutBtn = document.getElementById('side-logout-btn');

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

const API = "http://localhost:5000/users";

navLogoutBtn.addEventListener('click',logout);
sideLogoutBtn.addEventListener('click',logout);

async function logout() {
  await fetch(`${API}/${currentUser.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "logout" }),
  });
  localStorage.removeItem("currentUser");
}

(async function init() {
  var today = new Date();
  var yyyy = today.getFullYear();
  var mm = String(today.getMonth() + 1).padStart(2, '0');
  var dd = String(today.getDate()).padStart(2, '0');
  var currentDate = `${yyyy}-${mm}-${dd}`;
  var checkIn = document.getElementById("check-in");
  var checkOut = document.getElementById("check-out");

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
    renderRoomChoices();
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
  renderRoomChoices();
});

var tomorrow=new Date();
tomorrow.setDate(today.getDate()+1);
var yyyyn = tomorrow.getFullYear();
var mmn = String(tomorrow.getMonth() + 1).padStart(2, '0');
var ddn = String(tomorrow.getDate()).padStart(2, '0');
var currentNxtDate = `${yyyyn}-${mmn}-${ddn}`;
const bookingData = JSON.parse(localStorage.getItem('bookingData')) || {
  checkin: currentDate,   
  checkout: currentNxtDate,
  rooms: [{ roomNo: 1, guests: 1 }]                  
};
  
checkIn.value = bookingData['checkin'];
checkOut.value = bookingData['checkout'];

const toggleBtn = document.getElementById("guest-toggle");
const panel = document.getElementById("guest-panel");
const addPanel = document.getElementById("add");
const addRoomBtn = document.getElementById("add-room");
const removeRoomBtn = document.getElementById("remove-room");
const addRoomBtnWrapper = document.getElementById("add-room-btn");
const toggleFiltersBtn = document.getElementById('toggleFilters');
const filtersPanel = document.getElementById("filtersPanel");

let rooms = bookingData.rooms.length;

// Toggle dropdown
toggleBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  panel.classList.toggle("hidden");
});

// Build UI from bookingData
function renderRooms() {
  // Clear everything except add/remove buttons row
  addPanel.querySelectorAll("div").forEach(el => {
    if (el.id !== "add-room-btn") el.remove();
  });

  bookingData.rooms.forEach((room, i) => {
    const fullDiv = document.createElement("div");
    fullDiv.innerHTML = `
      <div class="flex justify-between items-center">
          <span class="font-semibold">Room ${i + 1}</span>
      </div>
      <div class="flex gap-2 sm:justify-between items-center">
          <span>Person(s)</span>
          <div class="flex items-center gap-3">
              <button class="decrement w-8 h-8 border rounded-full" data-index="${i}">-</button>
              <span class="people-count">${room.guests}</span>
              <button class="increment w-8 h-8 border rounded-full" data-index="${i}">+</button>
          </div>
      </div>
    `;
    addPanel.insertBefore(fullDiv, addRoomBtnWrapper);
  });
  updateLabel();
}

// compute total guests
function getTotalGuests() {
  return bookingData.rooms.reduce((sum, r) => sum + r.guests, 0);
}

// update button label
function updateLabel() {
  const guests = getTotalGuests();
  toggleBtn.textContent = `${guests} Guest${guests > 1 ? "s" : ""}, ${rooms} Room${rooms > 1 ? "s" : ""}`;
  localStorage.setItem("bookingData", JSON.stringify(bookingData));
}

// delegation: handle + / -
addPanel.addEventListener("click", (e) => {
  e.stopPropagation();
  const target = e.target;
  if (target.classList.contains("increment")) {
    const idx = target.dataset.index;
    bookingData.rooms[idx].guests++;
    renderRooms();
    resetSelections();
  }

  if (target.classList.contains("decrement")) {
    const idx = target.dataset.index;
    if (bookingData.rooms[idx].guests > 1) {
      bookingData.rooms[idx].guests--;
      renderRooms();
      resetSelections();
    }
  }
});

// Add room
addRoomBtn.addEventListener("click", async () => {
  const rRes=await fetch("http://localhost:5000/rooms");
  const res=await rRes.json();
  if(rooms==res.length)
  {
    alert("No more rooms available");
    return;
  }
  rooms++;
  bookingData.rooms.push({ roomNo: rooms, guests: 1 });
  renderRooms();
  resetSelections();
});

// Remove room
removeRoomBtn.addEventListener("click", () => {
  if (rooms > 1) {
    bookingData.rooms.pop();
    rooms--;
    renderRooms();
    resetSelections();
  }
});

// Initial render
renderRooms();

function parseDate(dateStr) {
  // dateStr expected in YYYY-MM-DD
  if (!dateStr) return null;
  const parts = dateStr.split('-').map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]); 
}

function formatDateShort(date) {
  if (!date) return '—';
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,'0');
  const d = String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}

// nights = checkout - checkin in full days
function getNights(checkinStr, checkoutStr) {
  const a = parseDate(checkinStr);
  const b = parseDate(checkoutStr);
  if (!a || !b) return 1;
  const msPerDay = 24*60*60*1000;
  const diff = b.getTime() - a.getTime();
  const nights = Math.max(0, Math.round(diff / msPerDay));
  return nights;
}

// overlap check for ranges [from, to) convention
function normalizeDateExclusive(dateStr) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1); // shift checkout to exclusive
  return d;
}

function rangesOverlap(aFrom, aTo, bFrom, bTo) {
  const aStart = new Date(aFrom);
  const aEnd   = normalizeDateExclusive(aTo);
  const bStart = new Date(bFrom);
  const bEnd   = normalizeDateExclusive(bTo);

  return aStart < bEnd && bStart < aEnd;
}


async function fetchRooms() {
  const res = await fetch("http://localhost:5000/rooms");
  return await res.json();
}

const checkin = bookingData['checkin'];
const checkout = bookingData['checkout'];

// display top summary
const nights = getNights(checkin, checkout);

document.getElementById('sideCheckin').innerText = checkin;
document.getElementById('sideCheckout').innerText = checkout;
document.getElementById('sideNights').innerText = nights;

// toggle filters
document.getElementById('toggleFilters').addEventListener('click', () => {
  const p = document.getElementById('filtersPanel');
  p.classList.toggle('hidden');
});

// load rooms
const roomsData = await fetchRooms();
const roomGuestRequests = bookingData.rooms.map(r => r.guests);

// selection state: how many per type (Deluxe, Suite, Family)
let selectedRooms= [];
let currentRoomIndex = 0;
let requestedRooms = roomGuestRequests.length;

// helper: is a room available for the requested date range?
function isRoomAvailableForRange(room) {
  if (room.status !== 'Available') return false;
  const checkinValue = document.getElementById("check-in").value;
  const checkoutValue = document.getElementById("check-out").value;

  if (room.status !== 'Available') return false;
  for (const b of room.bookings || []) {
    if (rangesOverlap(b.from, b.to, checkinValue, checkoutValue)) 
      return false;
  }
  return true;
}


// filter state
function getFilterState() {
  const types = Array.from(document.querySelectorAll('.filter-type:checked')).map(n => n.value);
  const prices = Array.from(document.querySelectorAll('.filter-price:checked')).map(n => n.value);
  return { types, prices };
}

function passesFilters(room, filters) {
  // type filter
  if (filters.types.length && !filters.types.includes(room.type)) return false;
  // price filter
  if (filters.prices.length) {
    let match = false;
    for (const pr of filters.prices) {
      if (pr === 'lt3000' && room.price < 3000) match = true;
      if (pr === '3000-4000' && room.price >= 3000 && room.price <= 4000) match = true;
      if (pr === 'gt4000' && room.price > 4000) match = true;
    }
    if (!match) return false;
  }
  return true;
}

document.getElementById("applyFiltersBtn").addEventListener("click", () => {
  renderRoomChoices(); 
  document.getElementById("filtersPanel").classList.add("hidden");
});

// Clear Filters button
document.getElementById("clearFiltersBtn").addEventListener("click", () => {
  document.querySelectorAll(".filter-type, .filter-price").forEach(el => {
    el.checked = false;
  });
  document.getElementById("filtersPanel").classList.add("hidden");
  renderRoomChoices();
});

checkIn.addEventListener('change', resetOnChange);
checkOut.addEventListener('change', resetOnChange);
document.getElementById("add-room").addEventListener('click', resetOnChange);
document.getElementById("remove-room").addEventListener('click', resetOnChange); 
// render one room choice at a time
function renderRoomChoices() {
  const guestsNeeded = bookingData.rooms[currentRoomIndex]?bookingData.rooms[currentRoomIndex].guests:1;
  const listEl = document.getElementById('roomList');
  listEl.innerHTML = `<h3 class="font-semibold mb-3"> Select Room ${currentRoomIndex + 1} (for ${guestsNeeded} guest${guestsNeeded>1?"s":""}) </h3>`;

  const filters = getFilterState();
  const available = roomsData.filter(r =>
    isRoomAvailableForRange(r) &&
    r.capacity >= guestsNeeded &&
    passesFilters(r, filters) &&
    !selectedRooms.some(s => s.id === r.id)
  );

  if (!available.length) {
    listEl.innerHTML += `<div class="text-gray-500">No rooms available for this selection.</div>`;
    return;
  }

  available.forEach(r => {
    const container = document.createElement('div');
    container.className = 'room-card bg-white p-4 rounded-2xl shadow-md shadow-gray-600 flex flex-col md:flex-row gap-4 cursor-pointer';
    container.dataset.id = r.id;
    container.innerHTML = `
      <div class="md:w-2/3 flex flex-col md:flex-row gap-4">
        <img src="${r.img}" alt="${r.type}" class="w-full md:w-48 h-36 object-cover rounded"/>
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">${r.type}</h3>
            <div class="text-sm text-gray-500">Price from <span class="font-bold text-amber-600">₹${r.price}</span> / night</div>
          </div>
          <p class="text-sm text-gray-600 mt-2">${r.details}</p>
          <div class="text-xs text-gray-500 mt-3">Capacity: ${r.capacity} · Bed: ${r.bedType} · Available</div>
        </div>
      </div>
      <div class="md:w-1/3 flex flex-col justify-center items-end">
        <button class="selectRoom hover:bg-gradient-to-r from-amber-400 to-amber-500 border-2 border-amber-400 px-3 py-1 rounded-2xl" data-id="${r.id}">Select</button>
      </div>
    `;
    listEl.appendChild(container);
  });

  // Delegate clicks on room cards
  document.addEventListener("click", (e) => {
    // check if click is inside a container but NOT on the Select button
    const card = e.target.closest(".room-card");
    if (card && !e.target.classList.contains("selectRoom")) {
      const roomId = card.dataset.id;
      const room = available.find(r => r.id == roomId);

      if (room) {
        document.getElementById("roomModalContent").innerHTML = `
          <h2 class="text-xl font-bold mb-2">${room.type}</h2>
          <img src="${room.img}" alt="${room.type}" class="w-full h-48 object-cover rounded mb-4"/>
          <p class="text-sm text-gray-600 mb-2">${room.details}</p>
          <div class="text-sm text-gray-700 mb-1"><strong>Price:</strong> ₹${room.price} / night</div>
          <div class="text-sm text-gray-700 mb-1"><strong>Capacity:</strong> ${room.capacity}</div>
          <div class="text-sm text-gray-700 mb-1"><strong>Bed Type:</strong> ${room.bedType}</div>
        `;
        document.getElementById("roomModal").classList.remove("hidden");
      }
    }
  });

  // Close modal
  document.getElementById("closeRoomModal").addEventListener("click", () => {
    document.getElementById("roomModal").classList.add("hidden");
  });

  document.querySelectorAll('.selectRoom').forEach(btn => {
    btn.onclick = () => {
      const room = roomsData.find(x => x.id == btn.dataset.id);
        selectedRooms.push({
          ...room,
          nights,
          lineSubtotal: room.price * nights
        });
        btn.disabled = true;
        btn.innerText = "Selected";
        btn.classList.add("bg-amber-500");
        currentRoomIndex++;
        if (currentRoomIndex < requestedRooms) {
          renderRoomChoices();
          updateSummary();
        } else {
          updateSummary(true);
          // enable continue booking
          const continueBtn = document.getElementById("continue-booking");
          continueBtn.disabled = false;
          continueBtn.classList.remove("opacity-60");

          // disable all other select buttons
          document.querySelectorAll(".selectRoom").forEach(b => { 
              b.disabled = true;
              b.classList.add("opacity-60");
          });
          toggleFiltersBtn.disabled = true;
          toggleFiltersBtn.classList.add('opacity-60');
        }
      };
    });
}

const clearSelectionBtn = document.getElementById("clear-selection");

// Clear selection handler
clearSelectionBtn.addEventListener('click', () => {
  if(confirm("Are you sure you want to clear all selections?")) 
    resetSelections();
});

checkIn.addEventListener('change', resetOnChange);
checkOut.addEventListener('change', resetOnChange);
document.getElementById("add-room").addEventListener('click', resetOnChange);
document.getElementById("remove-room").addEventListener('click', resetOnChange);

function resetSelections() {
  const roomList = document.getElementById('roomList');
  const summary = document.getElementById('selectedItems');

  // Fade out
  roomList.classList.add('opacity-0', 'transition', 'duration-300');
  summary.classList.add('opacity-0', 'transition', 'duration-300');

  setTimeout(() => {
    // Clear selection state
    selectedRooms = [];
    currentRoomIndex = 0;
    requestedRooms = bookingData.rooms.length;

    // Reset all select buttons
    document.querySelectorAll('.selectRoom').forEach(b => {
      b.disabled = false;
      b.innerText = 'Select';
      b.classList.remove('bg-amber-500','opacity-60');
    });

    // Enable filters button
    toggleFiltersBtn.disabled = false;
    toggleFiltersBtn.classList.remove('opacity-60');

    document.getElementById("continue-booking").disabled=true;
    document.getElementById("continue-booking").classList.add("opacity-60");

    // Re-render rooms and summary
    renderRoomChoices();
    updateSummary();

    // Fade in
    roomList.classList.remove('opacity-0');
    roomList.classList.add('opacity-100');
    summary.classList.remove('opacity-0');
    summary.classList.add('opacity-100');
    if (localStorage.getItem('confirmedBookings')) 
        localStorage.removeItem('confirmedBookings');

  }, 300); // match duration-300
}

function resetOnChange() {
  const roomList = document.getElementById('roomList');
  const summary = document.getElementById('selectedItems');

  roomList.classList.add('opacity-0', 'transition', 'duration-300');
  summary.classList.add('opacity-0', 'transition', 'duration-300');

  setTimeout(() => {
    selectedRooms = [];
    currentRoomIndex = 0;

    document.querySelectorAll('.selectRoom').forEach(b => {
      b.disabled = false;
      b.innerText = 'Select';
      b.classList.remove('bg-amber-500','opacity-60');
    });

    renderRoomChoices();
    updateSummary();

    roomList.classList.remove('opacity-0');
    roomList.classList.add('opacity-100');
    summary.classList.remove('opacity-0');
    summary.classList.add('opacity-100');
  }, 300);
}

document.getElementById("continue-booking").addEventListener("click",function() {
  if(currentUser && currentUser.status==="login")
    window.location.href=`../bookingForm/bookingForm.html`;
  else
  {
    alert("You should login to proceed booking!");
    document.getElementById("login-modal").classList.remove("hidden");
  }
});

function updateSummary(allSelected = false) {
    const itemsEl = document.getElementById('selectedItems');
    itemsEl.innerHTML = '';
    let subtotal = 0;

    selectedRooms.forEach((r, i) => {
      const el = document.createElement('div');
      el.className = 'flex justify-between';
      el.innerHTML = `<div>Room ${i + 1}: ${r.type} × ${r.nights} nights</div><div>₹${r.lineSubtotal}</div>`;
      itemsEl.appendChild(el);
      subtotal += r.lineSubtotal;
    });

    if (!selectedRooms.length) {
      itemsEl.innerHTML = `<div class="text-gray-500">No rooms selected yet</div>`;
    }

    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + tax;
    document.getElementById('subtotal').innerText = subtotal;
    document.getElementById('tax').innerText = tax;
    document.getElementById('total').innerText = total;
    if(allSelected)
    {
      const order = {
        checkin,
        checkout,
        nights,
        requestedRooms,
        roomGuestRequests,
        selectedRooms,
        subtotal,
        tax,
        total
      };
      order.checkin=document.getElementById("check-in").value;
      order.checkout=document.getElementById("check-out").value;
      localStorage.setItem('confirmedBookings', JSON.stringify(order));
    }
  }

  // initial render
  renderRoomChoices();
  updateSummary();
  document.addEventListener("click", (e) => {
    if (!panel.contains(e.target) && !toggleBtn.contains(e.target)) {
      panel.classList.add("hidden");
    }
    if (!filtersPanel.contains(e.target) && !toggleFiltersBtn.contains(e.target)) {
      filtersPanel.classList.add("hidden");
    }
  });
})();