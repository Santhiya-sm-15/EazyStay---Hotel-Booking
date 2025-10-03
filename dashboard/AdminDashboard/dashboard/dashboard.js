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

document.getElementById("my-bookings").addEventListener("click",function(){
    if(currentUser && currentUser.role=="admin")
    {
        document.getElementById("my-bookings").classList.add("hidden");
        document.getElementById("dashboard").classList.remove("hidden");
    }
    else
    {
        document.getElementById("dashboard").classList.add("hidden");
        document.getElementById("my-bookings").classList.remove("hidden");
    }
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

let dashboardData = { bookings: [] };

let bookingsChart, revenueChart, statusPieChart, roomTypePieChart;

// =======================
// Helper: Group bookings
// =======================
function groupByPeriod(bookings, period) {
  const grouped = {};

  bookings.forEach(b => {
    if (!b.checkin) return;
    const date = new Date(b.checkin);

    let key, sortKey;

    switch (period) {
      case "daily":
        key = date.toLocaleDateString("en-GB"); // e.g. 25/09/2025
        sortKey = date.getTime();
        break;

      case "weekly":
        const week = Math.ceil(date.getDate() / 7);
        key = `${date.toLocaleString("default", { month: "short" })} W${week}`;
        sortKey = date.getFullYear() * 1000 + date.getMonth() * 10 + week;
        break;

      case "monthly":
      default:
        key = date.toLocaleString("default", { month: "short", year: "numeric" });
        sortKey = date.getFullYear() * 100 + date.getMonth();
        break;
    }

    if (!grouped[key]) grouped[key] = { count: 0, revenue: 0, sortKey };
    grouped[key].count += 1;
    grouped[key].revenue += b.total || 0;
  });

  return grouped;
}


// =======================
// Charts Create
// =======================
function createBookingsChart() {
  const ctx = document.getElementById('bookingsChart').getContext('2d');
  bookingsChart = new Chart(ctx, {
    type: 'line',
    data: { labels: [], datasets: [{ label: 'Bookings', data: [], borderColor: 'rgb(59, 130, 246)', backgroundColor: 'rgba(59, 130, 246, 0.1)', tension: 0.1 }] },
    options: { mainAspectRatio:false,scales: {
      y: {
        ticks: {
          stepSize: 1,   // ensures increments of 1
          callback: function(value) {
            return Number.isInteger(value) ? value : null; // only show integers
          }
        },
        beginAtZero: true // always start y-axis at 0
      },
      x: {
        ticks: {
          autoSkip: false // optional, shows all labels
        }
      } } }
  });
}

function createRevenueChart() {
  const ctx = document.getElementById('revenueChart').getContext('2d');
  revenueChart = new Chart(ctx, {
    type: 'line',
    data: { labels: [], datasets: [{ label: 'Revenue', data: [], borderColor: 'rgb(16, 185, 129)', backgroundColor: 'rgba(16, 185, 129, 0.1)', tension: 0.1 }] },
    options: { responsive: true }
  });
}

function createStatusPieChart() {
  const ctx = document.getElementById('statusPieChart').getContext('2d');
  statusPieChart = new Chart(ctx, {
    type: 'pie',
    data: { labels: [], datasets: [{ data: [], backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444','#e6299aff'] }] },
    options: { responsive: false }
  });
}

function createRoomTypePieChart() {
  const ctx = document.getElementById('roomTypePieChart').getContext('2d');
  roomTypePieChart = new Chart(ctx, {
    type: 'pie',
    data: { labels: [], datasets: [{ data: [], backgroundColor: ['#6366F1', '#EC4899', '#F59E0B', '#10B981'] }] },
    options: { responsive: false }
  });
}

// =======================
// Charts Update
// =======================
function updateBookingsChart(filter) {
  const grouped = groupByPeriod(dashboardData.bookings, filter);
  bookingsChart.data.labels = Object.keys(grouped).sort((a, b) => grouped[a].sortKey - grouped[b].sortKey);
  bookingsChart.data.datasets[0].data = Object.values(grouped).map(v => v.count);
  bookingsChart.update();
}

function updateRevenueChart(filter) {
  const grouped = groupByPeriod(dashboardData.bookings, filter);
  revenueChart.data.labels = Object.keys(grouped).sort((a, b) => grouped[a].sortKey - grouped[b].sortKey);
  revenueChart.data.datasets[0].data = Object.values(grouped).map(v => v.revenue);
  revenueChart.update();
}

function updateStatusPieChart() {
  const statusCounts = dashboardData.bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});
  statusPieChart.data.labels = Object.keys(statusCounts);
  statusPieChart.data.datasets[0].data = Object.values(statusCounts);
  statusPieChart.update();
}

function updateRoomTypePieChart() {
  const bookings = dashboardData.bookings || [];
  const rooms = dashboardData.rooms || [];

  // Create lookup map: { roomId -> type }
  const roomMap = rooms.reduce((acc, r) => {
    acc[r.id] = r.type;
    return acc;
  }, {});

  const roomTypeCounts = {};

  bookings.forEach(b => {
    (b.selectedRooms || []).forEach(roomId => {
      const type = roomMap[roomId] || "Unknown";
      roomTypeCounts[type] = (roomTypeCounts[type] || 0) + 1;
    });
  });

  roomTypePieChart.data.labels = Object.keys(roomTypeCounts);
  roomTypePieChart.data.datasets[0].data = Object.values(roomTypeCounts);
  roomTypePieChart.update();
}


// =======================
// Counters Update
// =======================
function updateCounters() {
  document.getElementById("totalBookings").textContent = dashboardData.bookings.length;

  document.getElementById("totalUsers").textContent = dashboardData.users.length;

  const totalRevenue = dashboardData.bookings.reduce((sum, b) => sum + (b.total || 0), 0);
  document.getElementById("totalRevenue").textContent = "₹" + totalRevenue.toLocaleString();

  const ongoing = dashboardData.bookings.reduce((sum,b)=>sum+(b.status=="Ongoing"?1:0),0);
  document.getElementById("ongoingBookings").textContent = ongoing;

  const cancelled = dashboardData.bookings.reduce((sum,b)=>sum+(b.status=="Cancelled"?1:0),0);
  document.getElementById("cancelledBookings").textContent = cancelled;
}

function updateRecentBookingsTable() {
   const bookings = dashboardData.bookings || [];
      const users = dashboardData.users || [];
      const rooms = dashboardData.rooms || [];
      const tableBody = document.getElementById('recentBookingsTable');

      // Get recent bookings (latest 5)
      const recentBookings = bookings
        .sort((a, b) => new Date(b.checkin) - new Date(a.checkin))
        .slice(0, 5);

      tableBody.innerHTML = recentBookings.map(booking => {
        const user = users.find(u => u.id === booking.user);
        const roomId = booking.selectedRooms?.[0] || '';
        const room = rooms.find(r => r.id === roomId);
        
        const statusClass = {
          'Completed': 'text-green-800',
          'Ongoing': 'text-amber-800',
          'Upcoming': 'text-blue-800',
          'Cancelled': 'text-red-800',
          'Rescheduled':'text-gray-800'
        };

        return `
          <tr>
            <td class="px-4 py-3 text-sm font-medium text-gray-900">${booking.id}</td>
            <td class="px-4 py-3 text-sm text-gray-500">${user?.name || 'N/A'}</td>
            <td class="px-4 py-3 text-sm text-gray-500">${room?.type || ''} ${roomId}</td>
            <td class="px-4 py-3 text-sm text-gray-500">${new Date(booking.checkin).toLocaleDateString()}</td>
            <td class="px-4 py-3">
              <span class="px-2 py-1 text-xs font-semibold rounded-full ${statusClass[booking.status] || 'bg-gray-100 text-gray-800'}">
                ${booking.status}
              </span>
            </td>
            <td class="px-4 py-3 text-sm font-medium text-gray-900">₹${booking.total?.toLocaleString()}</td>
          </tr>
        `;
      }).join('');
    }


// =======================
// Fetch Data + Init
// =======================
async function fetchDashboardData() {
  try {
    const [bookingsRes, roomsRes,usersRes] = await Promise.all([
      fetch("http://localhost:5000/bookings"),
      fetch("http://localhost:5000/rooms"),
      fetch("http://localhost:5000/users")
    ]);

    dashboardData.bookings = await bookingsRes.json();
    dashboardData.rooms = await roomsRes.json();
    dashboardData.users = await usersRes.json();

    // Update everything
    updateCounters();
    updateBookingsChart(document.getElementById('bookingsFilter').value);
    updateRevenueChart(document.getElementById('revenueFilter').value);
    updateRecentBookingsTable();
    updateStatusPieChart();
    updateRoomTypePieChart();
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
  }
}

// =======================
// Event Listeners
// =======================
document.addEventListener("DOMContentLoaded", () => {
  createBookingsChart();
  createRevenueChart();
  createStatusPieChart();
  createRoomTypePieChart();

  fetchDashboardData();

  document.getElementById('bookingsFilter').addEventListener('change', function() {
    updateBookingsChart(this.value);
  });

  document.getElementById('revenueFilter').addEventListener('change', function() {
    updateRevenueChart(this.value);
  });
});