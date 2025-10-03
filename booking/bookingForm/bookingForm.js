var username = document.getElementById("name");
var mail = document.getElementById("mail");
var sendOtpBtn = document.getElementById("send-otp");
var otpSection = document.getElementById("otp-section");
var otpInputs = document.querySelectorAll(".otp-input");
var verifyOtpBtn = document.getElementById("verify-otp");
var otpError = document.getElementById("otp-error");
var payBtn = document.getElementById("pay-btn");
var amt = document.getElementById("amount");

const API = "http://localhost:5000/users";

const currentUser = JSON.parse(localStorage.getItem("currentUser"));
const confirmedBookings = JSON.parse(localStorage.getItem("confirmedBookings"));

if (currentUser) {
    username.value = currentUser.name || "";
    mail.value = currentUser.email || "";
}

if (confirmedBookings) {
    if (confirmedBookings.transactionId) {
        amt.value = confirmedBookings.extraPayment || "";
    } else {
        amt.value = confirmedBookings.total || "";
    }
}

let otpVerified = false;
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

// Login Button Click
payBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    if (otpVerified) 
        window.location.href="/payment/pay/pay.html";
    else
        alert("OTP verification needed!");
});