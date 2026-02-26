/* Initial Data */
const tasks = [
  { id: 1, task: "Review lecture notes", finished: 1 },
  { id: 2, task: "Work on dashboard layout", finished: 0 },
];

let notes = `Lab on Friday: bring laptop
Ask about responsive images.
Try CSS variables for theme colors.`;

/*  Our id counters
    We use basic integer ids in this assignment, but other solutions (such as UUIDs) would be better. */
let nextTaskId = 3;

module.exports = {
  tasks,
  notes,
  nextTaskId,
};
