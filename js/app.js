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

const priorityNames = {
  high: "Высокий",
  medium: "Средний",
  low: "Низкий"
};

function formatDate(value) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(`${value}T12:00:00`));
}

function createIconButton(label, symbol, action) {
  const button = document.createElement("button");
  button.className = "icon-button";
  button.type = "button";
  button.ariaLabel = label;
  button.textContent = symbol;
  button.addEventListener("click", action);
  return button;
}

function createTaskCard(task) {
  const card = document.createElement("article");
  card.className = "task-card";
  if (task.done) card.classList.add("task-card--done");
  if (isOverdue(task)) card.classList.add("task-card--overdue");

  const checkbox = document.createElement("input");
  checkbox.className = "task-card__check";
  checkbox.type = "checkbox";
  checkbox.checked = task.done;
  checkbox.ariaLabel = `Отметить задачу «${task.title}» выполненной`;

  const content = document.createElement("div");
  const title = document.createElement("h3");
  title.className = "task-card__title";
  title.textContent = task.title;

  const badge = document.createElement("span");
  badge.className = `badge badge--${task.priority}`;
  badge.textContent = priorityNames[task.priority];
  title.append(badge);

  const meta = document.createElement("p");
  meta.className = "task-card__meta";
  meta.textContent = `${task.subject} · до ${formatDate(task.deadline)}`;
  if (isOverdue(task)) meta.textContent += " · срок прошёл";

  content.append(title, meta);
  if (task.notes) {
    const notes = document.createElement("p");
    notes.className = "task-card__notes";
    notes.textContent = task.notes;
    content.append(notes);
  }

  const actions = document.createElement("div");
  actions.className = "task-card__actions";
  actions.append(
    createIconButton("Изменить задачу", "✎", () => openTaskDialog(task)),
    createIconButton("Удалить задачу", "×", () => openDeleteDialog(task.id))
  );

  checkbox.addEventListener("change", () => handleToggle(task.id));
  card.append(checkbox, content, actions);
  return card;
}

function clearFormErrors() {
  ["title", "subject", "deadline"].forEach((field) => {
    document.querySelector(`#${field}-error`).textContent = "";
  });
}

function openTaskDialog(task = null) {
  elements.form.reset();
  clearFormErrors();
  elements.taskId.value = task?.id ?? "";
  elements.dialogTitle.textContent = task ? "Изменить задачу" : "Новая задача";
  elements.title.value = task?.title ?? "";
  elements.subject.value = task?.subject ?? "";
  elements.deadline.value = task?.deadline ?? todayKey();
  elements.priority.value = task?.priority ?? "medium";
  elements.notes.value = task?.notes ?? "";
  elements.taskDialog.showModal();
  elements.title.focus();
}

function closeTaskDialog() {
  elements.taskDialog.close();
}

function readForm() {
  return {
    title: elements.title.value,
    subject: elements.subject.value,
    deadline: elements.deadline.value,
    priority: elements.priority.value,
    notes: elements.notes.value
  };
}

function showFormErrors(errors) {
  clearFormErrors();
  Object.entries(errors).forEach(([field, message]) => {
    document.querySelector(`#${field}-error`).textContent = message;
  });
}

function handleSubmit(event) {
  event.preventDefault();
  const input = readForm();
  const errors = validateTask(input);
  if (Object.keys(errors).length) {
    showFormErrors(errors);
    return;
  }

  const editedId = elements.taskId.value;
  if (editedId) {
    tasks = tasks.map((task) => task.id === editedId ? updateTask(task, input) : task);
  } else {
    tasks.push(createTask(input));
  }
  closeTaskDialog();
  saveAndRender();
  showToast(editedId ? "Изменения сохранены" : "Задача добавлена");
}

function handleToggle(id) {
  tasks = tasks.map((task) => task.id === id ? toggleTask(task) : task);
  saveAndRender();
  showToast("Состояние задачи изменено");
}

function openDeleteDialog(id) {
  pendingDeleteId = id;
  elements.confirmDialog.showModal();
}

elements.confirmDeleteButton.addEventListener("click", () => {
  if (!pendingDeleteId) return;
  tasks = tasks.filter((task) => task.id !== pendingDeleteId);
  pendingDeleteId = null;
  storage.save(tasks);
  render();
  showToast("Задача удалена");
});

elements.form.addEventListener("submit", handleSubmit);
elements.addButton.addEventListener("click", () => openTaskDialog());
elements.emptyAddButton.addEventListener("click", () => openTaskDialog());
elements.closeDialogButton.addEventListener("click", closeTaskDialog);
elements.cancelDialogButton.addEventListener("click", closeTaskDialog);

[elements.searchInput, elements.statusFilter, elements.priorityFilter].forEach((control) => {
  control.addEventListener("input", render);
  control.addEventListener("change", render);
});

elements.demoButton.addEventListener("click", () => {
  if (tasks.length > 0 && !window.confirm("Заменить текущие задачи демонстрационными?")) {
    return;
  }
  tasks = makeDemoTasks();
  saveAndRender();
  showToast("Демонстрационные задачи загружены");
});

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
  visibleTasks.forEach((task) => elements.list.append(createTaskCard(task)));
  elements.empty.hidden = visibleTasks.length > 0;
}

render();
