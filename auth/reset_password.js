var reset_mail = document.getElementById("reset-mail");
var reset_mailError = document.getElementById("reset-mail-error");
var reset_sendOtpBtn = document.getElementById("reset-send-otp");
var reset_otpSection = document.getElementById("reset-otp-section");
var reset_otpInputs = document.querySelectorAll(".reset-otp-input");
var reset_verifyOtpBtn = document.getElementById("reset-verify-otp");
var reset_otpError = document.getElementById("reset-otp-error");
var reset_password = document.getElementById("reset-password");
var reset_passError = document.getElementById("reset-pass-error");
var reset_confirmPassword = document.getElementById("reset-confirm-password");
var reset_confirmPasswordError = document.getElementById("reset-confirm-pass-error");
var resetBtn = document.getElementById("reset-btn");

let reset_generatedOtp = "";
let reset_otpVerified = false;

// Email Validation
reset_mail.addEventListener("input", async function () {
    const reset_emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(!reset_emailPattern.test(reset_mail.value))
    {
        reset_mailError.textContent = "Enter a valid email address";
        reset_sendOtpBtn.classList.add("hidden");
        reset_otpSection.classList.add("hidden");
        reset_otpError.textContent = "";
        reset_otpVerified = false;
        return;
    }
    try
    {
        const res=await fetch("http://localhost:5000/users");
        const users=await res.json();
        const matched=users.find(u=>u.email==reset_mail.value)
        if(!matched)
        {
            reset_mailError.textContent = "Mail id not available";
            reset_sendOtpBtn.classList.add("hidden");
            reset_otpSection.classList.add("hidden");
            reset_otpError.textContent = "";
            reset_otpVerified = false;
        }
        else    
        {
            reset_mailError.textContent = "";
            reset_sendOtpBtn.classList.remove("hidden");
        }
    }
    catch(error){
        alert("Error:", error);
    }
});

// Send OTP Button Click
reset_sendOtpBtn.addEventListener("click", function (e) {
    e.preventDefault();
    reset_otpInputs.forEach(input => input.value = "");
    reset_generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    alert("Your OTP is: " + reset_generatedOtp);
    reset_otpSection.classList.remove("hidden");
    reset_otpInputs[0].focus();
    reset_otpVerified = false;
    reset_otpError.textContent = "";
});

// Auto Focus OTP Inputs
reset_otpInputs.forEach((input, index) => {
    input.addEventListener("input", () => {
        if (input.value.length === 1 && index < reset_otpInputs.length - 1) 
            reset_otpInputs[index + 1].focus();
    });
    input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && input.value === "" && index > 0) 
            reset_otpInputs[index - 1].focus();
    });
});

// Verify OTP Button Click
reset_verifyOtpBtn.addEventListener("click", (e) => {
    e.preventDefault();
    let enteredOtp = "";
    reset_otpInputs.forEach(input => enteredOtp += input.value);

    if (enteredOtp === reset_generatedOtp) {
        reset_otpError.textContent = "✅ OTP Verified!";
        reset_otpError.className = "text-green-500 text-sm";
        reset_otpVerified = true;
    } else {
        reset_otpError.textContent = "❌ Invalid OTP";
        reset_otpError.className = "text-red-500 text-sm";
        reset_otpVerified = false;
    }
});
    
// Password Validation
reset_password.addEventListener("input", function () {
    const pass = reset_password.value;
        
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
        reset_passError.textContent = "Password cannot be empty";
    else if (pass.length<6)
        reset_passError.textContent = "Password should be atleast 6 characters";
    else if (score <= 4) 
        reset_passError.textContent = "Password should have atleast 1 upper, 1 lower, 1 digit, 1 special character";
    else
        reset_passError.textContent="";
});

// Confirm Password Validation
reset_confirmPassword.addEventListener("input", function () {
    if(reset_confirmPassword.value !== reset_password.value)
        reset_confirmPasswordError.textContent = "Passwords do not match";
    else    
        reset_confirmPasswordError.textContent = "";
});

async function update(mail, newpassword) {
    let res = await fetch(`${"http://localhost:5000/users"}?email=${mail}`);
    let users = await res.json();

    if(users.length === 0) throw new Error("User not found");
    let user = users[0];

    // Update password
    await fetch(`${"http://localhost:5000/users"}/${user.id}`, {
        method: "PATCH",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ password:newpassword})
    });
}

// Reset Button Click
resetBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    if (!reset_otpVerified) {
        reset_otpError.textContent = "Please verify your OTP before reseting";
        reset_otpError.className = "text-red-500 text-sm";
        return;
    }
    if (reset_mail.value && reset_password.value && reset_confirmPassword.value && reset_password.value === reset_confirmPassword.value) 
    {
        try {
            await update(reset_mail.value, reset_password.value);
            alert("Password updated successfully!");
            document.getElementById("reset-modal").classList.add("hidden");
            document.getElementById("login-modal").classList.remove("hidden");
        } catch (error) {
            alert("Failed to update password: " + error.message);
        }
    }
});