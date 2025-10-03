var hamburger_btn=document.getElementById("hamburger-btn");
var sidebar=document.getElementById("sidebar");
hamburger_btn.addEventListener("click",function() {
    sidebar.classList.toggle("hidden");
});
       
var close_btn=document.getElementById("close-btn");
close_btn.addEventListener("click",function() {
    sidebar.classList.toggle("hidden");
});

document.getElementById("nav-login").addEventListener("click",function(){
    document.getElementById("login-modal").classList.remove("hidden");
});

document.getElementById("side-login").addEventListener("click",function(){
    document.getElementById("login-modal").classList.remove("hidden");
});

document.getElementById("login-change").addEventListener("click",function(){
    document.getElementById("signup-modal").classList.add("hidden");
    document.getElementById("login-modal").classList.remove("hidden");
});

document.getElementById("signup-change").addEventListener("click",function(){
document.getElementById("signup-modal").classList.remove("hidden");
    document.getElementById("login-modal").classList.add("hidden");
});

document.getElementById("reset-change").addEventListener("click",function(){
    document.getElementById("login-modal").classList.add("hidden");
    document.getElementById("reset-modal").classList.remove("hidden");
});

document.getElementById("forget-change").addEventListener("click",function(){
    document.getElementById("login-modal").classList.add("hidden");
    document.getElementById("forget-modal").classList.remove("hidden");
});

document.getElementById("close-signup-modal").addEventListener("click",function(){
    document.getElementById("signup-modal").classList.add("hidden");
});

document.getElementById("close-login-modal").addEventListener("click",function(){
    document.getElementById("login-modal").classList.add("hidden");
});

document.getElementById("close-reset-modal").addEventListener("click",function(){
    document.getElementById("reset-modal").classList.add("hidden");
});

document.getElementById("close-forget-modal").addEventListener("click",function(){
    document.getElementById("forget-modal").classList.add("hidden");
});

const API = "http://localhost:5000/users";

let currentUser=JSON.parse(localStorage.getItem("currentUser"));
const navLogin = document.getElementById('nav-login');
const navUserDropdown = document.getElementById('nav-user-dropdown');
const navUsername = document.getElementById('nav-username');
const sideUserSection = document.getElementById('side-user-section');
const sideUsername = document.getElementById('side-username');
const sideLogin = document.getElementById('side-login');

if (currentUser && currentUser.status=="login") {
    navLogin.classList.add('hidden');
    navUserDropdown.classList.remove('hidden');
    navUsername.textContent = currentUser.name;

    sideLogin.classList.add('hidden');
    sideUserSection.classList.remove('hidden');
    sideUsername.textContent = currentUser.name;
} else {
    navLogin.classList.remove('hidden');
    navUserDropdown.classList.add('hidden');
    
    sideLogin.classList.remove('hidden');
    sideUserSection.classList.add('hidden');
}

document.getElementById("nav-profile").addEventListener("click",function(){
    if(currentUser && currentUser.role=="user")
        window.location.href="./dashboard/UserDashboard/profile/profile.html";
    else    
        window.location.href="./dashboard/AdminDashboard/profile/profile.html";
});

document.getElementById("nav-dashboard").addEventListener("click",function(){
    window.location.href="./dashboard/AdminDashboard/dashboard/dashboard.html";
});
document.getElementById("nav-my-bookings").addEventListener("click",function(){
    window.location.href="./dashboard/UserDashboard/bookings/bookings.html";
});

document.getElementById("side-profile").addEventListener("click",function(){
    if(currentUser && currentUser.role=="user")
        window.location.href="./dashboard/UserDashboard/profile/profile.html";
    else    
        window.location.href="./dashboard/AdminDashboard/profile/profile.html";
});

document.getElementById("side-dashboard").addEventListener("click",function(){
    window.location.href="./dashboard/AdminDashboard/dashboard/dashboard.html";
});
document.getElementById("side-my-bookings").addEventListener("click",function(){
    window.location.href="./dashboard/UserDashboard/bookings/bookings.html";
});

