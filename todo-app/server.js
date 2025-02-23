const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const PORT = 3000;
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`);
    next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
const loadTasks = () => {
    try {
        const data = fs.readFileSync(path.join(__dirname, "tasks.json"), "utf-8");
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};
const saveTasks = (tasks) => {
    fs.writeFileSync(path.join(__dirname, "tasks.json"), JSON.stringify(tasks, null, 2));
};
app.get("/tasks", (req, res) => {
    const tasks = loadTasks();
    res.render("index", { tasks });
});
app.get("/task", (req, res) => {
    const tasks = loadTasks();
    const task = tasks.find(t => t.id == req.query.id);
    if (task) {
        res.json(task);
    } else {
        res.status(404).json({ error: "Task not found" });
    }
});
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
app.post("/complete-task", (req, res) => {
    const tasks = loadTasks();
    const taskId = parseInt(req.body.id); 
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
        task.completed = true; 
        saveTasks(tasks);
    }
    
    res.redirect("/tasks");
});
app.post("/delete-task", (req, res) => {
    let tasks = loadTasks();
    const taskId = parseInt(req.body.id);
    tasks = tasks.filter(t => t.id !== taskId); 
    saveTasks(tasks);
    
    res.redirect("/tasks");
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
