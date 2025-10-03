var login_mail = document.getElementById("login-mail");
var login_mailError = document.getElementById("login-mail-error");
var login_password = document.getElementById("login-password");
var login_passError = document.getElementById("login-pass-error");
var loginBtn = document.getElementById("login-btn");

// Email Validation
login_mail.addEventListener("input", async function () {
    const login_emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(!login_emailPattern.test(login_mail.value))
    {
        login_mailError.textContent = "Enter a valid email address";
        return;
    }
    try
    {
        const res=await fetch("http://localhost:5000/users");
        const users=await res.json();
        const matched=users.find(u=>u.email==login_mail.value)
        if(!matched)
            login_mailError.textContent = "Mail id not available";
        else    
            login_mailError.textContent = "";
    }
    catch(error){
        console.error("Error:", error);
    }
});

// Password Validation
login_password.addEventListener("input",function () {
    if(login_password.value.trim() === "")
        login_passError.textContent = "Password cannot be empty"
    else    
        login_passError.textContent = "";
});

async function login(email, password) {
    // check if user exists
    let res = await fetch(`http://localhost:5000/users?email=${email}`);
    let users = await res.json();

    if (users.length === 0) 
        throw new Error("User not found");
    let user = users[0];
    // validate password
    if (user.password !== password) 
        throw new Error("Wrong password");

    // update this user’s status to login
    await fetch(`http://localhost:5000/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "login" }) 
    });

    localStorage.setItem("currentUser", JSON.stringify({ ...user,status: "login" }));
    if(localStorage.getItem("confirmedBookings"))
        window.location.href="/booking/bookingForm/bookingForm.html";
    
}

// Login Button Click
loginBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    if (login_mail.value && login_password.value) {
        try {
            await login(login_mail.value, login_password.value); 
        } catch (err) {
            alert(err.message);
        }
    } else {
        alert("Please fill all fields correctly");
    }
});