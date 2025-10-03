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

// userManagement.js
const USERS_URL = "http://localhost:5000/users"; // json-server endpoint

// DOM
const userTableBody = document.getElementById("userTableBody");
const paginationControls = document.getElementById("paginationControls");
const searchInput = document.getElementById("searchInput");
const toggleFiltersBtn = document.getElementById("toggleFilters");
const filterPanel = document.getElementById("filterPanel");
const addUserBtn = document.getElementById("addUserBtn");
const userModal = document.getElementById("userModal");
const userForm = document.getElementById("userForm");
const modalTitle = document.getElementById("modalTitle");
const cancelUserBtn = document.getElementById("cancelUserBtn");
const avatarFile = document.getElementById("avatarFile");
const avatarPreview = document.getElementById("avatarPreview");
const exportBtn = document.getElementById("exportBtn");
const printBtn = document.getElementById("printBtn");

// State
let users = [];
let filteredUsers = [];
let currentPage = 1;
const rowsPerPage = 5;
let totalPages = 1;
let uploadedAvatar = ""; // base64 only after upload

// ------------------ Fetch Users ------------------
async function fetchUsers() {
  try {
    const res = await fetch(USERS_URL);
    users = await res.json();
    // ensure id & string names exist
    users = users.map(u => ({ ...u, id: String(u.id) }));
    filteredUsers = [...users];
    renderTable();
  } catch (err) {
    console.error("Failed to fetch users:", err);
  }
}

// ------------------ Render Table ------------------
function renderTable() {
  userTableBody.innerHTML = "";
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageData = filteredUsers.slice(start, end);

  if (pageData.length === 0) {
    userTableBody.innerHTML = `<tr><td colspan="8" class="py-6">No users found</td></tr>`;
  } else {
    pageData.forEach(u => {
      const row = document.createElement("tr");
      row.className = "border-b";
      row.innerHTML = `
        <td class="p-2">${u.id}</td>
        <td class="p-2 flex items-center gap-2 justify-center">
          ${escapeHtml(u.name || "")}
        </td>
        <td class="p-2">${escapeHtml(u.email || "")}</td>
        <td class="p-2">${escapeHtml(u.role || "")}</td>
        <td class="p-2">${escapeHtml(u.status || "")}</td>
        <td class="p-2">
          <button class="px-3 py-1 bg-gradient-to-r from-amber-300 to-amber-500 px-3 py-1 rounded-xl" onclick="viewUser('${u.id}')">View</button>
        </td>
      `;
      userTableBody.appendChild(row);
    });
  }

  renderPagination();
}

// ------------------ Pagination ------------------
function renderPagination() {
  paginationControls.innerHTML = "";
  totalPages = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage));

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Prev";
  prevBtn.className = "px-3 py-1 border rounded bg-gray-200 mr-2";
  prevBtn.disabled = currentPage === 1;
  if(currentPage==1)
    prevBtn.classList.add("opacity-20");
  else
    prevBtn.classList.remove("opacity-20");
  prevBtn.onclick = () => { if (currentPage > 1) { currentPage--; renderTable(); } };
  paginationControls.appendChild(prevBtn);

  // page numbers (limit to window of pages for long lists)
  const maxButtons = 7;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons/2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);
  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = `px-3 py-1 border rounded mx-1 ${i === currentPage ? "bg-gradient-to-r from-amber-300 to-amber-500" : "bg-white"}`;
    btn.onclick = () => { currentPage = i; renderTable(); };
    paginationControls.appendChild(btn);
  }

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";
  nextBtn.className = "px-3 py-1 border rounded bg-gray-200 ml-2";
  nextBtn.disabled = currentPage === totalPages;
  if(currentPage==totalPages)
    nextBtn.classList.add("opacity-20");
  else
    nextBtn.classList.remove("opacity-20");
  nextBtn.onclick = () => { if (currentPage < totalPages) { currentPage++; renderTable(); } };
  paginationControls.appendChild(nextBtn);
}

