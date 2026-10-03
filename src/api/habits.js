import { apiRequest } from "./client";

export const habitApi = {
  async analyze(date, regenerate = false) {
    const [calculated, intelligence] = await Promise.allSettled([
      apiRequest(`/habits/analysis?${new URLSearchParams({ date })}`),
      regenerate ? apiRequest("/habits/intelligence/refresh", { method: "POST", body: JSON.stringify({ date }) })
        : apiRequest(`/habits/intelligence?${new URLSearchParams({ date })}`),
    ]);
    if (calculated.status === "rejected") throw calculated.reason;
    return { ...calculated.value, intelligence: intelligence.status === "fulfilled" ? intelligence.value : {
      status: "UNAVAILABLE", providerMessage: intelligence.reason?.message || "AI interpretation could not be loaded."
    }};
  },
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
