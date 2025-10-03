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

// Mobile menu toggle
document.getElementById('hamburger-btn').addEventListener('click', () => {
  document.getElementById('sidebar').classList.remove('hidden');
});

document.getElementById('close-btn').addEventListener('click', () => {
  document.getElementById('sidebar').classList.add('hidden');
});

// Data storage
let allBookings = [];
let allUsers = [];
let allRooms = [];
let currentReportData = [];
let currentPage = 1;
let recordsPerPage = 10;

// Fetch data
async function fetchData() {
  try {
    const [bookingsRes, usersRes, roomsRes] = await Promise.all([
      fetch("http://localhost:5000/bookings"),
      fetch("http://localhost:5000/users"),
      fetch("http://localhost:5000/rooms")
    ]);

    allBookings = await bookingsRes.json();
    allUsers = await usersRes.json();
    allRooms = await roomsRes.json();

    generateReport(); // Auto-generate initial report
  } catch (err) {
    console.error("Error fetching data:", err);
  }
}

// Chart initialization
const ctx = document.getElementById('reportChart').getContext('2d');
let reportChart = new Chart(ctx, {
  type: 'bar',
  data: { 
    labels: [], 
    datasets: [{ 
      label: '', 
      data: [], 
      backgroundColor: 'rgba(251, 191, 36, 0.8)',
      borderColor: 'rgb(251, 191, 36)',
      borderWidth: 1
    }] 
  },
  options: { 
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: { 
      y: { 
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return typeof value === 'number' ? value.toLocaleString() : value;
          }
        }
      } 
    } 
  }
});

// Generate Report Function
function generateReport() {
  const type = document.getElementById('reportType').value;
  const fromDate = document.getElementById('fromDate').value;
  const toDate = document.getElementById('toDate').value;
  const statusFilter = document.getElementById('statusFilter').value;

  // Filter bookings
  let filtered = allBookings.filter(booking => {
    let matchesDate = true;
    let matchesStatus = true;

    if (fromDate && booking.checkin < fromDate) matchesDate = false;
    if (toDate && booking.checkin > toDate) matchesDate = false;
    if (statusFilter !== 'all' && booking.status !== statusFilter) matchesStatus = false;

    return matchesDate && matchesStatus;
  });

  currentReportData = filtered.map(booking => {
    const user = allUsers.find(u => u.id === booking.user);
    const room = allRooms.find(r => r.id === booking.selectedRooms?.[0]);
          
    return {
      ...booking,
      userName: user?.name || 'Unknown User',
      roomType: room?.type || 'Unknown Room'
    };
  });

  updateStats();
  updateChart(type);
  updateTable();
  updatePagination();
}

// Update Statistics
function updateStats() {
  const totalReports = currentReportData.length;
  const totalRevenue = currentReportData.reduce((sum, item) => sum + (item.total || 0), 0);
  const avgBookingValue = totalReports > 0 ? Math.round(totalRevenue / totalReports) : 0;
    
  const fromDate = document.getElementById('fromDate').value;
  const toDate = document.getElementById('toDate').value;
  let periodText = "All Time";
  if (fromDate && toDate) {
    periodText = `${fromDate} to ${toDate}`;
  } else if (fromDate) {
    periodText = `From ${fromDate}`;
  } else if (toDate) {
    periodText = `Until ${toDate}`;
  }

  document.getElementById('totalReports').textContent = totalReports.toLocaleString();
  document.getElementById('totalRevenue').textContent = `₹${totalRevenue.toLocaleString()}`;
  document.getElementById('avgBookingValue').textContent = `₹${avgBookingValue.toLocaleString()}`;
  document.getElementById('reportPeriod').textContent = periodText;

  // Calculate additional metrics
  const completedBookings = currentReportData.filter(b => b.status === 'Completed').length;
  const completionRate = totalReports > 0 ? Math.round((completedBookings / totalReports) * 100) : 0;
      
  // Find peak day
  const dailyCounts = {};
  currentReportData.forEach(booking => {
    const date = new Date(booking.checkin).toLocaleDateString();
    dailyCounts[date] = (dailyCounts[date] || 0) + 1;
  });
  const peakDay = Object.keys(dailyCounts).reduce((a, b) => dailyCounts[a] > dailyCounts[b] ? a : b, '-');

  document.getElementById('completionRate').textContent = `${completionRate}%`;
  document.getElementById('peakDay').textContent = peakDay;
  document.getElementById('growthRate').textContent = '+15%'; // Placeholder
}

