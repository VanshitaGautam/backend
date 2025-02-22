const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;
app.use(express.static(path.join(__dirname, 'public')));
// Middleware for logging requests with timestamps
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`);
    next();
});

// Middleware to parse JSON and form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set EJS as the templating engine
app.set("view engine", "ejs");

// Load tasks from JSON file
const loadTasks = () => {
    try {
        const data = fs.readFileSync(path.join(__dirname, "tasks.json"), "utf-8");
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

// Save tasks to JSON file
const saveTasks = (tasks) => {
    fs.writeFileSync(path.join(__dirname, "tasks.json"), JSON.stringify(tasks, null, 2));
};

// **ROUTES**
// 1️⃣ GET /tasks → Show all tasks
app.get("/tasks", (req, res) => {
    const tasks = loadTasks();
    res.render("index", { tasks });
});

// 2️⃣ GET /task?id=1 → Fetch a specific task
app.get("/task", (req, res) => {
    const tasks = loadTasks();
    const task = tasks.find(t => t.id == req.query.id);
    if (task) {
        res.json(task);
    } else {
        res.status(404).json({ error: "Task not found" });
    }
});

// 3️⃣ POST /add-task → Add a new task
app.post("/add-task", (req, res) => {
    const tasks = loadTasks();
    const newTask = {
        id: tasks.length + 1,
        title: req.body.title,
        completed: false
    };
    tasks.push(newTask);
    saveTasks(tasks);
    res.redirect("/tasks");
});
// ✅ Route: Mark Task as Completed
app.post("/complete-task", (req, res) => {
    const tasks = loadTasks();
    const taskId = parseInt(req.body.id); // Get task ID from form
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
        task.completed = true; // Mark as completed
        saveTasks(tasks);
    }
    
    res.redirect("/tasks");
});

// 🗑️ Route: Delete Task
app.post("/delete-task", (req, res) => {
    let tasks = loadTasks();
    const taskId = parseInt(req.body.id);
    tasks = tasks.filter(t => t.id !== taskId); // Remove task
    saveTasks(tasks);
    
    res.redirect("/tasks");
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
