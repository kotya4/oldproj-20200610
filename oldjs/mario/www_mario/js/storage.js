function Storage() {
  return {
    load: (name) => JSON.parse(localStorage.getItem(name)),
    save: (name, data) => localStorage.setItem(name, JSON.stringify(data)),
  }
}