function updateChart(type) {
  const chartTypeSelect = document.getElementById('chartType').value;

  // Destroy existing chart
  if (reportChart) {
    reportChart.destroy();
  }

  const ctx = document.getElementById('reportChart').getContext('2d');
  let chartData = {};
  let chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' }
    }
  };

  if (chartTypeSelect === 'pie') {
    // === Pie Chart ===
    if (type === 'bookings') {
      // Bookings by status
      const statusCounts = currentReportData.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {});
      chartData = {
        labels: Object.keys(statusCounts),
        datasets: [{
          label: 'Bookings by Status',
          data: Object.values(statusCounts),
          backgroundColor: ['#22c55e','#3b82f6','#fbbf24','#ef4444']
        }]
      };

    } else if (type === 'revenue') {
      // Revenue by room type
      const revenueByRoom = {};
      currentReportData.forEach(item => {
        revenueByRoom[item.roomType] = (revenueByRoom[item.roomType] || 0) + item.total;
      });
      chartData = {
        labels: Object.keys(revenueByRoom),
        datasets: [{
          label: 'Revenue by Room Type',
          data: Object.values(revenueByRoom),
          backgroundColor: ['#fbbf24','#6366f1','#10b981']
        }]
      };

    } 

  } else {
    // === Bar/Line Charts (time-based trends) ===
    if (type === 'bookings' || type === 'revenue') {
      const dailyData = {};
      currentReportData.forEach(item => {
        const date = new Date(item.checkin).toLocaleDateString();
        if (!dailyData[date]) dailyData[date] = { count: 0, revenue: 0 };
        dailyData[date].count += 1;
        dailyData[date].revenue += item.total;
      });
      const labels = Object.keys(dailyData).sort((a, b) => new Date(a) - new Date(b));

      if (type === 'bookings') {
        chartData = {
          labels,
          datasets: [{
            label: 'Bookings',
            data: labels.map(d => dailyData[d].count),
            backgroundColor: '#fbbf24',
            borderColor: '#f59e0b',
            borderWidth: 2
          }]
        };
      } else {
        chartData = {
          labels,
          datasets: [{
            label: 'Revenue',
            data: labels.map(d => dailyData[d].revenue),
            backgroundColor: '#22c55e',
            borderColor: '#16a34a',
            borderWidth: 2
          }]
        };
      }

    } 
  }

  // Create new chart
  reportChart = new Chart(ctx, {
    type: chartTypeSelect,
    data: chartData,
    options: chartOptions
  });
}
    

// Update Table
function updateTable() {
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const pageData = currentReportData.slice(startIndex, endIndex);

  const tbody = document.getElementById('reportTableBody');
  tbody.innerHTML = '';

  pageData.forEach(item => {
    const statusClass = {
      'Completed': 'bg-green-100 text-green-800',
      'Ongoing': 'bg-amber-100 text-amber-800',
      'Upcoming': 'bg-blue-100 text-blue-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };

    tbody.innerHTML += `
      <tr class="border-b hover:bg-gray-50 transition-colors duration-200">
        <td class="p-3 font-medium text-gray-900">${item.id}</td>
        <td class="p-3 text-gray-600">${item.userName}</td>
        <td class="p-3 text-gray-600">${item.roomType}</td>
        <td class="p-3 text-gray-600">${new Date(item.checkin).toLocaleDateString()}</td>
        <td class="p-3 text-gray-600">${item.checkout ? new Date(item.checkout).toLocaleDateString() : 'N/A'}</td>
        <td class="p-3">
          <span class="px-2 py-1 text-xs font-semibold rounded-full ${statusClass[item.status] || 'bg-gray-100 text-gray-800'}">${item.status}</span>
        </td>
        <td class="p-3 font-semibold text-gray-900">₹${item.total?.toLocaleString() || '0'}</td>
      </tr>
    `;
  });

  // Update pagination info
  document.getElementById('showingStart').textContent = startIndex + 1;
  document.getElementById('showingEnd').textContent = Math.min(endIndex, currentReportData.length);
  document.getElementById('totalRecords').textContent = currentReportData.length;
}

// Update Pagination
function updatePagination() {
  const totalPages = Math.ceil(currentReportData.length / recordsPerPage);
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  const pageNumbers = document.getElementById('pageNumbers');

  // Update button states
  prevBtn.disabled = currentPage === 1;
  if(currentPage==1)
    prevBtn.classList.add("opacity-20");
  else
    prevBtn.classList.remove("opacity-20");
  nextBtn.disabled = currentPage === totalPages || totalPages === 0;
  if(currentPage==totalPages)
    nextBtn.classList.add("opacity-20");
  else
    nextBtn.classList.remove("opacity-20");

  // Generate page numbers
  pageNumbers.innerHTML = '';
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.className = `px-3 py-1 border rounded text-sm ${i === currentPage ? 'bg-amber-500 text-white' : 'hover:bg-gray-50'}`;
      btn.onclick = () => {
        currentPage = i;
        updateTable();
        updatePagination();
      };
      pageNumbers.appendChild(btn);
    } else if (i === currentPage - 3 || i === currentPage + 3) {
      const span = document.createElement('span');
      span.textContent = '...';
      span.className = 'px-2 py-1 text-gray-400';
      pageNumbers.appendChild(span);
    }
  }
}

