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

const API_URL = "http://localhost:5000/rooms"; // JSON Server URL

const roomTableBody = document.getElementById("roomTableBody");
const roomModal = document.getElementById("roomModal");
const modalTitle = document.getElementById("modalTitle");
const roomForm = document.getElementById("roomForm");
const addRoomBtn = document.getElementById("addRoomBtn");
const cancelBtn = document.getElementById("cancelBtn");
const paginationControls = document.getElementById("paginationControls");

let roomsData = [];         // all rooms
let filteredRoomsData = []; // after filters
let currentPage = 1;
const rowsPerPage = 5;

// Load rooms
async function loadRooms() {
  const res = await fetch(API_URL);
  roomsData = await res.json();
  filteredRoomsData = [...roomsData]; // initially no filter
  renderPaginatedRooms();
}

// Pagination renderer (now uses filteredRoomsData)
function renderPaginatedRooms() {
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedRooms = filteredRoomsData.slice(start, end);

  renderRooms(paginatedRooms);
  renderPaginationControls();
}

// 🔹 Render table rows
function renderRooms(rooms) {
  roomTableBody.innerHTML = "";
  if (rooms.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="9" class="text-center py-4">No rooms found</td>`;
    roomTableBody.appendChild(tr);
    return;
  }
  rooms.forEach((room) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
    <td class="p-2">${room.id}</td>
    <td class="p-2">${room.type}</td>
    <td class="p-2">${room.price}</td>
    <td class="p-2 hidden sm:flex">${room.capacity}</td>
    <td class="p-2">${room.status}</td>
    <td class="p-2 flex gap-2 justify-center">
      <button class="px-3 py-1 border-2 border-amber-300 px-3 py-1 rounded-xl" onclick="viewRoom('${room.id}')">View</button>
      <button class="bg-gradient-to-r from-amber-300 to-amber-500 px-3 py-1 rounded-xl hover:bg-yellow-500" onclick="editRoom('${room.id}')">Edit</button>
      <button class="bg-gradient-to-r from-red-400 to-red-600 text-white px-3 py-1 rounded-xl hover:bg-red-600" onclick="deleteRoom('${room.id}')">Delete</button>
    </td>
  `;

    roomTableBody.appendChild(tr);
  });
}

// 🔹 Render pagination buttons
function renderPaginationControls() {
  const totalPages = Math.ceil(filteredRoomsData.length / rowsPerPage);
  paginationControls.innerHTML = "";

  // Prev
  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Prev";
  prevBtn.className = "px-3 py-1 bg-gray-300 rounded hover:bg-gray-400";
  prevBtn.disabled = currentPage === 1;
  if(currentPage==1)
    prevBtn.classList.add("opacity-20");
  else
    prevBtn.classList.remove("opacity-20");
  prevBtn.onclick = () => {
    currentPage--;
    renderPaginatedRooms();
  };
  paginationControls.appendChild(prevBtn);

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.textContent = i;
    pageBtn.className = `px-3 py-1 rounded ${i === currentPage ? "bg-gradient-to-r from-amber-300 to-amber-500" : "bg-gray-200 hover:bg-gray-300"}`;
    pageBtn.onclick = () => {
      currentPage = i;
      renderPaginatedRooms();
    };
    paginationControls.appendChild(pageBtn);
  }

  // Next
  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";
  nextBtn.className = "px-3 py-1 bg-gray-300 rounded hover:bg-gray-400";
  nextBtn.disabled = currentPage === totalPages;
  if(currentPage==totalPages)
    nextBtn.classList.add("opacity-20");
  else
    nextBtn.classList.remove("opacity-20");
  nextBtn.onclick = () => {
    currentPage++;
    renderPaginatedRooms();
  };
  paginationControls.appendChild(nextBtn);
}

// =============================
// 🔹 CRUD: ADD / EDIT / DELETE
// =============================

// Open Add Room modal
addRoomBtn.addEventListener("click", () => {
  modalTitle.textContent = "Add Room";
  roomForm.reset();
  document.getElementById("roomId").value = "";
  imgPreview.src = "";
  imgPreview.classList.add("hidden");
  uploadedImage = "";
  roomModal.classList.remove("hidden");
});

