import test from "node:test";
import assert from "node:assert/strict";
import { parseBackup } from "../js/task-model.js";

const task = {
  id: "task-1",
  title: "Подготовить доклад",
  subject: "История",
  deadline: "2026-11-20",
  priority: "medium",
  notes: "",
  done: false
};

test("импорт читает объект резервной копии", () => {
  assert.deepEqual(parseBackup(JSON.stringify({ tasks: [task] })), [task]);
});

test("импорт поддерживает старый формат массива", () => {
  assert.deepEqual(parseBackup(JSON.stringify([task])), [task]);
});

test("импорт отклоняет посторонний JSON", () => {
  assert.throws(
    () => parseBackup(JSON.stringify({ messages: [] })),
    /не является резервной копией/
  );
});
