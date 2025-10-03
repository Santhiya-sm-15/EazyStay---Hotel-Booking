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

// API Base URL
const API_BASE = 'http://localhost:5000';
    
// Available endpoints
const ENDPOINTS = [
  'rooms',
  'users', 
  'bookings',
  'feedbacks',
  'deletionRequests',
  'transactions',
  'notifications'
];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  initializePage();
  loadBackupHistory();
});

// Initialize event listeners
function initializePage() {
  // Select All checkbox
  document.getElementById('selectAll').addEventListener('change', function() {
    const checkboxes = document.querySelectorAll('input[name="backupData"]');
    checkboxes.forEach(cb => cb.checked = this.checked);
  });

  // Individual checkboxes
  document.querySelectorAll('input[name="backupData"]').forEach(cb => {
    cb.addEventListener('change', updateSelectAll);
  });

  // Auto backup toggle
  document.getElementById('autoBackupToggle').addEventListener('change', function() {
    const settings = document.getElementById('autoBackupSettings');
    settings.style.opacity = this.checked ? '1' : '0.5';
  });

  // File upload
  document.getElementById('restoreFile').addEventListener('change', handleFileSelect);

  // Restore confirmation
  document.getElementById('confirmRestore').addEventListener('change', function() {
    document.getElementById('restoreData').disabled = !this.checked;
  });

  // Button events
  document.getElementById('createBackup').addEventListener('click', createManualBackup);
  document.getElementById('restoreData').addEventListener('click', restoreData);
  document.getElementById('saveAutoBackupSettings').addEventListener('click', saveAutoBackupSettings);

  // Sidebar events
  setupSidebarEvents();
}

// Update Select All checkbox state
function updateSelectAll() {
  const checkboxes = document.querySelectorAll('input[name="backupData"]');
  const selectAll = document.getElementById('selectAll');
  const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
     
  selectAll.checked = checkedCount === checkboxes.length;
  selectAll.indeterminate = checkedCount > 0 && checkedCount < checkboxes.length;
}

// Create manual backup
async function createManualBackup() {
  const selectedData = Array.from(document.querySelectorAll('input[name="backupData"]:checked')).map(cb => cb.value);
  if (selectedData.length === 0) {
    showError('Please select at least one data type to backup.');
    return;
  }

  const backupBtn = document.getElementById('createBackup');
  const progress = document.getElementById('backupProgress');
  const progressBar = document.getElementById('backupProgressBar');
  const status = document.getElementById('backupStatus');

  try {
    // Show progress
    backupBtn.disabled = true;
    progress.classList.remove('hidden');
        
    const backupData = {};
    const total = selectedData.length;
        
    // Fetch data from each endpoint
    for (let i = 0; i < selectedData.length; i++) {
      const endpoint = selectedData[i];
      status.textContent = `Backing up ${endpoint}...`;
      progressBar.style.width = `${((i + 1) / total) * 100}%`;
          
      const response = await fetch(`${API_BASE}/${endpoint}`);
      if (response.ok) {
        backupData[endpoint] = await response.json();
      } else {
        throw new Error(`Failed to fetch ${endpoint}`);
      }
    }

    // Create and download backup file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `eazystay-backup-${timestamp}.json`;
        
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
        
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
        
    URL.revokeObjectURL(url);

    // Update UI
    status.textContent = 'Backup completed successfully!';
    document.getElementById('lastBackupTime').textContent = new Date().toLocaleString();
        
    // Add to backup history
    addToBackupHistory({
      timestamp: new Date(),
      type: 'Manual',
      data: selectedData,
      size: blob.size,
      filename: filename
    });

    setTimeout(() => {
      progress.classList.add('hidden');
      progressBar.style.width = '0%';
      backupBtn.disabled = false;
    }, 2000);

    showSuccess('Backup Created Successfully', `Backup file "${filename}" has been downloaded.`);

  } catch (error) {
    showError(`Backup failed: ${error.message}`);
        
    progress.classList.add('hidden');
    progressBar.style.width = '0%';
    backupBtn.disabled = false;
  }
}

// Handle file selection for restore
function handleFileSelect(event) {
  const file = event.target.files[0];
  const fileInfo = document.getElementById('fileInfo');
  const fileName = document.getElementById('fileName');
  const fileSize = document.getElementById('fileSize');

  if (file) {
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      showError('Please select a valid JSON file.');
      event.target.value = '';
      return;
    }

    fileInfo.classList.remove('hidden');
    fileName.textContent = file.name;
    fileSize.textContent = `Size: ${(file.size / 1024).toFixed(2)} KB`;
  } else {
    fileInfo.classList.add('hidden');
  }
}