// Close modal
cancelBtn.addEventListener("click", () => {
  roomModal.classList.add("hidden");
});

const imgFileInput = document.getElementById("imgFile");
const imgPreview = document.getElementById("imgPreview");

let uploadedImage = ""; // store base64

// Save room (Add or Edit)
roomForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newRoom = {
    id: document.getElementById("roomId").value,
    type: document.getElementById("type").value,
    price: parseFloat(document.getElementById("price").value),
    capacity: parseInt(document.getElementById("capacity").value),
    details: document.getElementById("details").value,
    bedType: document.getElementById("bedType").value,
    status: document.getElementById("status").value,
    img: uploadedImage, // store base64 string instead of text
    bookings: []
  };

  if (document.getElementById("roomId").value) {
    // Update room
    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRoom),
    });
  } else {
    // Add room
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRoom),
    });
  }

  roomModal.classList.add("hidden");
  loadRooms();
});

// Edit Room
function editRoom(id) {
  const room = roomsData.find(r => r.id === id);
  if (!room) return;

  modalTitle.textContent = "Edit Room";
  roomForm.roomId.value = room.id;
  roomForm.type.value = room.type;
  roomForm.price.value = room.price;
  roomForm.capacity.value = room.capacity;
  roomForm.details.value = room.details;
  roomForm.bedType.value = room.bedType;
  roomForm.status.value = room.status;

  // Show existing image in preview
  uploadedImage = room.img || "";
  if (uploadedImage) {
    imgPreview.src = uploadedImage;
    imgPreview.classList.remove("hidden");
  } else {
    imgPreview.classList.add("hidden");
  }

  roomModal.classList.remove("hidden");
}
imgFileInput.addEventListener("change", () => {
  const file = imgFileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedImage = e.target.result; // base64 string
      imgPreview.src = uploadedImage;
      imgPreview.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  }
});

// Delete Room
async function deleteRoom(id) {
  if (confirm("Are you sure you want to delete this room?")) {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    loadRooms();
  }
}

function viewRoom(id) {
  const room = roomsData.find(r => r.id === id);
  if (!room) return;

  const viewContent = document.getElementById("viewRoomContent");
  viewContent.innerHTML = `
    <p><strong>ID:</strong> ${room.id}</p>
    <p><strong>Type:</strong> ${room.type}</p>
    <p><strong>Price:</strong> ${room.price}</p>
    <p><strong>Capacity:</strong> ${room.capacity}</p>
    <p><strong>Details:</strong> ${room.details}</p>
    <p><strong>Bed Type:</strong> ${room.bedType}</p>
    <p><strong>Status:</strong> ${room.status}</p>
    ${room.img ? `<img src="${room.img}" class="w-full h-40 w-40 rounded mt-2">` : "<p>No Image</p>"}
  `;

  document.getElementById("viewRoomModal").classList.remove("hidden");
  document.getElementById("viewRoomModal").classList.add("flex");
}

function closeViewRoom() {
  document.getElementById("viewRoomModal").classList.add("hidden");
  document.getElementById("viewRoomModal").classList.remove("flex");
}

// Toggle filter panel
document.getElementById('toggleFilters').addEventListener('click', () => {
  document.getElementById('filterPanel').classList.toggle('hidden');
});

 // Apply Filters
function applyFilters() {
  const types = Array.from(document.querySelectorAll('.filter-room-type:checked')).map(cb => cb.value);
  const prices = Array.from(document.querySelectorAll('.filter-price:checked')).map(cb => cb.value);
  const capacities = Array.from(document.querySelectorAll('.filter-capacity:checked')).map(cb => parseInt(cb.value));
  const status = Array.from(document.querySelectorAll('.filter-status:checked')).map(cb => cb.value);

  filteredRoomsData = roomsData.filter(room => {
    // type filter
    let typeMatch = types.length === 0 || types.includes(room.type);

    // capacity filter
    let capacityMatch = capacities.length === 0 || capacities.includes(room.capacity);

    // status filter
    let statusMatch = status.length === 0 || status.includes(room.status);

    // price filter
    let priceMatch = true;
    if (prices.length > 0) {
      priceMatch = prices.some(p => {
        const [min, max] = p.split('-').map(Number);
        return room.price >= min && room.price <= max;
      });
    }

    return typeMatch && priceMatch && capacityMatch && statusMatch;
  });

  currentPage = 1; // reset to first page after filtering
  renderPaginatedRooms();
  document.getElementById('filterPanel').classList.toggle('hidden');
}

