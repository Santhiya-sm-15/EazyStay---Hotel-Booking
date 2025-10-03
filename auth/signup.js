var signup_username = document.getElementById("signup-username");
var signup_userError = document.getElementById("signup-user-error");
var signup_mail = document.getElementById("signup-mail");
var signup_mailError = document.getElementById("signup-mail-error");
var signup_dob = document.getElementById("signup-dob");
var signup_dobError = document.getElementById("signup-dob-error");
var signup_mobile = document.getElementById("signup-mobile");
var signup_mobileError = document.getElementById("signup-mobile-error");
var signup_sendOtpBtn = document.getElementById("signup-send-otp");
var signup_otpSection = document.getElementById("signup-otp-section");
var signup_otpInputs = document.querySelectorAll(".signup-otp-input");
var signup_verifyOtpBtn = document.getElementById("signup-verify-otp");
var signup_otpError = document.getElementById("signup-otp-error");
var signup_password = document.getElementById("signup-password");
var signup_passError = document.getElementById("signup-pass-error");
var signup_strength = document.getElementById("signup-strength");
var signup_confirmPassword = document.getElementById("signup-confirm-password");
var signup_confirmPasswordError = document.getElementById("signup-confirm-pass-error");
var signupBtn = document.getElementById("signup-btn");

let signup_generatedOtp = "";
let signup_otpVerified = false;

// Username Validation
signup_username.addEventListener("input", function () {
    if(signup_username.value.trim() === "")
        signup_userError.textContent = "Username cannot be empty";
    else
        signup_userError.textContent = "";
});

// Email Validation
signup_mail.addEventListener("input", async function () {
    const signup_emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(!signup_emailPattern.test(signup_mail.value))
    {
        signup_mailError.textContent = "Enter a valid email address";
        signup_sendOtpBtn.classList.add("hidden");
        signup_otpSection.classList.add("hidden");
        signup_otpError.textContent = "";
        signup_otpVerified = false;
        return;
    }
    try
    {
        const res=await fetch("http://localhost:5000/users");
        const users=await res.json();
        const matched=users.find(u=>u.email==signup_mail.value)
        if(matched)
        {
            signup_mailError.textContent = "Mail id should be unique. Please enter some other";
            signup_sendOtpBtn.classList.add("hidden");
            signup_otpSection.classList.add("hidden");
            signup_otpError.textContent = "";
            signup_otpVerified = false;
        }
        else    
        {
            signup_mailError.textContent = "";
            signup_sendOtpBtn.classList.remove("hidden");
        }
    }
    catch(error){
        alert("Error:", error);
    }
});

// DOB Validation
signup_dob.addEventListener("change", function () {
    if(signup_dob.value === "")
        signup_dobError.textContent = "Date of Birth is required";
    const dob = new Date(signup_dob.value);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) 
        age--;
    if (age < 18) {
        signup_dobError.textContent = "You must be at least 18 years old";
        signup_dob.value = ""; 
    }
    else
        signup_dobError.textContent = "";
});

// Mobile Input Validation
signup_mobile.addEventListener("input", function () {
    const signup_mobilePattern = /^[6-9]\d{9}$/;
    if(signup_mobilePattern.test(signup_mobile.value)) 
        signup_mobileError.textContent = "";
    else 
        signup_mobileError.textContent = "Enter valid 10-digit mobile number";
});

// Send OTP Button Click
signup_sendOtpBtn.addEventListener("click", function (e) {
    e.preventDefault();
    signup_otpInputs.forEach(input => input.value = "");
    signup_generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    alert("Your OTP is: " + signup_generatedOtp);
    signup_otpSection.classList.remove("hidden");
    signup_otpInputs[0].focus();
    signup_otpVerified = false;
    signup_otpError.textContent = "";
});

// Auto Focus OTP Inputs
signup_otpInputs.forEach((input, index) => {
    input.addEventListener("input", () => {
        signup_otpError.textContent="";
        if (input.value.length === 1 && index < signup_otpInputs.length - 1) 
            signup_otpInputs[index + 1].focus();
    });
    input.addEventListener("keydown", (e) => {
        signup_otpError.textContent="";
        if (e.key === "Backspace" && input.value === "" && index > 0) 
            signup_otpInputs[index - 1].focus();
    });
});

// Verify OTP Button Click
signup_verifyOtpBtn.addEventListener("click", (e) => {
    e.preventDefault();
    let enteredOtp = "";
    signup_otpInputs.forEach(input => enteredOtp += input.value);

    if (enteredOtp === signup_generatedOtp) {
        signup_otpError.textContent = "✅ OTP Verified!";
        signup_otpError.className = "text-green-500 text-sm";
        signup_otpVerified = true;
    } else {
        signup_otpError.textContent = "❌ Invalid OTP";
        signup_otpError.className = "text-red-500 text-sm";
        signup_otpVerified = false;
    }
});

// Password Validation
signup_password.addEventListener("input", function () {
    const pass = signup_password.value;
        
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
    if (pass.length === 0) 
        signup_passError.textContent = "Password cannot be empty";
    else if (pass.length<6)
        signup_passError.textContent = "Password should be atleast 6 characters";
    else if (score <= 4) 
        signup_passError.textContent = "Password should have atleast 1 upper, 1 lower, 1 digit, 1 special character";
    else
        signup_passError.textContent="";
});

// Confirm Password Validation
signup_confirmPassword.addEventListener("input", function () {
    if(signup_confirmPassword.value !== signup_password.value)
        signup_confirmPasswordError.textContent = "Passwords do not match";
    else    
        signup_confirmPasswordError.textContent = "";
});

// Signup Button Click
signupBtn.addEventListener("click", async function (e) {
    e.preventDefault();
    if (!signup_otpVerified) {
        signup_otpError.textContent = "Please verify your OTP before signing up";
        signup_otpError.className = "text-red-500 text-sm";
        alert("Please fill all fields correctly and do OTP verification");
        return;
    }
    if (signup_username.value && signup_mail.value && signup_dob.value && signup_mobile.value && signup_password.value && signup_confirmPassword.value && signup_password.value === signup_confirmPassword.value) {
        const Ures = await fetch("http://localhost:5000/users");
        const users = await Ures.json();
        const formData = {
            id:users.length+1,
            name: signup_username.value,
            email: signup_mail.value,
            dob: signup_dob.value,
            mobile: signup_mobile.value,
            password: signup_password.value,
            role:"user",
            status:"login"
        };
        await fetch("http://localhost:5000/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData) 
        });
        localStorage.setItem("currentUser", JSON.stringify(formData));
        if(localStorage.getItem("confirmedBookings"))
            window.location.href="/booking/bookingForm/bookingForm.html";
    } 
    else 
        alert("Please fill all fields correctly");
});