if(currentUser && currentUser.role=="admin")
{
    document.getElementById("nav-my-bookings").classList.add("hidden");
    document.getElementById("nav-dashboard").classList.remove("hidden");
    document.getElementById("side-my-bookings").classList.add("hidden");
    document.getElementById("side-dashboard").classList.remove("hidden");
}
else
{
    document.getElementById("nav-dashboard").classList.add("hidden");
    document.getElementById("nav-my-bookings").classList.remove("hidden");
    document.getElementById("side-dashboard").classList.add("hidden");
    document.getElementById("side-my-bookings").classList.remove("hidden");
}

const navUserBtn = document.getElementById('nav-user-btn');
const navUserMenu = document.getElementById('nav-user-menu');
const navDropdownArrow = document.getElementById('nav-dropdown-arrow');
const navLogoutBtn = document.getElementById('nav-logout-btn');
const sideLogoutBtn = document.getElementById('side-logout-btn');

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
sideLogoutBtn.addEventListener('click',logout);

async function logout() {
  await fetch(`${API}/${currentUser.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "logout" }),
  });
  window.location.href = "/index.html";
  localStorage.removeItem("currentUser");
}

var today = new Date();
var yyyy = today.getFullYear();
var mm = String(today.getMonth() + 1).padStart(2, '0');
var dd = String(today.getDate()).padStart(2, '0');
var currentDate = `${yyyy}-${mm}-${dd}`;
var checkIn = document.getElementById("check-in");
var checkOut = document.getElementById("check-out");

// Set initial min attributes
checkIn.setAttribute("min", currentDate);
checkOut.setAttribute("min", currentDate);

// On check-in blur event
checkIn.addEventListener("change", function () {
    let dIn = new Date(checkIn.value);
    let todayDate = new Date(currentDate);
    if(checkIn.value==="")
        checkOut.setAttribute("min", currentDate);
    else if (dIn < todayDate) {
        alert("Check-in date cannot be before today");
        checkIn.value = "";
        checkOut.setAttribute("min", currentDate);
    } else {
        // Set check-out min to match check-in date
        checkOut.setAttribute("min", checkIn.value);

        // Auto-clear check-out if earlier than new min
        if (checkOut.value && new Date(checkOut.value) <= dIn) 
            checkOut.value = "";
    }
});

// On check-out blur event
checkOut.addEventListener("change", function () {
    let dIn = new Date(checkIn.value);
    let dOut = new Date(checkOut.value);

    if (!checkIn.value) {
        alert("Please select check-in date first");
        checkOut.value = "";
        checkOut.setAttribute("min", currentDate);
    } else if (dOut <= dIn) {
        alert("Check-out must be after check-in date");
        checkOut.value = "";
    }
});

const toggleBtn = document.getElementById("guest-toggle");
const panel = document.getElementById("guest-panel")
let guests = 1;
let rooms = 1;

const addPanel = document.getElementById("add");

// Toggle dropdown
toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent closing immediately
    panel.classList.toggle("hidden");
});

const addRoomBtn = document.getElementById("add-room");
const removeRoomBtn = document.getElementById("remove-room");
const addRoomBtnWrapper = document.getElementById("add-room-btn"); // insertion point

// compute total guests by summing all .people-count spans
function getTotalGuests() {
    return Array.from(addPanel.querySelectorAll(".people-count")).map(s => parseInt(s.textContent, 10) || 0).reduce((a, b) => a + b, 0);
}

function updateLabel() {
    const guests = getTotalGuests();
    // toggleBtn is from your existing code
    toggleBtn.textContent = `${guests} Guest${guests > 1 ? "s" : ""}, ${rooms} Room${rooms > 1 ? "s" : ""}`;
}

// delegation: handle + / - for any room (existing or future)
addPanel.addEventListener("click", (e) => {
    const target = e.target;
    // the + button
    if (target.classList.contains("increment")) {
        const controls = target.parentElement; // the container that has the counter
        const cnt = controls.querySelector(".people-count");
        cnt.textContent = parseInt(cnt.textContent || "0", 10) + 1;
        updateLabel();
    }

    // the - button
    if (target.classList.contains("decrement")) {
        const controls = target.parentElement;
        const cnt = controls.querySelector(".people-count");
        const val = parseInt(cnt.textContent || "0", 10);
        if (val > 1) {
            cnt.textContent = val - 1;
            updateLabel();
        }
    }
});

// Add room 
addRoomBtn.addEventListener("click", async () => {
    const rRes=await fetch("http://localhost:5000/rooms");
    const res=await rRes.json();
    if(rooms==res.length)
    {
        alert("No more rooms available");
        return;
    }
    rooms++;
    const fullDiv = document.createElement("div");
    fullDiv.innerHTML = `
        <div class="flex justify-between items-center">
            <span class="font-semibold">Room ${rooms}</span>
        </div>
        <div class="flex gap-2 sm:justify-between items-center">
            <span>Person(s)</span>
            <div class="flex items-center gap-3">
                <button class="decrement w-8 h-8 border rounded-full">-</button>
                <span class="people-count">1</span>
                <button class="increment w-8 h-8 border rounded-full">+</button>
            </div>
        </div>
    `;
    addPanel.insertBefore(fullDiv, addRoomBtnWrapper);
    updateLabel();
});

// Remove room 
removeRoomBtn.addEventListener("click", () => {
    if (rooms > 1) {
        const lastRoom = addRoomBtnWrapper.previousElementSibling;
        if (lastRoom) {
            addPanel.removeChild(lastRoom);
            rooms--;
            updateLabel();
        }
    }
});

// initial label
updateLabel();

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
    if (!panel.contains(e.target) && !toggleBtn.contains(e.target)) 
        panel.classList.add("hidden");
});

function getRoomsData() {
    let rooms = [];
    document.querySelectorAll("#guest-panel .people-count").forEach((cnt, i) => {
        rooms.push({
            roomNo: i + 1,
            guests: parseInt(cnt.textContent, 10)
        });
    });
    return rooms;
}

document.getElementById("book-btn").addEventListener("click", () => {
    if(!checkIn.value || !checkOut.value)
        alert("Please select check-in and check-out date!");
    else
    {
        const bookingData = {
            checkin: document.getElementById("check-in").value,
            checkout: document.getElementById("check-out").value,
            rooms: getRoomsData()
        };
        localStorage.setItem("bookingData", JSON.stringify(bookingData));
        window.location.href = "/booking/viewrooms/viewrooms.html";
    }
});

const carousel1 = document.getElementById('carousel1');
const slides1 = carousel1.children;
let index1 = 0;

function slideNext1() {
    index1++;
    if (index1 >= slides1.length) 
        index1 = 0;
    carousel1.style.transform = `translateX(-${index1 * 100}%)`;
}

// Set each slide to full width
Array.from(slides1).forEach(slide => {
    slide.classList.add('w-full');
});

// Auto-slide every 3 seconds
setInterval(slideNext1, 3000);

const carousel2 = document.getElementById('carousel2');
const slides2 = carousel2.children;
let index2 = 0;

function slideNext2() {
    index2++;
    if (index2 >= slides2.length) 
        index2 = 0;
    carousel2.style.transform = `translateX(-${index2 * 100}%)`;
}

// Set each slide to full width
Array.from(slides2).forEach(slide => {
    slide.classList.add('w-full');
});

// Auto-slide every 3 seconds
setInterval(slideNext2, 3000);

const scrollBtn = document.getElementById('scroll-top-bottom');
const footer = document.getElementById('footer');

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const windowH = window.innerHeight;
    const footerTop = footer.offsetTop;

    // Show button after 200px scroll
    if (scrollY > 200) {
        scrollBtn.classList.remove('hidden');
        scrollBtn.classList.add('flex');
    } else {
        scrollBtn.classList.add('hidden');
        scrollBtn.classList.remove('flex');
    }

    // If we're close to the footer, lift the button up
    if (scrollY + windowH >= footerTop) {
        scrollBtn.style.position = "absolute";
        scrollBtn.style.bottom = `${windowH + scrollY - footerTop + 20}px`; // lift above footer
    } else {
        scrollBtn.style.position = "fixed";
        scrollBtn.style.bottom = "1.5rem"; // Tailwind's bottom-6
    }
});

// Smooth scroll to top
scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});


// Get elements
const termsBtn = document.getElementById("termsmodalbtn");
const cancelBtn = document.getElementById("cancelmodalbtn");
const termsModal = document.getElementById("termsModal");
const cancelModal = document.getElementById("cancelModal");
const closeTerms = document.querySelector(".closeTerms");
const closeCancel = document.querySelector(".closeCancel");

// Open modals
termsBtn.addEventListener("click", () => termsModal.classList.remove("hidden"));
cancelBtn.addEventListener("click", () => cancelModal.classList.remove("hidden"));

// Close modals
closeTerms.addEventListener("click", () => termsModal.classList.add("hidden"));
closeCancel.addEventListener("click", () => cancelModal.classList.add("hidden"));

// Close when clicking outside modal content
window.addEventListener("click", (e) => {
    if (e.target === termsModal) termsModal.classList.add("hidden");
    if (e.target === cancelModal) cancelModal.classList.add("hidden");
});
let nameInput = document.getElementById("name");
let emailInput = document.getElementById("email");
let msgInput = document.getElementById("message");

let nameError = document.getElementById("name-error");
let emailError = document.getElementById("email-error");
let msgError = document.getElementById("message-error");

let notifications = { name: "", email: "", message: "" };

// Validation functions
function validateName() {
    if (nameInput.value.trim() === "") {
        nameError.textContent = "Name should not be empty!";notifications.name;
        return false;
    } else {
        notifications.name = "";
        nameError.textContent = "";
        return true;
    }
}

function validateEmail() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailInput.value.trim() === "") {
        emailError.textContent = "Email should not be empty!";
        return false;
    } else if (!emailRegex.test(emailInput.value.trim())) {
        emailError.textContent = "Please enter a valid email!";
        return false;
    } else {
        notifications.email = emailInput.value;
        emailError.textContent = "";
        return true;
    }
}

function validateMessage() {
    if (msgInput.value.trim() === "") {
        msgError.textContent = "Message should not be empty!";
        return false;
    } else {
        notifications.message = msgInput.value;
        msgError.textContent = "";
        return true;
    }
  }

// Attach real-time validation
nameInput.addEventListener("input", validateName);
emailInput.addEventListener("input", validateEmail);
msgInput.addEventListener("input", validateMessage);
if(currentUser)
{
    nameInput.disabled=true;
    nameInput.value=currentUser.name;
    emailInput.disabled=true;
    emailInput.value=currentUser.email;
}

// Form submit
document.getElementById('contactForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isMsgValid = validateMessage();
    if (!isNameValid || !isEmailValid || !isMsgValid) {
        alert("Please fill all fileds correctly!")
        return;
    }
    const formData = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      message: msgInput.value.trim(),
      timestamp: new Date().toISOString(),
      status: "unread" // for admin side (unread/read)
    };
    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    try {
        // Save to db.json (via JSON Server API)
        let response = await fetch("http://localhost:5000/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error("Failed to save notification");

        // Reset form
        this.reset();
        notifications = { name: "", email: "", message: "" };

        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;

        // Show success modal
        document.getElementById('successModal').classList.remove('hidden');
        document.getElementById('successModal').classList.add('flex');
        setTimeout(() => {
            successModal.classList.add('hidden');
            successModal.classList.remove('flex');
        }, 3000);
    } catch (err) {
        alert("Something went wrong. Please try again.");
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});