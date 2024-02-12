document.addEventListener("DOMContentLoaded", () => {
  const roles = ["timekeeper", "notekeeper", "timetracker"];
  let users = JSON.parse(localStorage.getItem("users")) || [
    "Ana",
    "Beto",
    "Carlos",
    "Diana",
    "Elena",
    "Fernando",
  ]; // Usuarios predeterminados o cargados
  let history = JSON.parse(localStorage.getItem("assignments")) || {
    timekeeper: [],
    notekeeper: [],
    timetracker: [],
  };

  // Clean everything
  const clearButton = document.getElementById("clearAll");
  clearButton.addEventListener("click", clearAllData);

  function clearAllData() {
    // Vacia el localStorage
    localStorage.removeItem("assignments");

    // Reinicia el historial de asignaciones en la memoria del script
    history = { timekeeper: [], notekeeper: [], timetracker: [] };

    // Actualiza la UI para reflejar el estado vacío
    updateUI();
  }

  // Load users.json
  const fileInput = document.getElementById("fileInput");
  const loadUsersButton = document.getElementById("loadUsers");

  loadUsersButton.addEventListener("click", () => {
    const file = fileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const newUserList = JSON.parse(e.target.result);
        if (Array.isArray(newUserList)) {
          users = newUserList;
          localStorage.setItem("users", JSON.stringify(users));
          alert("Usuarios cargados correctamente.");
        } else {
          alert("El archivo no tiene el formato correcto.");
        }
      };
      reader.readAsText(file);
    } else {
      alert("Por favor, selecciona un archivo.");
    }
  });

  // Load history
  const progressFileInput = document.getElementById("progressFileInput");
  const loadProgressButton = document.getElementById("loadProgress");

  loadProgressButton.addEventListener("click", () => {
    const file = progressFileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const newProgress = JSON.parse(e.target.result);
        if (newProgress && typeof newProgress === "object") {
          history = newProgress; // Asume que el JSON está en el formato correcto
          localStorage.setItem("assignments", JSON.stringify(history));
          updateUI();
          alert("Progreso cargado correctamente.");
        } else {
          alert("El archivo no tiene el formato correcto.");
        }
      };
      reader.readAsText(file);
    } else {
      alert("Por favor, selecciona un archivo.");
    }
  });

  // New generation
  const generateButton = document.getElementById("generate");
  generateButton.addEventListener("click", generateRoles);

  function saveAssignmentsToLocalStorage() {
    localStorage.setItem("assignments", JSON.stringify(history));
  }

  function generateRoles() {
    let usersAvailableForRoles = users.filter(
      (user) =>
        !history.timekeeper.includes(user) ||
        !history.notekeeper.includes(user) ||
        !history.timetracker.includes(user)
    );

    if (usersAvailableForRoles.length < roles.length) {
      console.log(
        "No hay suficientes usuarios disponibles para asignar a nuevos roles."
      );
      return;
    }

    let selectedUsersForThisRound = [];

    roles.forEach((role) => {
      let availableUsers = usersAvailableForRoles.filter(
        (user) =>
          !selectedUsersForThisRound.includes(user) &&
          !history[role].includes(user)
      );

      if (availableUsers.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableUsers.length);
        const selectedUser = availableUsers[randomIndex];
        history[role].push(selectedUser);
        selectedUsersForThisRound.push(selectedUser);
      }
    });

    saveAssignmentsToLocalStorage();
    updateUI();
  }

  function updateUI() {
    roles.forEach((role) => {
      const listElement = document.getElementById(`${role}List`);
      listElement.innerHTML = ""; // Limpiar la lista actual

      history[role].forEach((user) => {
        const listItem = document.createElement("li");
        listItem.textContent = user;
        listElement.appendChild(listItem);
      });
    });
  }

  updateUI();
});
