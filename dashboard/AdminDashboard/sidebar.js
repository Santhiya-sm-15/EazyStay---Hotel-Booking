const hamburger_btn = document.getElementById("hamburger-btn");
const sidebar = document.getElementById("sidebar");
const close_btn = document.getElementById("close-btn");


hamburger_btn.addEventListener("click", () => sidebar.classList.toggle("hidden"));
close_btn.addEventListener("click", () => sidebar.classList.toggle("hidden"));


// Logout
document.getElementById("nav-logout").addEventListener("click", logout);
document.getElementById("side-logout").addEventListener("click", logout);

async function logout() {
  const API="http://localhost:5000/users";
  const currentUser=JSON.parse(localStorage.getItem("currentUser"));
  await fetch(`${API}/${currentUser.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "logout" }),
  });
  window.location.href = "/index.html";
  localStorage.removeItem("currentUser");
}