const STORAGE_KEY = "studyflow.tasks.v1";

export function createTaskStorage(storage = window.localStorage) {
  return {
    load() {
      try {
        const value = JSON.parse(storage.getItem(STORAGE_KEY) ?? "[]");
        return Array.isArray(value) ? value : [];
      } catch {
        return [];
      }
    },

    save(tasks) {
      storage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    },

    clear() {
      storage.removeItem(STORAGE_KEY);
    }
  };
}

export { STORAGE_KEY };
