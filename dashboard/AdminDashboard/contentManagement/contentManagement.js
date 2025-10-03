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

// Navigation tabs functionality
document.querySelectorAll('.nav-tab').forEach(tab => {
  tab.addEventListener('click', function() {
    // Remove active class from all tabs
    document.querySelectorAll('.nav-tab').forEach(t => {
      t.classList.remove('active', 'bg-amber-100');
      t.classList.add('hover:bg-gray-100');
    });
        
    // Add active class to clicked tab
    this.classList.add('active', 'bg-amber-100');
    this.classList.remove('hover:bg-gray-100');
        
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
      section.classList.add('hidden');
    });
        
    // Show selected section
    const sectionId = this.dataset.section + '-section';
      document.getElementById(sectionId).classList.remove('hidden');
    });
 });

// Edit functionality
document.querySelectorAll('.edit-btn').forEach(editBtn => {
  editBtn.addEventListener('click', function() {
    const section = this.closest('.content-section');
    const inputs = section.querySelectorAll('input, textarea, button:not(.edit-btn)');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
          
    // Enable all inputs in the section
    inputs.forEach(input => {
      input.disabled = false;
      if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') 
        input.classList.add('border-amber-400', 'bg-amber-50');
    });
          
    // Show action buttons
    saveBtn.classList.remove('hidden');
    cancelBtn.classList.remove('hidden');
        
    // Hide edit button
    this.style.display = 'none';
  });
});

// Save functionality
document.getElementById('saveBtn').addEventListener('click', function() {
  const activeSection = document.querySelector('.content-section:not(.hidden)');
  const inputs = activeSection.querySelectorAll('input, textarea, button:not(.edit-btn)');
  const editBtn = activeSection.querySelector('.edit-btn');
      
  // Disable all inputs
  inputs.forEach(input => {
    input.disabled = true;
    if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') 
          input.classList.remove('border-amber-400', 'bg-amber-50');
    });
      
    // Hide action buttons
    this.classList.add('hidden');
    document.getElementById('cancelBtn').classList.add('hidden');
      
    // Show edit button
    editBtn.style.display = 'flex';
     
    // Show success message (you can customize this)
    alert('Changes saved successfully!');
});

// Cancel functionality
document.getElementById('cancelBtn').addEventListener('click', function() {
  const activeSection = document.querySelector('.content-section:not(.hidden)');
  const inputs = activeSection.querySelectorAll('input, textarea, button:not(.edit-btn)');
  const editBtn = activeSection.querySelector('.edit-btn');
  
  // Reset values and disable inputs (you might want to store original values)
  inputs.forEach(input => {
    input.disabled = true;
    if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') 
          input.classList.remove('border-amber-400', 'bg-amber-50');
    });
      
    // Hide action buttons
    this.classList.add('hidden');
    document.getElementById('saveBtn').classList.add('hidden');
      
    // Show edit button
    editBtn.style.display = 'flex';
});

// Mobile sidebar functionality
document.getElementById('hamburger-btn').addEventListener('click', function() {
  document.getElementById('sidebar').classList.remove('hidden');
});

document.getElementById('close-btn').addEventListener('click', function() {
  document.getElementById('sidebar').classList.add('hidden');
});

// Logout functionality
document.getElementById('nav-logout').addEventListener('click', function() {
  window.location.href = '/index.html';
});

document.getElementById('side-logout').addEventListener('click', function() {
  window.location.href = '/index.html';
});