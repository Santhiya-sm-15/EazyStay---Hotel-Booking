var forget_mail = document.getElementById("forget-mail");
var forget_mailError = document.getElementById("forget-mail-error");
var forgetBtn = document.getElementById("forget-btn");

// Email Validation
forget_mail.addEventListener("input", async function () {
    const forget_emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(!forget_emailPattern.test(forget_mail.value))
    {
        forget_mailError.textContent = "Enter a valid email address";
        return;
    }
    try
    {
        const res=await fetch("http://localhost:5000/users");
        const users=await res.json();
        const matched=users.find(u=>u.email==forget_mail.value)
        if(!matched)
            forget_mailError.textContent = "Mail id not available";
        else    
            forget_mailError.textContent = "";
    }
    catch(error){
        alert("Error:", error);
    }
});

// Forget btn
forgetBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    if (forget_mail.value) 
    {
        alert("Password is sent to mail");
        document.getElementById("forget-modal").classList.add("hidden");
        document.getElementById("login-modal").classList.remove("hidden");
    }
    else 
        alert("Please fill all fields correctly");
});