// Export Functions
function exportToPDF() {
  //   const { jsPDF } = window.jspdf;
  const doc = new jspdf.jsPDF();

  // Title
  doc.setFontSize(20);
  doc.text("EazyStay Report", 14, 20);

  // Report info
  doc.setFontSize(12);
  const reportType = document.getElementById('reportType').value;
  doc.text(`Report Type: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`, 14, 35);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 45);
  doc.text(`Total Records: ${currentReportData.length}`, 14, 55);

  // Table headers
  let yPos = 70;
  doc.setFontSize(10);
  doc.text("ID", 14, yPos);
  doc.text("Customer", 40, yPos);
  doc.text("Room", 80, yPos);
  doc.text("Check-in", 110, yPos);
  doc.text("Status", 140, yPos);
  doc.text("Amount", 170, yPos);

  yPos += 10;
  doc.line(14, yPos, 200, yPos); // Header line

  // Table data
  currentReportData.slice(0, 30).forEach(item => { // Limit to first 30 records
  yPos += 8;
  doc.text(item.id.substring(0, 8), 14, yPos);
  doc.text(item.userName.substring(0, 15), 40, yPos);
  doc.text(item.roomType.substring(0, 12), 80, yPos);
  doc.text(new Date(item.checkin).toLocaleDateString(), 110, yPos);
  doc.text(item.status, 140, yPos);
  doc.text(`₹${item.total?.toLocaleString() || '0'}`, 170, yPos);

  if (yPos > 270) { // New page if needed
    doc.addPage();
    yPos = 20;
  }
});

  doc.save(`easystay-report-${new Date().toISOString().split('T')[0]}.pdf`);
}

function exportToExcel() {
  const worksheet = XLSX.utils.json_to_sheet(currentReportData.map(item => ({
    'Booking ID': item.id,
    'Customer Name': item.userName,
    'Room Type': item.roomType,
    'Check-in Date': item.checkin,
    'Check-out Date': item.checkout || 'N/A',
    'Status': item.status,
    'Amount': item.total || 0
  })));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  XLSX.writeFile(workbook, `easystay-report-${new Date().toISOString().split('T')[0]}.xlsx`);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  fetchData();

  // Set default dates (last 30 days)
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
  document.getElementById('toDate').value = today.toISOString().split('T')[0];
  document.getElementById('fromDate').value = thirtyDaysAgo.toISOString().split('T')[0];

  // Report generation
  document.getElementById('generateReport').addEventListener('click', generateReport);

  // Chart type change
  document.getElementById('chartType').addEventListener('change', () => {
    const type = document.getElementById('reportType').value;
    updateChart(type);
  });

  // Records per page change
  document.getElementById('recordsPerPage').addEventListener('change', function() {
    recordsPerPage = parseInt(this.value);
    currentPage = 1;
    updateTable();
    updatePagination();
  });

  // Pagination
  document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      updateTable();
      updatePagination();
    }
  });

  document.getElementById('nextPage').addEventListener('click', () => {
    const totalPages = Math.ceil(currentReportData.length / recordsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      updateTable();
      updatePagination();
    }
  });

  // Export functions
  document.getElementById('exportPDF').addEventListener('click', exportToPDF);
  document.getElementById('exportExcel').addEventListener('click', exportToExcel);

  // Clear filters
  document.getElementById('clearFilters').addEventListener('click', () => {
    document.getElementById('reportType').value = 'bookings';
    document.getElementById('fromDate').value = '';
    document.getElementById('toDate').value = '';
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('chartType').value = 'bar';
    currentPage = 1;
    generateReport();
  });

  // Logout functionality
  document.getElementById('nav-logout').addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
      window.location.href = '/auth/login.html';
    }
  });

  document.getElementById('side-logout').addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
      window.location.href = '/auth/login.html';
    }
  });
});