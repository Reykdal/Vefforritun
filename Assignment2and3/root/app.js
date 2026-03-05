import axios from "axios";

/* =========================
   CONFIG
========================= */
const API_BASE = "https://veff-2026-quotes.netlify.app/api/v1";

/* =========================
   QUOTE FEATURE
========================= */

/**
 * Fetch a quote from the API
 * @param {string} category - quote category
 */
const loadQuote = async (category = "general") => {
   // TODO: Use the assignment description to figure out what to do here
   try { 
      const response = await axios.get(`${API_BASE}/quotes`, 
         {params: { category },
      }); // using axios

      const quoteTextElement = document.getElementById("quote-text");
      const quoteAuthorElement = document.getElementById("quote-author");

      if (quoteTextElement) quoteTextElement.textContent = `"${response.data.quote}"`;
      if (quoteAuthorElement) quoteAuthorElement.textContent = response.data.author;

   } catch(error) {
      console.error("Error fetching quote:", error);
   }
};

/**
 * Attach event listeners for quote feature
 */
const wireQuoteEvents = () => {
  // TODO: Use the assignment description to figure out what to do here
   const select = document.getElementById("quote-category-select");
   const button = document.getElementById("new-quote-btn");

   const getCategory = () => select?.value || "general";

   select?.addEventListener("change", async () => {
      await loadQuote(getCategory());
   });

   button?.addEventListener("click", async () => {
      await loadQuote(getCategory());
   });
};


// ADD TASK

const addTask = async (taskText) => {
   try {
      const response = await axios.post(
         "http://localhost:3000/api/v1/tasks",
         {
            "task": taskText
         }
      );

      console.log(response.data);

      await loadTasks(); // refresh after adding task

   }  catch (error) {
         console.error(error);
   }
};


// ======================================================================= //
// UPDATE TASK

const updateTask = async (id, finshedState) => {
   try {
      const respone = await axios.patch(
         `http://localhost:3000/api/v1/tasks/${id}`,
         {
            "finished": finshedState
         }
      );
   } catch (error) {
      console.error(error);
   }
};


// ======================================================================= //
// LOAD TASK

const loadTasks = async () => {
   try {
      const response = await axios.get(
         "http://localhost:3000/api/v1/tasks"
      );

      renderTasks(response.data);

   } catch(error) {
      console.error(error);
   }
};



// ======================================================================= //
// RENDER TASKS

const renderTasks = (tasks) => {
   const list = document.querySelector(".task-list");
   if (!list) return;

   list.innerHTML = "";

   tasks.forEach((task) => {
      const li = renderTask(task);
      list.appendChild(li);
   });
};


// ======================================================================= //
// RENDER TASK

const renderTask = (task) => {
   const li = document.createElement("li");

   const checkbox = document.createElement("input");
   checkbox.type = "checkbox";
   checkbox.checked = task.finished === 1;

   checkbox.addEventListener("change", async () => {
      const newState = checkbox.checked ? 1 : 0;

      await updateTask(task.id, newState);

      await loadTasks();
   });

   const span = document.createElement("span");
   span.textContent = task.task;

   li.appendChild(checkbox);
   li.appendChild(span);

   return li;
};


// ======================================================================= //
// LOAD NOTES

const loadNotes = async () => {
  try {
    const response = await axios.get("http://localhost:3000/api/v1/notes");

    const textarea = document.getElementById("notes-text");
    const saveBtn = document.getElementById("save-notes-btn");
    if (!textarea || !saveBtn) return;

    const notesText =
      typeof response.data === "string" ? response.data : response.data?.notes ?? "";

    textarea.value = notesText;
    saveBtn.disabled = true;

    return notesText;
  } catch (error) {
    console.error("Error loading notes:", error);
    return "";
  }
};


// ======================================================================= //
// SAVE NOTES

const saveNotes = async () => {
  try {
    const textarea = document.getElementById("notes-text");
    const saveBtn = document.getElementById("save-notes-btn");
    if (!textarea || !saveBtn) return;

    const notesText = textarea.value;

    await axios.put("http://localhost:3000/api/v1/notes", {
      notes: notesText,
    });

    saveBtn.disabled = true;
  } catch (error) {
    console.error("Error saving notes:", error);
  }
};



// ======================================================================= //
// WIRE NOTES EVENTS

const wireNotesEvents = () => {
  const textarea = document.getElementById("notes-text");
  const saveBtn = document.getElementById("save-notes-btn");
  if (!textarea || !saveBtn) return;

  saveBtn.disabled = true;

  let lastSavedValue = textarea.value;

  textarea.addEventListener("input", () => {
    saveBtn.disabled = textarea.value === lastSavedValue;
  });

  saveBtn.addEventListener("click", async () => {
    await saveNotes();
    lastSavedValue = textarea.value;
    saveBtn.disabled = true;
  });
};



// ======================================================================= //
// WIRE TASK EVENTS

const wireTaskEvents = () => {
  const input = document.getElementById("new-task");
  const button = document.getElementById("add-task-btn");

  const handleAdd = async () => {
    const text = input?.value.trim();
    if (!text) return;
    await addTask(text);
    input.value = "";
  };

  button?.addEventListener("click", handleAdd);

  input?.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      await handleAdd();
    }
  });
};



/* =========================
   INIT
========================= */

/**
 * Initialize application
 */
const init = async () => {
   wireQuoteEvents();

   const select = document.getElementById("quote-category-select");
   const category = select?.value || "general";

   await loadQuote(category);

   wireTaskEvents();
   wireNotesEvents();
   loadTasks();
   loadNotes();
};

/* =========================
   EXPORT (DO NOT REMOVE)
========================= */

export {   init, loadQuote, wireQuoteEvents, loadTasks, renderTasks, updateTask, addTask, wireTaskEvents, loadNotes, saveNotes, wireNotesEvents };
init();