// ------------------ Search (all columns) ------------------
searchInput.addEventListener("input", function() {
  const q = this.value.trim().toLowerCase();
  filteredUsers = users.filter(u => {
    return Object.values(u).some(val => String(val || "").toLowerCase().includes(q));
  });
  currentPage = 1;
  renderTable();
});

// ------------------ Filters ------------------
toggleFiltersBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  filterPanel.classList.toggle("hidden");
});

// close filter when clicking outside
document.addEventListener("click", (e) => {
  if (!filterPanel.contains(e.target) && !toggleFiltersBtn.contains(e.target)) {
    filterPanel.classList.add("hidden");
  }
});

function applyFilters() {
  const checkedRoles = Array.from(document.querySelectorAll(".filter-role:checked")).map(cb => cb.value);
  const checkedStatus = Array.from(document.querySelectorAll(".filter-status:checked")).map(cb => cb.value);

  filteredUsers = users.filter(u => {
    const roleMatch = checkedRoles.length === 0 || checkedRoles.includes((u.role || "").toLowerCase());
    const statusMatch = checkedStatus.length === 0 || checkedStatus.includes((u.status || "").toLowerCase());
    return roleMatch && statusMatch;
  });

  currentPage = 1;
  renderTable();
  filterPanel.classList.add("hidden");
}

// ------------------ View User ------------------
window.viewUser = function(id) {
  const user = users.find(x => String(x.id) === String(id));
  if (!user) return;
  const content = document.getElementById("viewUserContent");
  content.innerHTML = `
    <p><strong>ID:</strong> ${escapeHtml(String(user.id))}</p>
    <p><strong>Name:</strong> ${escapeHtml(user.name || "")}</p>
    <p><strong>Email:</strong> ${escapeHtml(user.email || "")}</p>
    <p><strong>Mobile:</strong> ${escapeHtml(user.mobile || "")}</p>
    <p><strong>DOB:</strong> ${escapeHtml(user.dob || "")}</p>
    <p><strong>Role:</strong> ${escapeHtml(user.role || "")}</p>
    <p><strong>Status:</strong> ${escapeHtml(user.status || "")}</p>
  `;
  document.getElementById("viewUserModal").classList.remove("hidden");
  document.getElementById("viewUserModal").classList.add("flex");
};

function closeViewUser() {
  document.getElementById("viewUserModal").classList.add("hidden");
  document.getElementById("viewUserModal").classList.remove("flex");
}

// ------------------ Add User Modal ------------------
addUserBtn.addEventListener("click", () => {
  modalTitle.textContent = "Add User";
  userForm.reset();
  document.getElementById("userId").value = "";
  userModal.classList.remove("hidden");
  userModal.classList.add("flex");
});

cancelUserBtn.addEventListener("click", () => {
  userModal.classList.add("hidden");
  userModal.classList.remove("flex");
});

// ------------------ Save (Add) User ------------------
userForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  // assemble payload
  const payload = {
    id: users.length+1,
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    mobile: document.getElementById("mobile").value.trim(),
    dob: document.getElementById("dob").value || "",
    password: document.getElementById("password").value || "",
    role: document.getElementById("role").value || "admin", // default admin
    status: document.getElementById("status").value || "active"
  };

  try {
    const res = await fetch(USERS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to add user");
    // reload users
    await fetchUsers();
    userModal.classList.add("hidden");
    userModal.classList.remove("flex");
  } catch (err) {
    console.error(err);
    alert("Failed to save user");
  }
});

const deletionTable = document.getElementById("deletion-table");
const userTable = document.getElementById("user-table");

// Tab switching
document.getElementById("tab-users").addEventListener("click", () => {
  userTable.classList.remove("hidden");
  deletionTable.classList.add("hidden");
  document.getElementById("tab-users").classList.add("border-b-2","border-amber-500");
  document.getElementById("tab-deletion").classList.remove("border-b-2","border-amber-500");
});

