// ===== Helper: Get Admin User for Password Check =====
async function isAdminPasswordValid(password) {
  // Use the same hash logic as login
  const hashed = hashPassword(password);
  // Try to find admin user in DB (via store)
  const adminUser = process.env.DEMO_ADMIN_USERNAME || "admin";
  const admin = await store.validateLogin(adminUser, hashed);
  return !!admin && admin.role && admin.role.toLowerCase().includes("admin");
}

// ===== Helper: Read/Decrypt Employee JSON File =====
function readAndDecryptEmpJson(fileName) {
  const empDetailsDir = path.join(ROOT, "EmpDetailsJSON");
  const filePath = path.join(empDetailsDir, fileName);
  if (!fs.existsSync(filePath)) throw new Error("File not found");
  const encObj = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return decryptJsonData(encObj, DEFAULT_SALT, DEFAULT_KEY);
}

// ===== Helper: Encrypt/Write Employee JSON File =====
function encryptAndWriteEmpJson(fileName, jsonData) {
  const empDetailsDir = path.join(ROOT, "EmpDetailsJSON");
  const filePath = path.join(empDetailsDir, fileName);
  const encrypted = encryptJsonData(jsonData, DEFAULT_SALT, DEFAULT_KEY);
  fs.writeFileSync(filePath, JSON.stringify(encrypted, null, 2), "utf8");
}
const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const crypto = require("crypto");
const { createStore } = require("./src/store");

const ROOT = __dirname;

// ===== Password Hashing Function =====
function hashPassword(password) {
  return crypto.createHash("sha256").update(password + "timechime_salt_2026").digest("hex");
}


// ===== Encryption Helpers =====
const DEFAULT_SALT = "nielit";
const DEFAULT_KEY = "nielit";
function getEncryptionKey(salt = DEFAULT_SALT, key = DEFAULT_KEY) {
  // AES-256 needs 32 bytes key
  const fullKey = (salt + key).padEnd(32, "_").slice(0, 32);
  return Buffer.from(fullKey, "utf8");
}

function encryptJsonData(jsonObj, salt = DEFAULT_SALT, key = DEFAULT_KEY) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", getEncryptionKey(salt, key), iv);
  const jsonStr = JSON.stringify(jsonObj);
  let encrypted = cipher.update(jsonStr, "utf8", "base64");
  encrypted += cipher.final("base64");
  return {
    iv: iv.toString("base64"),
    data: encrypted
  };
}

function decryptJsonData(encObj, salt = DEFAULT_SALT, key = DEFAULT_KEY) {
  const iv = Buffer.from(encObj.iv, "base64");
  const encrypted = encObj.data;
  const decipher = crypto.createDecipheriv("aes-256-cbc", getEncryptionKey(salt, key), iv);
  let decrypted = decipher.update(encrypted, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return JSON.parse(decrypted);
}

// ===== JSON File Creation Function (Encrypted) =====
async function createEmployeeJsonFile(empID, employeeData) {
  try {
    const empDetailsDir = path.join(ROOT, "EmpDetailsJSON");
    if (!fs.existsSync(empDetailsDir)) {
      fs.mkdirSync(empDetailsDir, { recursive: true });
    }
    const firstName = employeeData.EmpFirstName || "Employee";
    const fileName = `${empID}_${firstName}.json`;
    const filePath = path.join(empDetailsDir, fileName);

    const jsonData = {
      empID: empID,
      empFirstName: employeeData.EmpFirstName || "",
      empLastName: employeeData.EmpLastName || "",
      empFullName: employeeData.EmpFullName || "",
      empDepartment: employeeData.EmpDept || "",
      empPosition: employeeData.EmpDesignation || "",
      empEmail: employeeData.EmpEmail || "",
      empPhone: employeeData.EmpPhone || "",
      empJoinDate: new Date().toISOString().split("T")[0],
      empStatus: employeeData.EmpStatus || "Active",
      empUsername: employeeData.Username || "",
      empPassword: employeeData.Password || "",
      empDesignation: employeeData.EmpDesignation || "",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      empImage: "profile_placeholder.jpg",
      empAddress: "",
      empCity: "",
      empState: "",
      empZipCode: "",
      empCountry: "India",
      emergencyContact: {
        name: "TBD",
        phone: "TBD",
        relation: "TBD"
      },
      schedule: {
        workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        workingHours: "09:00-18:00",
        officeLocation: "Head Office"
      },
      attendance: {
        presentDays: 0,
        absentDays: 0,
        leaveDays: 0
      },
      notes: "Newly registered employee",
      isActive: true
    };

    const encrypted = encryptJsonData(jsonData, DEFAULT_SALT, DEFAULT_KEY);
    fs.writeFileSync(filePath, JSON.stringify(encrypted, null, 2), "utf8");
    console.log(`Created encrypted JSON file: ${filePath}`);
    return true;
  } catch (error) {
    console.error("Error creating JSON file:", error);
    return false;
  }
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    if (!key || process.env[key] !== undefined) {
      continue;
    }

    let value = trimmed.slice(separatorIndex + 1).trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnvFile(path.join(ROOT, ".env"));

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT || 3000);
const PUBLIC_ROOT = path.join(ROOT, "public");
const store = createStore(ROOT);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function sendText(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(payload);
}

function serveFile(response, filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[extension] || "application/octet-stream";

  fs.readFile(filePath, (error, content) => {
    if (error) {
      sendText(response, 404, "File not found");
      return;
    }

    response.writeHead(200, { "Content-Type": contentType });
    response.end(content);
  });
}

function parseBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        request.destroy();
        reject(new Error("Payload too large"));
      }
    });
    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON payload"));
      }
    });
    request.on("error", reject);
  });
}

