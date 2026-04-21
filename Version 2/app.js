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

// Phase 1: Registration
const registrationForm = document.getElementById("registrationForm");
const loginTabBtn = document.getElementById("loginTabBtn");
const registerTabBtn = document.getElementById("registerTabBtn");
const registrationError = document.getElementById("registrationError");
const registrationSuccess = document.getElementById("registrationSuccess");

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
  registrationError.textContent = "";
  registrationSuccess.textContent = "";
}

// =====================================================
// TAB TOGGLE: LOGIN vs REGISTRATION
// =====================================================

function toggleTab(tabName) {
  // Hide/show forms
  if (tabName === "login") {
    loginForm.classList.remove("hidden");
    loginForm.classList.add("active");
    registrationForm.classList.add("hidden");
    registrationForm.classList.remove("active");
    loginTabBtn.classList.add("active");
    registerTabBtn.classList.remove("active");
  } else {
    loginForm.classList.add("hidden");
    loginForm.classList.remove("active");
    registrationForm.classList.remove("hidden");
    registrationForm.classList.add("active");
    loginTabBtn.classList.remove("active");
    registerTabBtn.classList.add("active");
  }
  clearErrors();
}

// Tab button event listeners
loginTabBtn.addEventListener("click", () => toggleTab("login"));
registerTabBtn.addEventListener("click", () => toggleTab("register"));

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
// PHASE 1: REGISTRATION HANDLER
// =====================================================

registrationForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearErrors();

  // Get form values
  const firstName = document.getElementById("regFirstName").value.trim();
  const lastName = document.getElementById("regLastName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const phone = document.getElementById("regPhone").value.trim();
  const department = document.getElementById("regDepartment").value.trim();
  const designation = document.getElementById("regDesignation").value.trim();
  const username = document.getElementById("regUsername").value.trim();
  const password = document.getElementById("regPassword").value;
  const confirmPassword = document.getElementById("regConfirmPassword").value;

  // Validate all fields
  if (!firstName || !lastName || !email || !phone || !department || !designation || !username || !password || !confirmPassword) {
    registrationError.textContent = "All fields are required";
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    registrationError.textContent = "Please enter a valid email address";
    return;
  }

  // Validate password length
  if (password.length < 8) {
    registrationError.textContent = "Password must be at least 8 characters";
    return;
  }

  // Validate passwords match
  if (password !== confirmPassword) {
    registrationError.textContent = "Passwords do not match";
    return;
  }

  // Validate username format (alphanumeric + dots/underscores)
  const usernameRegex = /^[a-zA-Z0-9._]+$/;
  if (!usernameRegex.test(username)) {
    registrationError.textContent = "Username can only contain letters, numbers, dots, and underscores";
    return;
  }

  try {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        phone,
        department,
        designation,
        username,
        password
      })
    });

    const result = await response.json();

    if (!response.ok) {
      registrationError.textContent = result.error || "Registration failed. Please try again.";
      return;
    }

    // Success!
    registrationSuccess.textContent = "✓ Registration successful! Please login with your new account.";
    registrationForm.reset();

    // Return to login tab after 2 seconds
    setTimeout(() => {
      toggleTab("login");
      loginUsername.focus();
    }, 2000);

  } catch (error) {
    console.error("Registration error:", error);
    registrationError.textContent = "Unable to connect to the server. Please try again.";
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

