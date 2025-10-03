var hamburger_btn = document.getElementById("hamburger-btn");
var sidebar = document.getElementById("sidebar");
hamburger_btn.addEventListener("click", function() {
  sidebar.classList.toggle("hidden");
});

var close_btn = document.getElementById("close-btn");
close_btn.addEventListener("click", function() {
  sidebar.classList.toggle("hidden");
});

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

const RESET_URL = "http://localhost:5000/users";
const DELETE_REQ_URL = "http://localhost:5000/deletionRequests";

var username = document.getElementById("username");
var userError = document.getElementById("user-error");
var mail = document.getElementById("mail");
var mailError = document.getElementById("mail-error");
var sendOtpBtn = document.getElementById("send-otp");
var otpSection = document.getElementById("otp-section");
var otpInputs = document.querySelectorAll(".otp-input");
var verifyOtpBtn = document.getElementById("verify-otp");
var otpError = document.getElementById("otp-error");
var password = document.getElementById("password");
var passError = document.getElementById("pass-error");
var strength = document.getElementById("strength");
var confirmPassword = document.getElementById("confirm-password");
var confirmPasswordError = document.getElementById("confirm-pass-error");

let generatedOtp = "";
let otpVerified = false;
username.value=currentUser.name;
mail.value=currentUser.email;

// Open Reset Modal
const resetBtnOpen = document.getElementById("resetPasswordBtn");
const resetModal = document.getElementById("resetModal");
const closeResetModal = document.getElementById("closeResetModal");

resetBtnOpen.addEventListener("click", () => resetModal.classList.remove("hidden"));
closeResetModal.addEventListener("click", () => resetModal.classList.add("hidden"));

// Handle Reset Form
const resetBtn = document.getElementById("reset-btn");
resetBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const password = document.getElementById("password").value.trim();
  const confirmPass = document.getElementById("confirm-password").value.trim();
  if (!password || !confirmPass) return alert("Fill all fields");
  if (password !== confirmPass) return alert("Passwords do not match");

  try {
    await fetch(`${RESET_URL}/${currentUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password:password })
    });
    currentUser.password=password;
    localStorage.setItem("currentUser",JSON.stringify(currentUser));
    alert("Password updated successfully");
    resetModal.classList.add("hidden");
  } catch (err) {
    console.error(err);
    alert("Failed to update password");
  }
});

// Delete Account Request
const deleteBtn = document.getElementById("deleteAccountBtn");
deleteBtn.addEventListener("click", async () => {
  if (!confirm("Are you sure you want to request account deletion?")) return;
  try {
    const res = await fetch(DELETE_REQ_URL);
    const allRequests = await res.json();
    
    // Generate next ID
    const lastId = allRequests.length > 0 ? allRequests[allRequests.length - 1].id.replace('dr', '') : 0;
    const nextId = 'dr' + (parseInt(lastId) + 1);
    await fetch(DELETE_REQ_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id:nextId, userId: currentUser.id, date: new Date().toISOString(),status:"Pending" })
    });
    alert("Your deletion request has been sent to admin");
  } catch (err) {
    alert("Failed to send deletion request");
  }
});
  
// Send OTP Button Click
sendOtpBtn.addEventListener("click", function (e) {
  e.preventDefault();
  otpInputs.forEach(input => input.value = "");
  generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  alert("Your OTP is: " + generatedOtp);
  otpSection.classList.remove("hidden");
  otpInputs[0].focus();
  otpVerified = false;
  otpError.textContent = "";
});

// Auto Focus OTP Inputs
otpInputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    otpError.textContent="";
    if (input.value.length === 1 && index < otpInputs.length - 1) 
      otpInputs[index + 1].focus();
  });

  input.addEventListener("keydown", (e) => {
    otpError.textContent="";
    if (e.key === "Backspace" && input.value === "" && index > 0) 
      otpInputs[index - 1].focus();
  });
});

// Verify OTP Button Click
verifyOtpBtn.addEventListener("click", (e) => {
  e.preventDefault();
  let enteredOtp = "";
  otpInputs.forEach(input => enteredOtp += input.value);

  if (enteredOtp === generatedOtp) {
    otpError.textContent = "✅ OTP Verified!";
    otpError.className = "text-green-500 text-sm";
    otpVerified = true;
  } else {
    otpError.textContent = "❌ Invalid OTP";
    otpError.className = "text-red-500 text-sm";
    otpVerified = false;
  }
});
    
// Password Validation
password.addEventListener("input", function () {
  const pass = password.value;
        
  // Regex patterns
  const lower = /[a-z]/;
  const upper = /[A-Z]/;
  const digit = /[0-9]/;
  const special = /[@$!%*?&]/;

  let score = 0;

  if (lower.test(pass)) score++;
  if (upper.test(pass)) score++;
  if (digit.test(pass)) score++;
  if (special.test(pass)) score++;
  if (pass.length >= 8) score++;

  // Strength levels
  if (pass.length === 0) {
    strength.textContent = "";
  } else if (score <= 2) {
    strength.textContent = "Weak 🔴";
    strength.className = "text-red-500 text-sm font-semibold";
  } else if (score === 3 || score === 4) {
    strength.textContent = "Medium 🟡";
    strength.className = "text-yellow-500 text-sm font-semibold";
  } else if (score === 5) {
    strength.textContent = "Strong 🟢";
    strength.className = "text-green-500 text-sm font-semibold";
  }
});

// Confirm Password Validation
confirmPassword.addEventListener("input", function () {
  if(confirmPassword.value !== password.value)
    confirmPasswordError.textContent = "Passwords do not match";
  else    
    confirmPasswordError.textContent = "";
});

// Logout
document.getElementById("nav-logout").addEventListener("click", logout);
document.getElementById("side-logout").addEventListener("click", logout);

async function logout() {
  await fetch(`${RESET_URL}/${currentUser.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "logout" }),
  });
  window.location.href = "/index.html";
  localStorage.removeItem("currentUser");
}

const deleteRequestsAPI = "http://localhost:5000/deletionRequests";

async function checkDeleteRequests() {
  try {
    const res = await fetch(deleteRequestsAPI);
    const requests = await res.json();

    // Check if any request belongs to current user
    const hasRequest = requests.some(r => r.userId === currentUser.id && r.status=="Pending");

    if (hasRequest) {
      deleteBtn.disabled = true;
      resetBtnOpen.disabled = true;
      deleteBtn.classList.add("opacity-50");
      resetBtnOpen.classList.add("opacity-50");
      resetBtnOpen.classList.add("cursor-not-allowed");
      deleteBtn.classList.add("cursor-not-allowed");
    }
  } catch (err) {
    console.error("Error fetching deletion requests:", err);
  }
}

// Call the function
checkDeleteRequests();