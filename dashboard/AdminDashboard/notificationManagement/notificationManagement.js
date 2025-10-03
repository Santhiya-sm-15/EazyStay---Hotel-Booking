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

let notifications = [];
    let filteredNotifications = [];
    let currentPage = 1;
    let itemsPerPage = 10;
    let currentNotificationId = null;

    // API Configuration
    const API_BASE = 'http://localhost:5000';

    // Initialize page
    document.addEventListener('DOMContentLoaded', function() {
      loadNotifications();
      setupEventListeners();
    });

    // Setup event listeners
    function setupEventListeners() {
      // Search input
      document.getElementById('searchInput').addEventListener('input', debounce(handleSearch, 300));
      
      // Filter toggle
      document.getElementById('toggleFilters').addEventListener('click', function() {
        const panel = document.getElementById('filterPanel');
        panel.classList.toggle('hidden');
      });

      // Mark all read
      document.getElementById('markAllRead').addEventListener('click', markAllAsRead);

      // Reply form
      document.getElementById('replyForm').addEventListener('submit', handleReplySubmit);

      // Sidebar events
      setupSidebarEvents();

      // Close modal when clicking outside
      document.getElementById('replyModal').addEventListener('click', function(e) {
        if (e.target === this) {
          closeReplyModal();
        }
      });
    }

    // Load notifications from API
    async function loadNotifications() {
      try {
        const response = await fetch(`${API_BASE}/notifications`);
        if (response.ok) {
          notifications = await response.json();
          filteredNotifications = [...notifications];
          updateStatsCards();
          renderNotifications();
          renderPagination();
        } else {
          throw new Error('Failed to fetch notifications');
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }

        // Update stats cards
    function updateStatsCards() {
      const total = notifications.length;
      const newCount = notifications.filter(n => n.status === 'new').length;
      const repliedCount = notifications.filter(n => n.status === 'replied').length;

      document.getElementById('totalNotifications').textContent = total;
      document.getElementById('newNotifications').textContent = newCount;
      document.getElementById('repliedNotifications').textContent = repliedCount;
    }

    // Render notifications table
    function renderNotifications() {
      const tableBody = document.getElementById('notificationTableBody');
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const pageNotifications = filteredNotifications.slice(start, end);

      if (pageNotifications.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="6" class="px-4 py-8 text-center text-gray-500">No notifications found</td>
          </tr>
        `;
        return;
      }

      tableBody.innerHTML = pageNotifications.map(notification => {
        const statusClass = {
          'new': 'bg-blue-100 text-blue-800',
          'replied': 'bg-green-100 text-green-800'
        };

        const isNew = notification.status === 'new';
        const rowClass = isNew ? 'bg-blue-50' : '';

        return `
          <tr class="${rowClass}">
            <td class="px-4 py-3">
              <div class="flex items-center">
                ${isNew ? '<div class="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>' : '<div class="w-2 h-2 mr-2"></div>'}
                <span class="text-sm font-medium text-gray-900">${notification.name}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600">${notification.email}</td>
            <td class="px-4 py-3 text-sm text-gray-600">
              <div class="max-w-xs truncate" title="${notification.message}">
                ${notification.message}
              </div>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600">${new Date(notification.timestamp).toLocaleDateString()}</td>
            <td class="px-4 py-3">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass[notification.status]}">
                ${notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex space-x-2">
                <button onclick="openReplyModal('${notification.id}')" class="text-blue-600 hover:text-blue-900 text-sm font-medium ${notification.status === 'replied' ? 'opacity-50 cursor-not-allowed' : ''}" ${notification.status === 'replied' ? 'disabled' : ''}>
                  ${notification.status === 'replied' ? 'Replied' : 'Reply'}
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    // Open reply modal
    function openReplyModal(notificationId) {
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification || notification.status === 'replied') return;

      currentNotificationId = notificationId;
      
      // Populate modal with notification data
      document.getElementById('senderInitial').textContent = notification.name.charAt(0).toUpperCase();
      document.getElementById('senderName').textContent = notification.name;
      document.getElementById('senderEmail').textContent = notification.email;
      document.getElementById('originalMessage').textContent = notification.message;
      document.getElementById('messageDate').textContent = `Received on: ${new Date(notification.timestamp).toLocaleString()}`;
      
      // Set default subject
      document.getElementById('replySubject').value = `Re: Your inquiry - EazyStay`;
      document.getElementById('replyMessage').value = '';

      // Show modal
      document.getElementById('replyModal').classList.remove('hidden');
      document.getElementById('replyModal').classList.add('flex');
      document.getElementById('replyMessage').focus();
    }

    // Close reply modal
    function closeReplyModal() {
      document.getElementById('replyModal').classList.add('hidden');
      document.getElementById('replyModal').classList.remove('flex');
      currentNotificationId = null;
    }

    // Handle reply form submission
    async function handleReplySubmit(event) {
      event.preventDefault();
      
      if (!currentNotificationId) return;

      const subject = document.getElementById('replySubject').value.trim();
      const message = document.getElementById('replyMessage').value.trim();

      if (!subject || !message) {
        alert('Please fill in both subject and message fields.');
        return;
      }

      try {
        // Update notification status to replied
        const notification = notifications.find(n => n.id === currentNotificationId);
        if (notification) {
          // Update via API
          const response = await fetch(`${API_BASE}/notifications/${currentNotificationId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              status: 'replied',
              reply: {
                subject: subject,
                message: message,
                timestamp: new Date().toISOString()
              }
            })
          });

          if (response.ok) {
            // Update local data
            notification.status = 'replied';
            notification.reply = {
              subject: subject,
              message: message,
              timestamp: new Date().toISOString()
            };
          } else {
            // Fallback: update local data only
            notification.status = 'replied';
            notification.reply = {
              subject: subject,
              message: message,
              timestamp: new Date().toISOString()
            };
          }
        }

        // Update UI
        updateStatsCards();
        renderNotifications();
        closeReplyModal();
        
        // Show success message
        showSuccessModal();

      } catch (error) {
        console.error('Error sending reply:', error);
        alert('Failed to send reply. Please try again.');
      }
    }
    

    // Mark all as read (change new to replied)
    async function markAllAsRead() {
      if (!confirm('Are you sure you want to mark all notifications as read?')) {
        return;
      }

      try {
        const newNotifications = notifications.filter(n => n.status === 'new');
        
        for (const notification of newNotifications) {
          notification.status = 'replied';
          
          // Update via API (optional, can be done in batch)
          try {
            await fetch(`${API_BASE}/notifications/${notification.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                status: 'replied'
              })
            });
          } catch (error) {
            console.log('API update failed, using local update only');
          }
        }

        // Update UI
        updateStatsCards();
        renderNotifications();
        
      } catch (error) {
        console.error('Error marking all as read:', error);
        alert('Failed to mark notifications as read. Please try again.');
      }
    }

    // Handle search
    function handleSearch() {
      const searchTerm = document.getElementById('searchInput').value.toLowerCase();
      
      if (!searchTerm) {
        filteredNotifications = [...notifications];
      } else {
        filteredNotifications = notifications.filter(notification =>
          notification.name.toLowerCase().includes(searchTerm) ||
          notification.email.toLowerCase().includes(searchTerm) ||
          notification.message.toLowerCase().includes(searchTerm)
        );
      }
      
      currentPage = 1;
      renderNotifications();
      renderPagination();
    }

    // Apply filters
    function applyFilters() {
      const statusFilters = Array.from(document.querySelectorAll('.filter-status:checked'))
        .map(cb => cb.value);
      
      filteredNotifications = notifications.filter(notification =>
        statusFilters.includes(notification.status)
      );
      
      currentPage = 1;
      renderNotifications();
      renderPagination();
      
      // Hide filter panel
      document.getElementById('filterPanel').classList.add('hidden');
    }

    // Render pagination
    function renderPagination() {
      const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
      const paginationControls = document.getElementById('paginationControls');
      
      if (totalPages <= 1) {
        paginationControls.innerHTML = '';
        return;
      }

      let paginationHTML = '';
      
      // Previous button
      if (currentPage > 1) {
        paginationHTML += `<button onclick="changePage(${currentPage - 1})" class="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Previous</button>`;
      }
      
      // Page numbers
      for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
          paginationHTML += `<button class="px-3 py-2 bg-amber-500 text-white border border-amber-500 rounded-lg">${i}</button>`;
        } else {
          paginationHTML += `<button onclick="changePage(${i})" class="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">${i}</button>`;
        }
      }
      
      // Next button
      if (currentPage < totalPages) {
        paginationHTML += `<button onclick="changePage(${currentPage + 1})" class="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Next</button>`;
      }
      
      paginationControls.innerHTML = paginationHTML;
    }

    // Change page
    function changePage(page) {
      currentPage = page;
      renderNotifications();
      renderPagination();
    }

    // Show success modal
    function showSuccessModal() {
      document.getElementById('successModal').classList.remove('hidden');
      document.getElementById('successModal').classList.add('flex');
    }

    // Close modal
    function closeModal(modalId) {
      document.getElementById(modalId).classList.add('hidden');
      document.getElementById(modalId).classList.remove('flex');
    }

    // Debounce function for search
    function debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }

    // Setup sidebar events
    function setupSidebarEvents() {
      document.getElementById('hamburger-btn').addEventListener('click', function() {
        document.getElementById('sidebar').classList.remove('hidden');
      });

      document.getElementById('close-btn').addEventListener('click', function() {
        document.getElementById('sidebar').classList.add('hidden');
      });

      document.getElementById('nav-logout').addEventListener('click', function() {
        if(confirm('Are you sure you want to logout?')) {
          window.location.href = '/auth/login.html';
        }
      });

      document.getElementById('side-logout').addEventListener('click', function() {
        if(confirm('Are you sure you want to logout?')) {
          window.location.href = '/auth/login.html';
        }
      });
    }

    // Close filter panel when clicking outside
    document.addEventListener('click', function(event) {
      const filterPanel = document.getElementById('filterPanel');
      const toggleButton = document.getElementById('toggleFilters');
      
      if (!filterPanel.contains(event.target) && !toggleButton.contains(event.target)) {
        filterPanel.classList.add('hidden');
      }
    });

    // Close success modal when clicking outside
    document.getElementById('successModal').addEventListener('click', function(e) {
      if (e.target === this) {
        closeModal('successModal');
      }
    });

    // Auto-refresh notifications every 30 seconds
    setInterval(loadNotifications, 30000);