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

const FEEDBACKS_URL = "http://localhost:5000/feedbacks";
const USERS_URL = "http://localhost:5000/users";

// ==================== State ====================
let feedbacks = [];
let users = [];
let filteredFeedbacks = [];
let currentPage = 1;
const rowsPerPage = 5;
let totalPages = 1;

// ==================== Fetch All Data ====================
async function fetchData() {
  try {
    const [fRes, uRes] = await Promise.all([
      fetch(FEEDBACKS_URL),
      fetch(USERS_URL)
    ]);
    feedbacks = await fRes.json();
    users = await uRes.json();

    // Map feedbacks with customer name
    feedbacks = feedbacks.map(fb => {
      const customer = users.find(u => u.id === fb.user)?.name || fb.user;
      return { ...fb, customerName: customer };
    });

    filteredFeedbacks = [...feedbacks];
    renderTable();
  } catch (err) {
    console.error("Error fetching data:", err);
  }
}

// ==================== Render Table ====================
function renderTable() {
  const tbody = document.getElementById("feedbackTableBody");
  tbody.innerHTML = "";

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageData = filteredFeedbacks.slice(start, end);
  if(pageData.length==0) {
    feedbackTableBody.innerHTML = `<tr><td colspan="8" class="py-6">No feedback found</td></tr>`;
  } else {
    pageData.forEach(fb => {
      const row = `
        <tr class="border-b">
          <td class="py-2 sm:p-2">${fb.id}</td>
          <td class="py-2 sm:p-2">${fb.customerName}</td>
          <td class="py-2 sm:p-2">${fb.content}</td>
          <td class="py-2 sm:p-2">${renderStars(fb.rating)}</td>
          <td class="py-2 sm:p-2">
              <button class="bg-gradient-to-r from-red-400 to-red-600 text-white px-3 py-1 rounded-xl hover:bg-red-600" onclick="removeFeedback('${fb.id}')">Delete</button>
          </td>
        </tr>
      `;
      tbody.innerHTML += row;
    });
  }
  renderPagination();
}

// ==================== Delete Feedback ====================
async function removeFeedback(id) {
  if (!confirm("Are you sure you want to delete this feedback?")) return;

  try {
    await fetch(`${FEEDBACKS_URL}/${id}`, { method: "DELETE" });
    feedbacks = feedbacks.filter(fb => fb.id !== id);
    filteredFeedbacks = filteredFeedbacks.filter(fb => fb.id !== id);
    renderTable();
  } catch (err) {
    console.error("Error deleting feedback:", err);
  }
}

function renderStars(rating) {
  rating = parseInt(rating) || 0; // ensure integer 1-5
  const maxStars = 5;
  let starsHtml = '';

  for (let i = 1; i <= maxStars; i++) {
    if (i <= rating) {
      starsHtml += `<i class="fa-solid fa-star text-yellow-500"></i>`; // filled star
    } else {
      starsHtml += `<i class="fa-regular fa-star text-gray-300"></i>`; // empty star
    }
  }

  return starsHtml;
}


// ==================== Pagination ====================
function renderPagination() {
  const controls = document.getElementById("paginationControls");
  controls.innerHTML = "";
  totalPages = Math.ceil(filteredFeedbacks.length / rowsPerPage);

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
  filteredFeedbacks = feedbacks.filter(fb =>
    fb.id.toLowerCase().includes(q) ||
    fb.customerName.toLowerCase().includes(q) ||
    fb.content.toLowerCase().includes(q)
  );
  currentPage = 1;
  renderTable();
});

// ==================== Export ====================
exportBtn.addEventListener("click", () => {
  if (filteredFeedbacks.length === 0) { 
    alert("No data to export"); 
    return; 
  }

  const data = [];
  // Header
  data.push(["EazyStay Feedbacks"]);
  data.push([]);
  data.push(["Customer", "Feedback", "Rating"]);

  filteredFeedbacks.forEach(fb => {
    data.push([
      fb.customerName || "",
      fb.content || "",
      fb.rating || ""
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Feedbacks");
  XLSX.writeFile(wb, "feedbacks.xlsx");
});



// ==================== Print ====================
printBtn.addEventListener("click", () => {
  if (filteredFeedbacks.length === 0) { 
    alert("No data to print"); 
    return; 
  }

  let printContent = `
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <div style="text-align:center; margin-bottom:20px;">
      <div style="font-family:'Berkshire Swash', cursive; font-size:24px;">EazyStay</div>
      <h2>Customer Feedbacks</h2>
    </div>
    <table border="1" cellspacing="0" cellpadding="6" style="width:100%; border-collapse:collapse;">
      <thead style="background:#ddd;">
        <tr>
          <th>Customer</th>
          <th>Feedback</th>
          <th>Rating</th>
        </tr>
      </thead>
      <tbody>
  `;

  filteredFeedbacks.forEach(fb => {
    printContent += `<tr>
      <td>${escapeHtml(fb.customerName || "")}</td>
      <td>${escapeHtml(fb.content || "")}</td>
      <td>${getStarString(fb.rating)}</td>
    </tr>`;
  });

  printContent += `</tbody></table>`;

  const win = window.open("", "_blank");
  win.document.write(`<!doctype html><html><head><title>Feedbacks</title></head><body>${printContent}</body></html>`);
  win.document.close();
  win.print();
});

// Utility function for HTML escape
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
function getStarString(rating) {
  const filled = '★';
  const empty = '☆';
  rating = parseInt(rating) || 0;
  return filled.repeat(rating) + empty.repeat(5 - rating);
}

// ==================== Init ====================
fetchData();