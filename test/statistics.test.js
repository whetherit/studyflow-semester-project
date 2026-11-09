import test from "node:test";
import assert from "node:assert/strict";
import { getStats, makeDemoTasks, toggleTask } from "../js/task-model.js";

test("статистика считает состояния задач", () => {
  const tasks = [
    { deadline: "2026-11-08", done: false },
    { deadline: "2026-11-12", done: false },
    { deadline: "2026-11-01", done: true }
  ];

  assert.deepEqual(getStats(tasks, "2026-11-09"), {
    total: 3,
    active: 2,
    done: 1,
    overdue: 1
  });
});

test("переключение не изменяет исходный объект", () => {
  const source = { id: "1", done: false };
  const changed = toggleTask(source);
  assert.equal(source.done, false);
  assert.equal(changed.done, true);
});

test("демонстрационный набор содержит три задачи", () => {
  const tasks = makeDemoTasks("2026-11-09");
  assert.equal(tasks.length, 3);
  assert.ok(tasks.every((task) => task.id && task.title && task.subject));
});