document.getElementById("tab-deletion").addEventListener("click", () => {
  deletionTable.classList.remove("hidden");
  userTable.classList.add("hidden");
  document.getElementById("tab-deletion").classList.add("border-b-2","border-amber-500");
  document.getElementById("tab-users").classList.remove("border-b-2","border-amber-500");
  loadDeletionRequests();
});

// Load deletion requests
async function loadDeletionRequests() {
  const res = await fetch("http://localhost:5000/deletionRequests");
  const data = await res.json();

  const tbody = document.getElementById("deletion-rows");
  tbody.innerHTML = "";

  data.forEach(req => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="p-2 border">${req.id}</td>
      <td class="p-2 border">${req.userId}</td>
      <td class="p-2 border">${req.date}</td>
      <td class="p-2 border" id="actions-${req.id}">
        ${req.status === "Pending" 
          ? `
            <button class="px-3 py-1 bg-gradient-to-r from-amber-300 to-amber-500 px-3 py-1 rounded-xl" onclick="updateRequest('${req.id}',${req.userId},'Accepted')">Accept</button>
            <button class="px-3 py-1 bg-gradient-to-r from-red-400 to-red-600 text px-3 py-1 rounded-xl" onclick="updateRequest('${req.id}',${req.userId}, 'Rejected')">Reject</button>
          `
          : req.status
        }
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Update request status
async function updateRequest(reqId,userId, status) {
  if(status=="Accepted")
  {
    await fetch(`http://localhost:5000/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status:"Inactive" })
    });
  }
  await fetch(`http://localhost:5000/deletionRequests/${reqId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });

  loadDeletionRequests(); // refresh table
}

// ------------------ Export ------------------
exportBtn.addEventListener("click", () => {
  if (filteredUsers.length === 0) { alert("No data to export"); return; }

  const data = [];
  // header
  data.push(["Users List"]);
  data.push([]);
  data.push(["ID","Name","Email","Mobile","DOB","Role","Status"]);
  filteredUsers.forEach(u => {
    data.push([u.id, u.name || "", u.email || "", u.mobile || "", u.dob || "", u.role || "", u.status || ""]);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Users");
  XLSX.writeFile(wb, "users.xlsx");
});

// ------------------ Print ------------------
printBtn.addEventListener("click", () => {
  if (filteredUsers.length === 0) { alert("No data to print"); return; }

  let printContent = `
    <div style="display:flex;gap:8px;align-items:center;">
      <div style="font-family:'Berkshire Swash', cursive; font-size:20px;">EazyStay</div>
    </div>
    <h2 style="text-align:center;">Users List</h2>
    <table border="1" cellspacing="0" cellpadding="6" style="width:100%; border-collapse:collapse;">
      <thead style="background:#ddd;">
        <tr>
          <th>ID</th><th>Name</th><th>Email</th><th>Mobile</th><th>DOB</th><th>Role</th><th>Status</th>
        </tr>
      </thead><tbody>
  `;
  filteredUsers.forEach(u => {
    printContent += `<tr>
      <td>${escapeHtml(u.id)}</td>
      <td>${escapeHtml(u.name || "")}</td>
      <td>${escapeHtml(u.email || "")}</td>
      <td>${escapeHtml(u.mobile || "")}</td>
      <td>${escapeHtml(u.dob || "")}</td>
      <td>${escapeHtml(u.role || "")}</td>
      <td>${escapeHtml(u.status || "")}</td>
    </tr>`;
  });
  printContent += `</tbody></table>`;

  const win = window.open("", "_blank");
  win.document.write(`<!doctype html><html><head><title>Users</title></head><body>${printContent}</body></html>`);
  win.document.close();
  win.print();
});

// ------------------ Utility ------------------
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ------------------ Init ------------------
fetchUsers();
