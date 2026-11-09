import test from "node:test";
import assert from "node:assert/strict";
import { createTask, updateTask, validateTask } from "../js/task-model.js";

test("проверка требует название, предмет и срок", () => {
  assert.deepEqual(validateTask({ title: "", subject: "", deadline: "" }), {
    title: "Введите название",
    subject: "Введите предмет",
    deadline: "Выберите срок"
  });
});

test("создание задачи убирает лишние пробелы", () => {
  const task = createTask({
    title: "  Сделать отчёт  ",
    subject: " Информатика ",
    deadline: "2026-11-15",
    priority: "high",
    notes: " Проверить оформление "
  }, () => "task-1");

  assert.equal(task.id, "task-1");
  assert.equal(task.title, "Сделать отчёт");
  assert.equal(task.subject, "Информатика");
  assert.equal(task.notes, "Проверить оформление");
  assert.equal(task.done, false);
});

test("изменение сохраняет id и состояние", () => {
  const source = {
    id: "task-1",
    title: "Старая",
    subject: "Физика",
    deadline: "2026-11-10",
    priority: "low",
    notes: "",
    done: true
  };
  const result = updateTask(source, {
    title: "Новая",
    subject: "Математика",
    deadline: "2026-11-20",
    priority: "medium",
    notes: ""
  });

  assert.equal(result.id, "task-1");
  assert.equal(result.done, true);
  assert.equal(result.title, "Новая");
});