// Restore data from backup file
async function restoreData() {
  const fileInput = document.getElementById('restoreFile');
  const file = fileInput.files[0];

  if (!file) {
    showError('Please select a backup file first.');
    return;
  }

  if (!document.getElementById('confirmRestore').checked) {
    showError('Please confirm that you understand the restore process.');
    return;
  }

  const restoreBtn = document.getElementById('restoreData');
  const progress = document.getElementById('restoreProgress');
  const progressBar = document.getElementById('restoreProgressBar');
  const status = document.getElementById('restoreStatus');

  try {
    // Show progress
    restoreBtn.disabled = true;
    progress.classList.remove('hidden');
    status.textContent = 'Reading backup file...';
    progressBar.style.width = '10%';

    // Read and parse file
    const text = await file.text();
    const backupData = JSON.parse(text);
    const endpoints = Object.keys(backupData);
    const total = endpoints.length;

    // Restore data to each endpoint
    for (let i = 0; i < endpoints.length; i++) {
      const endpoint = endpoints[i];
      const data = backupData[endpoint];

      status.textContent = `Restoring ${endpoint}...`;
      progressBar.style.width = `${((i + 1) / total) * 90 + 10}%`;

      if (Array.isArray(data)) {
        for (const item of data) {
          const response = await fetch(`${API_BASE}/${endpoint}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(item)
          });

          if (!response.ok) {
            console.warn(`Failed to restore item to ${endpoint}:`, item);
          }
        }
      }
    }

    status.textContent = 'Restore completed successfully!';
    progressBar.style.width = '100%';

    setTimeout(() => {
      progress.classList.add('hidden');
      progressBar.style.width = '0%';
      restoreBtn.disabled = false;
      document.getElementById('confirmRestore').checked = false;
      document.getElementById('restoreData').disabled = true;
      fileInput.value = '';
      document.getElementById('fileInfo').classList.add('hidden');
    }, 2000);

    showSuccess('Data Restored Successfully', `All selected data has been restored from backup.`);

  } catch (error) {
      showError(`Restore failed: ${error.message}`);
        
      progress.classList.add('hidden');
      progressBar.style.width = '0%';
      restoreBtn.disabled = false;
    }
}

// Save auto backup settings
function saveAutoBackupSettings() {
  const settings = {
    enabled: document.getElementById('autoBackupToggle').checked,
    frequency: document.getElementById('backupFrequency').value,
    time: document.getElementById('backupTime').value,
    retain: document.getElementById('retainBackups').value
  };

  // Save to localStorage (in real app, save to server)
  localStorage.setItem('autoBackupSettings', JSON.stringify(settings));
      
  showSuccess('Settings Saved', 'Auto backup settings have been saved successfully.');
}

// Load backup history
function loadBackupHistory() {
  const history = JSON.parse(localStorage.getItem('backupHistory') || '[]');
  const tableBody = document.getElementById('backupHistoryTable');
  if (history.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="px-4 py-8 text-center text-gray-500">No backup history available</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = history.slice(-10).reverse().map(backup => `
    <tr>
      <td class="px-4 py-3 text-sm text-gray-900">${new Date(backup.timestamp).toLocaleString()}</td>
      <td class="px-4 py-3">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          backup.type === 'Auto' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
          }">
          ${backup.type}
        </span>
      </td>
      <td class="px-4 py-3 text-sm text-gray-600">${backup.data.join(', ')}</td>
        <td class="px-4 py-3 text-sm text-gray-600">${(backup.size / 1024).toFixed(2)} KB</td>
        <td class="px-4 py-3">
          <button onclick="downloadBackup('${backup.filename}')" class="text-blue-600 hover:text-blue-900 text-sm font-medium">Download</button>
          </td>
    </tr>
  `).join('');
}

// Add to backup history
function addToBackupHistory(backup) {
  const history = JSON.parse(localStorage.getItem('backupHistory') || '[]');
  history.push(backup);
     
  // Keep only last 50 backups
  if (history.length > 50) {
    history.splice(0, history.length - 50);
  }
    
  localStorage.setItem('backupHistory', JSON.stringify(history));
  loadBackupHistory();
}

// Download backup (placeholder function)
function downloadBackup(filename) {
  showError('Download feature would be implemented with actual file storage system.');
}

// Show success modal
function showSuccess(title, message) {
  document.getElementById('successTitle').textContent = title;
  document.getElementById('successMessage').textContent = message;
  document.getElementById('successModal').classList.remove('hidden');
  document.getElementById('successModal').classList.add('flex');
}

// Show error modal
function showError(message) {
  document.getElementById('errorMessage').textContent = message;
  document.getElementById('errorModal').classList.remove('hidden');
  document.getElementById('errorModal').classList.add('flex');
}

// Close modal
function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
  document.getElementById(modalId).classList.remove('flex');
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
    if(confirm('Are you sure you want to logout?')) 
      window.location.href = '/index.html';
  });

  document.getElementById('side-logout').addEventListener('click', function() {
    if(confirm('Are you sure you want to logout?')) 
      window.location.href = '/index.html';
  });
}

// Load saved auto backup settings on page load
function loadAutoBackupSettings() {
  const settings = JSON.parse(localStorage.getItem('autoBackupSettings') || '{}');
    
  if (settings.enabled) 
    document.getElementById('autoBackupToggle').checked = true;
  if (settings.frequency) 
    document.getElementById('backupFrequency').value = settings.frequency;
  if (settings.time) 
    document.getElementById('backupTime').value = settings.time;
  if (settings.retain) 
    document.getElementById('retainBackups').value = settings.retain;
}

// Initialize settings on page load
document.addEventListener('DOMContentLoaded', function() {
  loadAutoBackupSettings();
});

// Close modals when clicking outside
document.querySelectorAll('[id$="Modal"]').forEach(modal => {
  modal.addEventListener('click', function(e) {
    if (e.target === this) 
      closeModal(this.id);
  });
});