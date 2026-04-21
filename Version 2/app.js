// =====================================================
// PHASE MANAGEMENT SYSTEM
// =====================================================

const SESSION_KEY = "timeChime.session";
const CURRENT_USER_KEY = "timeChime.currentUser";

// Phase elements
const phase1Login = document.getElementById("phase1-login");
const phase2OTP = document.getElementById("phase2-otp");
const phase3Dashboard = document.getElementById("phase3-dashboard");

// Phase 1: Login
const loginForm = document.getElementById("loginForm");
const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");
const loginError = document.getElementById("loginError");

// Phase 2: OTP
const otpForm = document.getElementById("otpForm");
const otpInput = document.getElementById("otpInput");
const otpError = document.getElementById("otpError");
const backToLoginBtn = document.getElementById("backToLoginBtn");

// Phase 3: Dashboard
const logoutBtn = document.getElementById("logoutBtn");
const currentUserLabel = document.getElementById("currentUserLabel");
const navLinks = document.querySelectorAll(".nav-link");
const viewContainers = document.querySelectorAll(".view-container");

// Utility functions
function hideAllPhases() {
  phase1Login.classList.add("hidden");
  phase2OTP.classList.add("hidden");
  phase3Dashboard.classList.add("hidden");
}

function showPhase(phaseElement) {
  hideAllPhases();
  phaseElement.classList.remove("hidden");
}

function clearErrors() {
  loginError.textContent = "";
  otpError.textContent = "";
}

// =====================================================
// PHASE 1: LOGIN HANDLER
// =====================================================

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearErrors();

  const username = loginUsername.value.trim();
  const password = loginPassword.value;

  if (!username || !password) {
    loginError.textContent = "Username and password are required";
    return;
  }

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    console.log("Login response status:", response.status);
    const result = await response.json();
    console.log("Login response:", result);

    if (!response.ok) {
      loginError.textContent = result.error || "Login failed. Please check your credentials.";
      return;
    }

    // Store user info in session
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(result.user));

    // Move to Phase 2: OTP
    showPhase(phase2OTP);
    otpInput.focus();

  } catch (error) {
    console.error("Login error:", error);
    loginError.textContent = "Unable to connect to the server. Please try again.";
  }
});

// =====================================================
// PHASE 2: OTP VERIFICATION HANDLER
// =====================================================

otpForm.addEventListener("submit", (event) => {
  event.preventDefault();
  clearErrors();

  const enteredOTP = otpInput.value.trim();
  const DEFAULT_OTP = "123456";

  if (!enteredOTP) {
    otpError.textContent = "Please enter the OTP";
    return;
  }

  if (enteredOTP === DEFAULT_OTP) {
    // OTP verified! Move to Phase 3: Dashboard
    sessionStorage.setItem(SESSION_KEY, "authenticated");
    initializeDashboard();
    showPhase(phase3Dashboard);
  } else {
    otpError.textContent = "Invalid OTP. Please try again. (Hint: 123456)";
    otpInput.value = "";
    otpInput.focus();
  }
});

backToLoginBtn.addEventListener("click", () => {
  clearErrors();
  otpInput.value = "";
  loginForm.reset();
  showPhase(phase1Login);
  loginUsername.focus();
});

// =====================================================
// PHASE 3: DASHBOARD INITIALIZATION & HANDLERS
// =====================================================

function initializeDashboard() {
  const user = JSON.parse(sessionStorage.getItem(CURRENT_USER_KEY));
  if (user) {
    currentUserLabel.textContent = user.username || user.email || "User";
  }

  // Load initial dashboard data
  loadDashboardData();
}

function loadDashboardData() {
  const todaySchedule = document.getElementById("todaySchedule");
  const activeProjects = document.getElementById("activeProjects");
  const teamStatus = document.getElementById("teamStatus");
  const quickStats = document.getElementById("quickStats");

  // Sample data - replace with actual API calls
  todaySchedule.innerHTML = `
    <ul style="list-style: none; padding: 0; margin: 0;">
      <li>🕙 09:00 - Daily Standup</li>
      <li>🕐 11:00 - Team Sync</li>
      <li>🕐 14:00 - Client Demo</li>
    </ul>
  `;

  activeProjects.innerHTML = `
    <ul style="list-style: none; padding: 0; margin: 0;">
      <li>✓ Project Alpha - 80%</li>
      <li>✓ Project Beta - 65%</li>
      <li>✓ Project Gamma - 45%</li>
    </ul>
  `;

  teamStatus.innerHTML = `
    <ul style="list-style: none; padding: 0; margin: 0;">
      <li>🟢 5 Available</li>
      <li>🟡 3 In Meeting</li>
      <li>🔴 2 On Leave</li>
    </ul>
  `;

  quickStats.innerHTML = `
    <ul style="list-style: none; padding: 0; margin: 0;">
      <li>📊 Tasks Completed: 17/25</li>
      <li>⏰ On-time Rate: 92%</li>
      <li>📈 Productivity: 88%</li>
    </ul>
  `;
}

// Navigation between views
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const viewName = link.dataset.view;

    // Update active link
    navLinks.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");

    // Update visible view
    viewContainers.forEach((container) => container.classList.remove("active"));
    const activeView = document.getElementById(`view-${viewName}`);
    if (activeView) {
      activeView.classList.add("active");
    }
  });
});

// Logout handler
logoutBtn.addEventListener("click", () => {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(CURRENT_USER_KEY);
  loginForm.reset();
  clearErrors();
  otpInput.value = "";
  showPhase(phase1Login);
  loginUsername.focus();
});

// Check if already authenticated on page load
document.addEventListener("DOMContentLoaded", () => {
  const isAuthenticated = sessionStorage.getItem(SESSION_KEY);
  if (isAuthenticated) {
    initializeDashboard();
    showPhase(phase3Dashboard);
  } else {
    showPhase(phase1Login);
  }
});

