import {
  createTask,
  filterTasks,
  getStats,
  isOverdue,
  makeDemoTasks,
  parseBackup,
  sortTasks,
  todayKey,
  toggleTask,
  updateTask,
  validateTask
} from "./task-model.js";
import { createTaskStorage } from "./storage.js";

const storage = createTaskStorage();
let tasks = storage.load();
let pendingDeleteId = null;
let toastTimer = null;

const elements = {
  addButton: document.querySelector("#add-task-button"),
  emptyAddButton: document.querySelector("#empty-add-button"),
  demoButton: document.querySelector("#demo-button"),
  exportButton: document.querySelector("#export-button"),
  importInput: document.querySelector("#import-input"),
  searchInput: document.querySelector("#search-input"),
  statusFilter: document.querySelector("#status-filter"),
  priorityFilter: document.querySelector("#priority-filter"),
  list: document.querySelector("#task-list"),
  empty: document.querySelector("#empty-state"),
  totalCount: document.querySelector("#total-count"),
  activeCount: document.querySelector("#active-count"),
  doneCount: document.querySelector("#done-count"),
  overdueCount: document.querySelector("#overdue-count"),
  taskDialog: document.querySelector("#task-dialog"),
  confirmDialog: document.querySelector("#confirm-dialog"),
  form: document.querySelector("#task-form"),
  dialogTitle: document.querySelector("#dialog-title"),
  taskId: document.querySelector("#task-id"),
  title: document.querySelector("#task-title"),
  subject: document.querySelector("#task-subject"),
  deadline: document.querySelector("#task-deadline"),
  priority: document.querySelector("#task-priority"),
  notes: document.querySelector("#task-notes"),
  closeDialogButton: document.querySelector("#close-dialog-button"),
  cancelDialogButton: document.querySelector("#cancel-dialog-button"),
  confirmDeleteButton: document.querySelector("#confirm-delete-button"),
  toast: document.querySelector("#toast")
};

function saveAndRender() {
  storage.save(tasks);
  render();
}

function showToast(message) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("toast--visible");
  toastTimer = setTimeout(() => {
    elements.toast.classList.remove("toast--visible");
  }, 2600);
}

function render() {
  const stats = getStats(tasks);
  elements.totalCount.textContent = stats.total;
  elements.activeCount.textContent = stats.active;
  elements.doneCount.textContent = stats.done;
  elements.overdueCount.textContent = stats.overdue;

  const visibleTasks = sortTasks(filterTasks(tasks, {
    query: elements.searchInput.value,
    status: elements.statusFilter.value,
    priority: elements.priorityFilter.value
  }));

  elements.list.replaceChildren();
  elements.empty.hidden = visibleTasks.length > 0;
}

render();
