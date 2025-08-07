import { useState, useEffect } from "react";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  userId: string;
  categoryId?: string | null;
  category?: { id: string; name: string };
}

interface Category {
  id: string;
  name: string;
}

interface TaskInput {
  title: string;
  description: string;
  categoryId: string | null;
}

export default function TestPage() {
  const [token, setToken] = useState<string>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newTask, setNewTask] = useState<TaskInput>({
    title: "",
    description: "",
    categoryId: null,
  });
  const [newCategory, setNewCategory] = useState({ name: "" });

  // Helper fetch with auth
  async function authFetch(url: string, options: RequestInit = {}) {
    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    return response.json();
  }

  // Register and Login
  async function register() {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
    });
    console.log(await res.json());
  }

  async function login() {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    setToken(data.token);
    console.log(data);
  }

  // CRUD: Categories
  async function createCategory() {
    const data = await authFetch("/api/categories", {
      method: "POST",
      body: JSON.stringify(newCategory),
    });
    setCategories([...categories, data]);
    setNewCategory({ name: "" });
  }

  async function fetchCategories() {
    const data: Category[] = await authFetch("/api/categories");
    setCategories(data);
  }

  // CRUD: Tasks
  async function createTask() {
    const data = await authFetch("/api/tasks", {
      method: "POST",
      body: JSON.stringify(newTask),
    });
    setTasks([...tasks, data]);
    setNewTask({ title: "", description: "", categoryId: null });
  }

  async function fetchTasks() {
    const data: Task[] = await authFetch("/api/tasks");
    setTasks(data);
  }

  async function updateTaskStatus(task: Task) {
    const updated = await authFetch(`/api/tasks/${task.id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...task,
        status: task.status === "done" ? "pending" : "done",
      }),
    });

    setTasks(tasks.map((t) => (t.id === task.id ? updated : t)));
  }

  async function deleteTask(taskId: string) {
    await authFetch(`/api/tasks/${taskId}`, {
      method: "DELETE",
    });
    setTasks(tasks.filter((t) => t.id !== taskId));
  }

  // Initial fetch
  useEffect(() => {
    if (token) {
      fetchTasks();
      fetchCategories();
    }
  }, [token]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Task Manager Test UI</h1>

      <h2>Auth</h2>
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={register}>Register</button>
      <button onClick={login}>Login</button>

      <hr />

      {token && (
        <>
          <h2>Categories</h2>
          <input
            placeholder="Category Name"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ name: e.target.value })}
          />
          <button onClick={createCategory}>Add Category</button>
          <ul>
            {categories.map((c) => (
              <li key={c.id}>{c.name}</li>
            ))}
          </ul>

          <h2>Tasks</h2>
          <input
            placeholder="Title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
          <input
            placeholder="Description"
            value={newTask.description}
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
          />
          <select
            value={newTask.categoryId ?? ""}
            onChange={(e) =>
              setNewTask({ ...newTask, categoryId: e.target.value || null })
            }
          >
            <option value="">No Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <button onClick={createTask}>Add Task</button>

          <ul>
            {tasks.map((t) => (
              <li key={t.id}>
                <strong>{t.title}</strong> - {t.status}
                <br />
                {t.description}
                <br />
                <button onClick={() => updateTaskStatus(t)}>
                  Toggle Status
                </button>
                <button onClick={() => deleteTask(t.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