function notFound(response) {
  sendJson(response, 404, { error: "Not found" });
}

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeNumber(value) {
  return Number(value);
}

function buildDateTimeValue(dateValue, timeValue) {
  const date = normalizeText(dateValue);
  const time = normalizeText(timeValue);
  if (!date) return "";
  return `${date}T${time || "00:00"}:00`;
}

function formatApiErrorMessage(error) {
  const message = String(error?.message || "Server error");
  if (
    message.includes("CK_employeeCalendarNew_dates")
    || message.includes("CK_employeeCalendar_dates")
  ) {
    return "End time cannot be earlier than start time.";
  }
  return message;
}

function getRequestActor(request) {
  const username = normalizeText(request.headers["x-auth-username"]);
  const employeeCode = normalizeText(request.headers["x-auth-employee-code"]);
  const name = normalizeText(request.headers["x-auth-employee-name"]);
  const role = normalizeText(request.headers["x-auth-employee-role"]);
  return {
    username: username || null,
    employeeCode: employeeCode || null,
    name: name || null,
    role: role || null
  };
}

async function handleApi(request, response, pathname) {
    // ADMIN: View Employee JSON (Decrypted, password protected)
    if (request.method === "POST" && pathname === "/api/admin/view-emp-json") {
      try {
        const body = await parseBody(request);
        const { fileName, password } = body;
        if (!fileName || !password) {
          sendJson(response, 400, { error: "File name and password required" });
          return;
        }
        const valid = await isAdminPasswordValid(password);
        if (!valid) {
          sendJson(response, 403, { error: "Password incorrect" });
          return;
        }
        const data = readAndDecryptEmpJson(fileName);
        sendJson(response, 200, { data });
      } catch (err) {
        sendJson(response, 400, { error: err.message || "Failed to read file" });
      }
      return;
    }

    // ADMIN: Update Employee JSON (Encrypted, password protected)
    if (request.method === "POST" && pathname === "/api/admin/update-emp-json") {
      try {
        const body = await parseBody(request);
        const { fileName, password, data } = body;
        if (!fileName || !password || !data) {
          sendJson(response, 400, { error: "File name, password, and data required" });
          return;
        }
        const valid = await isAdminPasswordValid(password);
        if (!valid) {
          sendJson(response, 403, { error: "Password incorrect" });
          return;
        }
        encryptAndWriteEmpJson(fileName, data);
        sendJson(response, 200, { success: true });
      } catch (err) {
        sendJson(response, 400, { error: err.message || "Failed to update file" });
      }
      return;
    }
  const actor = getRequestActor(request);

  if (request.method === "POST" && pathname === "/api/login") {
    const body = await parseBody(request);
    const username = normalizeText(body.username);
    const password = String(body.password || "");
    const user = await store.validateLogin(username, hashPassword(password));
    if (!user) {
      sendJson(response, 401, { error: "Invalid username or password." });
      return;
    }

    sendJson(response, 200, { user });
    return;
  }

  if (request.method === "POST" && pathname === "/api/register") {
    const body = await parseBody(request);

    // Validate required fields
    const firstName = normalizeText(body.firstName);
    const lastName = normalizeText(body.lastName);
    const email = normalizeText(body.email);
    const phone = normalizeText(body.phone);
    const department = normalizeText(body.department);
    const designation = normalizeText(body.designation);
    const username = normalizeText(body.username);
    const password = String(body.password || "");

    if (!firstName || !lastName || !email || !phone || !department || !designation || !username || !password) {
      sendJson(response, 400, { error: "All fields are required" });
      return;
    }

    // Validate password length
    if (password.length < 8) {
      sendJson(response, 400, { error: "Password must be at least 8 characters" });
      return;
    }

    // Check if username already exists
    try {
      const existingUser = await store.checkUsernameExists(username);
      if (existingUser) {
        sendJson(response, 409, { error: "Username already exists" });
        return;
      }

      // Check if email already exists
      const existingEmail = await store.checkEmailExists(email);
      if (existingEmail) {
        sendJson(response, 409, { error: "Email already registered" });
        return;
      }

      // Register new employee
      const hashedPassword = hashPassword(password);
      const result = await store.registerNewEmployee({
        firstName,
        lastName,
        email,
        phone,
        department,
        designation,
        username,
        hashedPassword
      });

      if (result.error) {
        sendJson(response, 400, { error: result.error });
        return;
      }

      // Fetch employee data to create JSON file
      const employeeData = await store.getEmployeeById(result.empID);
      if (employeeData) {
        await createEmployeeJsonFile(result.empID, employeeData);
      }

      sendJson(response, 201, {
        success: true,
        message: "Registration successful",
        empID: result.empID,
        username: username
      });
      return;
    } catch (error) {
      sendJson(response, 500, { error: "Registration failed: " + error.message });
      return;
    }
  }

  if (request.method === "GET" && pathname === "/api/bootstrap") {
    sendJson(response, 200, await store.getBootstrap(actor));
    return;
  }

  if (request.method === "POST" && pathname === "/api/users") {
    const body = await parseBody(request);
    const payload = {
      name: normalizeText(body.name),
      role: normalizeText(body.role),
      type: normalizeText(body.type)
    };
    if (!payload.name || !payload.role || !payload.type) {
      sendJson(response, 400, { error: "Name, role, and type are required" });
      return;
    }

    sendJson(response, 201, await store.createUser(payload));
    return;
  }

  if (request.method === "POST" && pathname === "/api/projects") {
    const body = await parseBody(request);
    const payload = {
      name: normalizeText(body.name),
      ownerId: normalizeNumber(body.ownerId),
      status: normalizeText(body.status),
      priority: normalizeText(body.priority) || "Medium"
    };
    if (!payload.name || Number.isNaN(payload.ownerId) || !payload.status) {
      sendJson(response, 400, { error: "Project name, owner, and status are required" });
      return;
    }

    sendJson(response, 201, await store.createProject(payload, actor));
    return;
  }

  if (request.method === "PATCH" && pathname.startsWith("/api/projects/")) {
    const projectId = Number(pathname.split("/").pop());
    const body = await parseBody(request);
    const project = await store.updateProject(projectId, {
      status: body.status === undefined ? undefined : normalizeText(body.status),
      priority: body.priority === undefined ? undefined : normalizeText(body.priority),
      statusRemark: body.statusRemark === undefined ? undefined : normalizeText(body.statusRemark),
      statusUpdatedAt: body.statusUpdatedAt === undefined ? undefined : normalizeText(body.statusUpdatedAt),
      budget: body.budget === undefined || body.budget === null || body.budget === "" ? undefined : normalizeNumber(body.budget),
      spentAmount: body.spentAmount === undefined || body.spentAmount === null || body.spentAmount === "" ? undefined : normalizeNumber(body.spentAmount),
      pendingAmount: body.pendingAmount === undefined || body.pendingAmount === null || body.pendingAmount === "" ? undefined : normalizeNumber(body.pendingAmount),
      remainingAmount: body.remainingAmount === undefined || body.remainingAmount === null || body.remainingAmount === "" ? undefined : normalizeNumber(body.remainingAmount),
      financeRemark: body.financeRemark === undefined ? undefined : normalizeText(body.financeRemark),
      financeUpdatedAt: body.financeUpdatedAt === undefined ? undefined : normalizeText(body.financeUpdatedAt),
      deadlineDate: body.deadlineDate === undefined ? undefined : normalizeText(body.deadlineDate),
      expenseDelta: body.expenseDelta === undefined || body.expenseDelta === null || body.expenseDelta === "" ? undefined : normalizeNumber(body.expenseDelta),
      savingsDelta: body.savingsDelta === undefined || body.savingsDelta === null || body.savingsDelta === "" ? undefined : normalizeNumber(body.savingsDelta)
    }, actor);
    if (!project) {
      notFound(response);
      return;
    }

    sendJson(response, 200, project);
    return;
  }

  if (request.method === "DELETE" && pathname.startsWith("/api/projects/")) {
    const projectId = Number(pathname.split("/").pop());
    const deleted = await store.deleteProject(projectId, actor);
    if (!deleted) {
      notFound(response);
      return;
    }

    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method === "POST" && pathname === "/api/finances") {
    const body = await parseBody(request);
    const payload = {
      projectId: normalizeNumber(body.projectId),
      type: normalizeText(body.type),
      amount: normalizeNumber(body.amount),
      status: normalizeText(body.status),
      note: normalizeText(body.note)
    };
    if (Number.isNaN(payload.projectId) || !payload.type || Number.isNaN(payload.amount) || !payload.status) {
      sendJson(response, 400, { error: "Project, finance type, amount, and status are required" });
      return;
    }

    sendJson(response, 201, await store.createFinance(payload, actor));
    return;
  }

  if (request.method === "PATCH" && pathname.startsWith("/api/finances/")) {
    const financeId = Number(pathname.split("/").pop());
    const body = await parseBody(request);
    const finance = await store.updateFinance(financeId, {
      projectId: body.projectId === undefined ? undefined : normalizeNumber(body.projectId),
      type: body.type === undefined ? undefined : normalizeText(body.type),
      amount: body.amount === undefined ? undefined : normalizeNumber(body.amount),
      status: body.status === undefined ? undefined : normalizeText(body.status),
      note: body.note === undefined ? undefined : normalizeText(body.note)
    }, actor);
    if (!finance) {
      notFound(response);
      return;
    }

    sendJson(response, 200, finance);
    return;
  }

  if (request.method === "DELETE" && pathname.startsWith("/api/finances/")) {
    const financeId = Number(pathname.split("/").pop());
    const deleted = await store.deleteFinance(financeId, actor);
    if (!deleted) {
      notFound(response);
      return;
    }

    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method === "POST" && pathname === "/api/holidays") {
    const body = await parseBody(request);
    const payload = {
      name: normalizeText(body.name),
      used: body.used === undefined || body.used === null || body.used === "" ? undefined : normalizeNumber(body.used),
      total: body.total === undefined || body.total === null || body.total === "" ? undefined : normalizeNumber(body.total),
      holidayDate: normalizeText(body.holidayDate)
    };
    const isBalancePayload = payload.used !== undefined || payload.total !== undefined;
    const isCalendarPayload = Boolean(payload.holidayDate);
    if (!payload.name || (!isCalendarPayload && (!isBalancePayload || Number.isNaN(payload.used) || Number.isNaN(payload.total)))) {
      sendJson(response, 400, { error: "Holiday name plus either holiday date or used/total balance is required" });
      return;
    }

    sendJson(response, 201, await store.createHoliday(payload, actor));
    return;
  }

  if (request.method === "PATCH" && pathname.startsWith("/api/holidays/")) {
    const holidayId = Number(pathname.split("/").pop());
    const body = await parseBody(request);
    const holiday = await store.updateHoliday(holidayId, {
      name: body.name === undefined ? undefined : normalizeText(body.name),
      used: body.used === undefined || body.used === null || body.used === "" ? undefined : normalizeNumber(body.used),
      total: body.total === undefined || body.total === null || body.total === "" ? undefined : normalizeNumber(body.total),
      holidayDate: body.holidayDate === undefined ? undefined : normalizeText(body.holidayDate)
    }, actor);
    if (!holiday) {
      notFound(response);
      return;
    }

    sendJson(response, 200, holiday);
    return;
  }

  if (request.method === "POST" && pathname === "/api/schedules") {
    const body = await parseBody(request);
    const payload = {
      range: normalizeText(body.range),
      day: normalizeText(body.day),
      scheduleDate: normalizeText(body.scheduleDate),
      title: normalizeText(body.title),
      note: normalizeText(body.note),
      color: normalizeText(body.color)
    };
    if (!payload.range || !payload.day || !payload.title || !payload.note || !payload.color) {
      sendJson(response, 400, { error: "Range, day, title, note, and color are required" });
      return;
    }

    sendJson(response, 201, await store.createSchedule(payload, actor));
    return;
  }

  if (request.method === "PATCH" && pathname.startsWith("/api/schedules/")) {
    const scheduleId = Number(pathname.split("/").pop());
    const body = await parseBody(request);
    const schedule = await store.updateSchedule(scheduleId, {
      range: body.range === undefined ? undefined : normalizeText(body.range),
      day: body.day === undefined ? undefined : normalizeText(body.day),
      scheduleDate: body.scheduleDate === undefined ? undefined : normalizeText(body.scheduleDate),
      title: body.title === undefined ? undefined : normalizeText(body.title),
      note: body.note === undefined ? undefined : normalizeText(body.note),
      color: body.color === undefined ? undefined : normalizeText(body.color)
    }, actor);
    if (!schedule) {
      notFound(response);
      return;
    }

    sendJson(response, 200, schedule);
    return;
  }

  if (request.method === "DELETE" && pathname.startsWith("/api/schedules/")) {
    const scheduleId = Number(pathname.split("/").pop());
    const deleted = await store.deleteSchedule(scheduleId, actor);
    if (!deleted) {
      notFound(response);
      return;
    }

    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method === "POST" && pathname === "/api/todos") {
    const body = await parseBody(request);
    const payload = { text: normalizeText(body.text) };
    if (!payload.text) {
      sendJson(response, 400, { error: "Todo text is required" });
      return;
    }

    sendJson(response, 201, await store.createTodo(payload, actor));
    return;
  }

  if (request.method === "PATCH" && pathname.startsWith("/api/todos/")) {
    const todoId = Number(pathname.split("/").pop());
    const body = await parseBody(request);
    const todo = await store.updateTodo(todoId, { done: body.done === undefined ? undefined : Boolean(body.done) }, actor);
    if (!todo) {
      notFound(response);
      return;
    }

    sendJson(response, 200, todo);
    return;
  }

  if (request.method === "DELETE" && pathname.startsWith("/api/todos/")) {
    const todoId = Number(pathname.split("/").pop());
    const deleted = await store.deleteTodo(todoId, actor);
    if (!deleted) {
      notFound(response);
      return;
    }

    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method === "PATCH" && pathname.startsWith("/api/meetings/")) {
    const meetingId = Number(pathname.split("/").pop());
    const body = await parseBody(request);
    const meeting = await store.updateMeeting(meetingId, {
      title: body.title === undefined ? undefined : normalizeText(body.title),
      notes: body.notes === undefined ? undefined : String(body.notes),
      summary: body.summary === undefined ? undefined : String(body.summary),
      location: body.location === undefined ? undefined : normalizeText(body.location),
      link: body.link === undefined ? undefined : normalizeText(body.link),
      startDateTime: body.date === undefined ? undefined : buildDateTimeValue(body.date, body.startTime),
      endDateTime: body.date === undefined ? undefined : buildDateTimeValue(body.date, body.endTime || body.startTime)
    }, actor);
    if (!meeting) {
      notFound(response);
      return;
    }

    sendJson(response, 200, meeting);
    return;
  }

  if (request.method === "POST" && pathname === "/api/meetings") {
    const body = await parseBody(request);
    const payload = {
      title: normalizeText(body.title),
      notes: normalizeText(body.notes),
      summary: normalizeText(body.summary),
      location: normalizeText(body.location),
      link: normalizeText(body.link),
      startDateTime: buildDateTimeValue(body.date, body.startTime),
      endDateTime: buildDateTimeValue(body.date, body.endTime || body.startTime)
    };
    if (!payload.title || !payload.startDateTime || !payload.endDateTime) {
      sendJson(response, 400, { error: "Meeting title, date, start time, and end time are required" });
      return;
    }

    sendJson(response, 201, await store.createMeeting(payload, actor));
    return;
  }

  if (request.method === "DELETE" && pathname.startsWith("/api/meetings/")) {
    const meetingId = Number(pathname.split("/").pop());
    const deleted = await store.deleteMeeting(meetingId, actor);
    if (!deleted) {
      notFound(response);
      return;
    }

    response.writeHead(204);
    response.end();
    return;
  }

  notFound(response);
}

const server = http.createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url, `http://${request.headers.host}`);
    const pathname = requestUrl.pathname;

    if (pathname.startsWith("/api/")) {
      await handleApi(request, response, pathname);
      return;
    }

    const safePath = pathname === "/" ? "index.html" : pathname.slice(1);
    const filePath = path.join(PUBLIC_ROOT, safePath);
    if (!filePath.startsWith(PUBLIC_ROOT)) {
      sendText(response, 403, "Forbidden");
      return;
    }

    serveFile(response, filePath);
  } catch (error) {
    sendJson(response, 500, { error: formatApiErrorMessage(error) });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Schedule Tracker Hub running at http://${HOST}:${PORT} using ${store.provider} storage`);
});
