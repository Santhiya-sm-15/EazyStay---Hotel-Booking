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

const API="http://localhost:5000/users";

// If no userId → send to login
if (!currentUser || currentUser.status!=="login") {
  alert("Please login first");
  window.location.href = "/auth/login.html";
}
if (currentUser.role !== "admin") {
  alert("Unauthorized access!");
  window.location.href = "/index.html";
}

// Form inputs
const username = document.getElementById("username");
const userError = document.getElementById("user-error");
const mail = document.getElementById("mail");
const mailError = document.getElementById("mail-error");
const dob = document.getElementById("dob");
const dobError = document.getElementById("dob-error");
const mobile = document.getElementById("mobile");
const mobileError = document.getElementById("mobile-error");
const sendOtpBtn = document.getElementById("send-otp");
const otpSection = document.getElementById("otp-section");
const otpInputs = document.querySelectorAll(".otp-input");
const verifyOtpBtn = document.getElementById("verify-otp");
const otpError = document.getElementById("otp-error");
const password = document.getElementById("password");
const passError = document.getElementById("pass-error");

const userBtn = document.getElementById("user-btn");
const mailBtn = document.getElementById("mail-btn");
const mobileBtn = document.getElementById("mobile-btn");
const dobBtn = document.getElementById("dob-btn");

let generatedOtp = "";
let otpVerified = false;

// Load user data
function loadUser() {
    // Load into form
    username.value = currentUser.name;
    mail.value = currentUser.email;
    mobile.value = currentUser.mobile;
    dob.value = currentUser.dob;
}

// Update user field
async function updateUser(field, value) {
  await fetch(`${API}/${currentUser.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ [field]: value }),
  });
  currentUser[field] = value;
  localStorage.setItem("currentUser",JSON.stringify(currentUser));
}

// Username edit
userBtn.addEventListener("click", async () => {
  if (userBtn.textContent === "Edit") {
    username.disabled = false;
    userBtn.textContent = "Save";
  } else {
    if (username.value.trim() === "") {
      userError.textContent = "Username cannot be empty";
    } else if (username.value === currentUser.name) {
      username.disabled = true;
      userBtn.textContent = "Edit";
      userError.textContent = "";
    } else {
      try {    
          userError.textContent = "";
          await updateUser("name", username.value);
          username.disabled = true;
          userBtn.textContent = "Edit";
      } catch (error) {
        console.error("Error:", error);
      }
    }
  }
});

// Email edit
mailBtn.addEventListener("click", async () => {
  if (mailBtn.textContent === "Edit") {
    mail.disabled = false;
    mailBtn.textContent = "Save";
  } else {
    const emailPattern = /^[a-zA-Z0-9_+.-]+@[a-zA-Z]+\.[a-z]+$/;
    if (!emailPattern.test(mail.value)) {
      mailError.textContent = "Enter a valid email address";
      sendOtpBtn.classList.add("hidden");
      otpSection.classList.add("hidden");
      otpError.textContent = "";
      otpVerified = false;
    } else if (mail.value === currentUser.email) {
      mail.disabled = true;
      mailBtn.textContent = "Edit";
      mailError.textContent = "";
      sendOtpBtn.classList.add("hidden");
    } else {
        const res = await fetch(API);
        const users = await res.json();
        const matchedUser = users.find(u => u.email === mail.value);

        if (matchedUser) {
          mailError.textContent = "Mail id already available";
        } else {
          mailError.textContent = "";
          
          sendOtpBtn.classList.remove("hidden");
          mail.disabled = true;
          mailBtn.textContent = "Edit";
      }
    }
  }
});

// Mobile edit + OTP
mobileBtn.addEventListener("click", async () => {
  if (mobileBtn.textContent === "Edit") {
    mobile.disabled = false;
    mobileBtn.textContent = "Save";
  } else {
    const mobilePattern = /^[6-9]\d{9}$/;
    if (!mobilePattern.test(mobile.value)) {
      mobileError.textContent = "Enter valid 10-digit mobile number";
    } else if (mobile.value === currentUser.mobile) {
      mobile.disabled = true;
      mobileBtn.textContent = "Edit";
      mobileError.textContent = "";
    } else {
      mobileError.textContent = "";
      await updateUser("mobile", mobile.value);
      mobile.disabled = true;
      mobileBtn.textContent = "Edit";
    }
  }
});

sendOtpBtn.addEventListener("click", (e) => {
  e.preventDefault();
  otpInputs.forEach(input => input.value = "");
  generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  alert("Your OTP is: " + generatedOtp);
  otpSection.classList.remove("hidden");
  otpInputs[0].focus();
  otpVerified = false;
  otpError.textContent = "";
});

otpInputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    otpError.textContent="";
    if (input.value.length === 1 && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
    }
  });
  input.addEventListener("keydown", (e) => {
    otpError.textContent="";
    if (e.key === "Backspace" && input.value === "" && index > 0) {
      otpInputs[index - 1].focus();
    }
  });
});

verifyOtpBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  let enteredOtp = "";
  otpInputs.forEach(input => (enteredOtp += input.value));

  if(enteredOtp=="")
    alert("Enter OTP");
  else if (enteredOtp === generatedOtp) {
    sendOtpBtn.classList.add("hidden");
    otpSection.classList.add("hidden");
    alert("✅ OTP Verified!");
    otpError.className = "text-green-500 text-sm";
    otpVerified = true;
    await updateUser("email", mail.value);
  } else {
    otpError.textContent = "❌ Invalid OTP";
    otpError.className = "text-red-500 text-sm";
    otpVerified = false;
  }
});

// DOB edit
dobBtn.addEventListener("click", async () => {
  if (dobBtn.textContent === "Edit") {
    dob.disabled = false;
    dobBtn.textContent = "Save";
  } else {
    if (dob.value === "") {
      dobError.textContent = "Date of Birth is required";
    } else if (dob.value === currentUser.dob) {
      dob.disabled = true;
      dobBtn.textContent = "Edit";
      dobError.textContent = "";
    } else {
      dobError.textContent = "";
      await updateUser("dob", dob.value);
      dob.disabled = true;
      dobBtn.textContent = "Edit";
    }
  }
});

loadUser();