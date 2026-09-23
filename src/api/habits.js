import { apiRequest } from "./client";

export const habitApi = {
  analyze(date) { return apiRequest(`/habits/analysis?${new URLSearchParams({ date })}`); },
  list(start, end) {
    return apiRequest(`/habits?${new URLSearchParams({ start, end })}`);
  },
  create(habit) {
    return apiRequest("/habits", { method: "POST", body: JSON.stringify(habit) });
  },
  update(id, habit) {
    return apiRequest(`/habits/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(habit) });
  },
  setCompletion(id, date, completed) {
    return apiRequest(`/habits/${encodeURIComponent(id)}/completions/${encodeURIComponent(date)}`, {
      method: "PUT",
      body: JSON.stringify({ completed }),
    });
  },
  remove(id) {
    return apiRequest(`/habits/${encodeURIComponent(id)}`, { method: "DELETE" });
  },
};
