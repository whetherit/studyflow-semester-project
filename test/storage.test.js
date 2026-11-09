import test from "node:test";
import assert from "node:assert/strict";
import { createTaskStorage, STORAGE_KEY } from "../js/storage.js";

function makeMemoryStorage() {
  const data = new Map();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key)
  };
}

test("хранилище сохраняет и загружает задачи", () => {
  const memory = makeMemoryStorage();
  const storage = createTaskStorage(memory);
  const tasks = [{ id: "1", title: "Задача" }];
  storage.save(tasks);
  assert.deepEqual(storage.load(), tasks);
});

test("повреждённые данные заменяются пустым списком", () => {
  const memory = makeMemoryStorage();
  memory.setItem(STORAGE_KEY, "{wrong");
  assert.deepEqual(createTaskStorage(memory).load(), []);
});

test("очистка удаляет сохранённые задачи", () => {
  const memory = makeMemoryStorage();
  const storage = createTaskStorage(memory);
  storage.save([{ id: "1" }]);
  storage.clear();
  assert.deepEqual(storage.load(), []);
});
