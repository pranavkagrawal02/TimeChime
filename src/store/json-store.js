const fs = require("fs/promises");
const path = require("path");

function nextId(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createJsonStore({ dbPath }) {
  async function readDb() {
    const content = await fs.readFile(dbPath, "utf8");
    return JSON.parse(content);
  }

  async function writeDb(data) {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
  }

  return {
    provider: "json",
    async getBootstrap() {
      return readDb();
    },
    async validateLogin(username, password) {
      const adminUser = process.env.DEMO_ADMIN_USERNAME || "admin";
      const adminPassword = process.env.DEMO_ADMIN_PASSWORD || "admin";
      const valid = (username === adminUser && password === adminPassword) || (username && username === password);
      if (!valid) {
        return null;
      }

      return {
        username,
        role: username === adminUser ? "Administrator" : "Demo user"
      };
    },
    async createUser(payload) {
      const db = await readDb();
      const user = {
        id: nextId(db.users),
        name: payload.name,
        role: payload.role,
        type: payload.type
      };
      db.users.unshift(user);
      await writeDb(db);
      return user;
    },
    async createProject(payload) {
      const db = await readDb();
      const project = {
        id: nextId(db.projects),
        name: payload.name,
        ownerId: payload.ownerId,
        status: payload.status
      };
      db.projects.unshift(project);
      await writeDb(db);
      return project;
    },
    async createFinance(payload) {
      const db = await readDb();
      const finance = {
        id: nextId(db.finances),
        projectId: payload.projectId,
        type: payload.type,
        amount: payload.amount,
        status: payload.status,
        note: payload.note
      };
      db.finances.unshift(finance);
      await writeDb(db);
      return finance;
    },
    async updateFinance(id, payload) {
      const db = await readDb();
      const finance = db.finances.find((item) => item.id === id);
      if (!finance) {
        return null;
      }

      finance.projectId = payload.projectId ?? finance.projectId;
      finance.type = payload.type ?? finance.type;
      finance.amount = payload.amount ?? finance.amount;
      finance.status = payload.status ?? finance.status;
      finance.note = payload.note ?? finance.note;
      await writeDb(db);
      return finance;
    },
    async deleteFinance(id) {
      const db = await readDb();
      const index = db.finances.findIndex((item) => item.id === id);
      if (index === -1) {
        return false;
      }

      db.finances.splice(index, 1);
      await writeDb(db);
      return true;
    },
    async createHoliday(payload) {
      const db = await readDb();
      const holiday = {
        id: nextId(db.holidays),
        name: payload.name,
        used: payload.used,
        total: payload.total
      };
      db.holidays.unshift(holiday);
      await writeDb(db);
      return holiday;
    },
    async updateHoliday(id, payload) {
      const db = await readDb();
      const holiday = db.holidays.find((item) => item.id === id);
      if (!holiday) {
        return null;
      }

      holiday.name = payload.name ?? holiday.name;
      holiday.used = payload.used ?? holiday.used;
      holiday.total = payload.total ?? holiday.total;
      await writeDb(db);
      return holiday;
    },
    async createSchedule(payload) {
      const db = await readDb();
      const schedule = {
        id: nextId(db.schedules),
        range: payload.range,
        day: payload.day,
        title: payload.title,
        note: payload.note,
        color: payload.color
      };
      db.schedules.unshift(schedule);
      await writeDb(db);
      return schedule;
    },
    async updateSchedule(id, payload) {
      const db = await readDb();
      const schedule = db.schedules.find((item) => item.id === id);
      if (!schedule) {
        return null;
      }

      schedule.range = payload.range ?? schedule.range;
      schedule.day = payload.day ?? schedule.day;
      schedule.title = payload.title ?? schedule.title;
      schedule.note = payload.note ?? schedule.note;
      schedule.color = payload.color ?? schedule.color;
      await writeDb(db);
      return schedule;
    },
    async deleteSchedule(id) {
      const db = await readDb();
      const index = db.schedules.findIndex((item) => item.id === id);
      if (index === -1) {
        return false;
      }

      db.schedules.splice(index, 1);
      await writeDb(db);
      return true;
    },
    async createTodo(payload) {
      const db = await readDb();
      const todo = {
        id: nextId(db.todos),
        text: payload.text,
        done: false
      };
      db.todos.unshift(todo);
      await writeDb(db);
      return todo;
    },
    async updateTodo(id, payload) {
      const db = await readDb();
      const todo = db.todos.find((item) => item.id === id);
      if (!todo) {
        return null;
      }

      todo.done = payload.done ?? todo.done;
      await writeDb(db);
      return todo;
    },
    async deleteTodo(id) {
      const db = await readDb();
      const index = db.todos.findIndex((item) => item.id === id);
      if (index === -1) {
        return false;
      }

      db.todos.splice(index, 1);
      await writeDb(db);
      return true;
    },
    async updateMeeting(id, payload) {
      const db = await readDb();
      const meeting = db.meetings.find((item) => item.id === id);
      if (!meeting) {
        return null;
      }

      meeting.notes = payload.notes ?? meeting.notes;
      await writeDb(db);
      return meeting;
    },
    async exportSeed() {
      return clone(await readDb());
    }
  };
}

module.exports = { createJsonStore };
