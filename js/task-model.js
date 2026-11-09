export const PRIORITIES = ["high", "medium", "low"];

export function todayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function validateTask(input) {
  const errors = {};
  if (!input.title?.trim()) errors.title = "Введите название";
  if (!input.subject?.trim()) errors.subject = "Введите предмет";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.deadline ?? "")) {
    errors.deadline = "Выберите срок";
  }
  return errors;
}

export function createTask(input, idFactory = () => crypto.randomUUID()) {
  const errors = validateTask(input);
  if (Object.keys(errors).length) {
    throw new TypeError("Некорректные данные задачи");
  }

  return {
    id: idFactory(),
    title: input.title.trim(),
    subject: input.subject.trim(),
    deadline: input.deadline,
    priority: PRIORITIES.includes(input.priority) ? input.priority : "medium",
    notes: input.notes?.trim() ?? "",
    done: false,
    createdAt: new Date().toISOString()
  };
}

export function updateTask(task, input) {
  const errors = validateTask(input);
  if (Object.keys(errors).length) {
    throw new TypeError("Некорректные данные задачи");
  }

  return {
    ...task,
    title: input.title.trim(),
    subject: input.subject.trim(),
    deadline: input.deadline,
    priority: PRIORITIES.includes(input.priority) ? input.priority : "medium",
    notes: input.notes?.trim() ?? ""
  };
}

export function toggleTask(task) {
  return { ...task, done: !task.done };
}
