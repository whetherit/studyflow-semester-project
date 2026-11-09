import test from "node:test";
import assert from "node:assert/strict";
import { filterTasks, sortTasks } from "../js/task-model.js";

const tasks = [
  { id: "1", title: "Отчёт", subject: "Физика", deadline: "2026-11-08", priority: "high", done: false },
  { id: "2", title: "Конспект", subject: "История", deadline: "2026-11-12", priority: "low", done: true },
  { id: "3", title: "Лабораторная", subject: "Физика", deadline: "2026-11-10", priority: "medium", done: false }
];

test("поиск учитывает название и предмет", () => {
  assert.deepEqual(filterTasks(tasks, { query: "отч" }).map((task) => task.id), ["1"]);
  assert.deepEqual(filterTasks(tasks, { query: "физика" }).map((task) => task.id), ["1", "3"]);
});

test("фильтр показывает выполненные задачи", () => {
  assert.deepEqual(filterTasks(tasks, { status: "done" }).map((task) => task.id), ["2"]);
});

test("фильтр находит просроченную задачу", () => {
  assert.deepEqual(
    filterTasks(tasks, { status: "overdue" }, "2026-11-09").map((task) => task.id),
    ["1"]
  );
});

test("сортировка переносит выполненные задачи вниз", () => {
  assert.deepEqual(sortTasks(tasks).map((task) => task.id), ["1", "3", "2"]);
});
