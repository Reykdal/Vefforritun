/* --------------------------

   INITIAL EXPRESS CONFIG  
   (Middleware, CORS, JSON)

-------------------------- */

const express = require("express");

/* Use cors to avoid issues with testing on localhost */
const cors = require("cors");

const app = express();

/* Base url parameters and port settings */
const apiPath = "/api/";
const version = "v1";
const port = 3000;

/* Set Cors-related headers to prevent blocking of local requests */
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  next();
});

/* Initial Data */
const { tasks } = require("./data/initialData");
let { notes, nextTaskId } = require("./data/initialData");

/* -----------------------------

      TODAY´S TASKS ENDPOINTS     

----------------------------- */

// GET Tasks - Read all tasks
app.get(apiPath + version + "/tasks", (req, res) =>
  res.status(200).json(tasks),
);

// PATCH Tasks - Update Tasks "finished" status (0/1)
app.patch(apiPath + version + "/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  const { finished } = req.body;

  // Must be provided and must be 0 or 1
  if (finished !== 0 && finished !== 1) {
    return res
      .status(400)
      .json({ error: 'Body must include "finished" with value 0 or 1' });
  }

  task.finished = finished;
  return res.status(200).json(task);
});

// POST Tasks - Add new task
app.post(apiPath + version + "/tasks", (req, res) => {
  const { task } = req.body;

  if (!task || typeof task !== "string" || task.trim().length === 0) {
    return res
      .status(400)
      .json({ error: 'Body must include non-empty "task" string' });
  }

  const newTask = {
    id: nextTaskId++,
    task: task.trim(),
    finished: 0,
  };

  tasks.push(newTask);
  return res.status(201).json(newTask);
});

/* -----------------------------

      QUICK NOTES ENDPOINTS     

----------------------------- */

// GET Notes - Read Note
app.get(apiPath + version + "/notes", (req, res) => {
  return res.status(200).json({ notes });
});

// PUT Notes - Update Note Text
app.put(apiPath + version + "/notes", (req, res) => {
  const { notes: newNotes } = req.body;

  if (typeof newNotes !== "string") {
    return res
      .status(400)
      .json({ error: 'Body must include "notes" as a string' });
  }

  notes = newNotes;
  return res.status(200).json({ notes });
});

/* --------------------------

      SERVER INITIALIZATION  
      
!! DO NOT REMOVE OR CHANGE THE FOLLOWING (IT HAS TO BE AT THE END OF THE FILE) !!
      
-------------------------- */
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(
      `Server running on http://localhost:${port}${apiPath}${version}`,
    );
  });
}

module.exports = app;