loadRooms();

document.addEventListener("click", (e) => {
  if (!document.getElementById("filterPanel").contains(e.target) && !document.getElementById("toggleFilters").contains(e.target)) 
    document.getElementById("filterPanel").classList.add("hidden");
});

document.getElementById("exportBtn").addEventListener("click", () => {
  console.log(filteredRoomsData.length)
  if (filteredRoomsData.length==0) {
    alert("No data to export");
    return;
  }

  let data = [];

  // Title row
  data.push(["Rooms List"]);
  data.push([]); // empty row for spacing

  // Summary row
  const totalRooms = filteredRoomsData.length;
  const availableRooms = filteredRoomsData.filter(r => r.status.toLowerCase() === "available").length;
  const maintenanceRooms = filteredRoomsData.filter(r => r.status.toLowerCase() === "maintenance").length;
  data.push([`Total Rooms: ${totalRooms}`, `Number of Rooms Available: ${availableRooms}`, `Rooms under Maintenance: ${maintenanceRooms}`]);
  data.push([]); // empty row for spacing

  // Headers
  const headers = ["ID", "Type", "Price", "Capacity", "Details", "Bed Type", "Status"];
  data.push(headers);

  // Room rows
  filteredRoomsData.forEach(room => {
    data.push([
      room.id,
      room.type,
      room.price,
      room.capacity,
      room.details,
      room.bedType,
      room.status
    ]);
  });

  // Export with SheetJS
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Style first row (Rooms List as bold + bigger font)
  ws["A1"].s = { font: { bold: true, sz: 16 } };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Rooms");
  XLSX.writeFile(wb, "Rooms List.xlsx");
});

document.getElementById("printBtn").addEventListener("click", () => {
  if (filteredRoomsData.length==0) {
    alert("No data to print");
    return;
  }

  let printContent = `
    <div class="flex flex-row gap-2 items-center">
      <img src="/images/logo1.png" class="object-cover w-12 h-12 rounded-full border-2 border-yellow-400">
      <div class="font-berkshire font-bold text-2xl">EazyStay</div>
    </div>
    <h2 style="text-align:center;">Rooms List</h2>
    <p>Total Rooms: ${filteredRoomsData.length} | Number of Rooms Available: ${filteredRoomsData.filter(r => r.status.toLowerCase() === "available").length} | Rooms under Maintenance: ${filteredRoomsData.filter(r => r.status.toLowerCase() === "maintenance").length}</p>
    <table border="1" cellspacing="0" cellpadding="5" style="width:100%; border-collapse:collapse; text-align:center;">
      <thead>
        <tr style="background:#ddd;">
          <th>ID</th>
          <th>Type</th>
          <th>Price</th>
          <th>Capacity</th>
          <th>Details</th>
          <th>Bed Type</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
  `;

  filteredRoomsData.forEach(room => {
    printContent += `
      <tr>
        <td>${room.id}</td>
        <td>${room.type}</td>
        <td>${room.price}</td>
        <td>${room.capacity}</td>
        <td>${room.details}</td>
        <td>${room.bedType}</td>
        <td>${room.status}</td>
      </tr>
    `;
  });

  printContent += `
      </tbody>
    </table>
  `;

  const win = window.open("", "_blank");
  win.document.write(`
    <html>
      <head>
        <title>Rooms List</title>
          <link href="https://fonts.googleapis.com/css2?family=Berkshire+Swash&display=swap" rel="stylesheet">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            .font-berkshire { font-family: 'Berkshire Swash', cursive; }
            body { font-family: Arial, sans-serif; padding:20px; }
            table { margin-top:10px; }
            h2 { margin-bottom:5px; }
            p { font-weight:bold; }
          </style>
      </head>
      <body>${printContent}</body>
    </html>
  `);
  win.document.close();
  win.print();
});