document.addEventListener("DOMContentLoaded", () => {
  const roles = ["timekeeper", "notekeeper", "facilitator"];
  let users = JSON.parse(localStorage.getItem("users")) || getDefaultUsers(); // Usuarios predeterminados o cargados

  let history = JSON.parse(localStorage.getItem("assignments")) || {
    timekeeper: [],
    notekeeper: [],
    facilitator: [],
  };

  let lastGenerationSelectedUsers = [];

  // Clean everything
  const clearButton = document.getElementById("clearAll");
  clearButton.addEventListener("click", clearAllData);

  function clearAllData() {
    // Vacia el localStorage
    localStorage.clear();

    // Reinicia el historial de asignaciones en la memoria del script
    history = { timekeeper: [], notekeeper: [], facilitator: [] };
    users = getDefaultUsers();
    // Actualiza la UI para reflejar el estado vacío
    updateUserList();
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
          updateUserList();
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
        (!history.timekeeper.includes(user) ||
          !history.notekeeper.includes(user) ||
          !history.facilitator.includes(user)) &&
        !lastGenerationSelectedUsers.includes(user)
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

    // Save the current generation's selected users for future reference
    lastGenerationSelectedUsers = selectedUsersForThisRound;

    saveAssignmentsToLocalStorage();
    showOverlay();
    startCountdown();
  }

  function updateUI() {
    roles.forEach((role) => {
      const listElement = document.getElementById(`${role}List`);
      listElement.innerHTML = ""; // Limpiar la lista actual

      history[role].forEach((user, index, array) => {
        const listItem = document.createElement("li");

        // Check if it's the last user in the array
        if (index === array.length - 1) {
          const boldElement = document.createElement("b");
          boldElement.textContent = user;
          listItem.appendChild(boldElement);
        } else {
          listItem.textContent = user;
        }

        listElement.appendChild(listItem);
      });
    });
  }

  function updateUserList() {
    const userList = document.getElementById("userList");
    userList.innerHTML = "";
    users.forEach((user) => {
      const listItem = document.createElement("li");
      listItem.textContent = user;
      userList.appendChild(listItem);
    });
  }

  function showOverlay() {
    const overlay = document.getElementById("overlay");
    overlay.style.display = "flex";
  }

  function startCountdown() {
    let countdown = 3;
    const countdownElement = document.getElementById("countdown");

    const intervalId = setInterval(() => {
      if (countdown === 1) {
        hideOverlay(); // Hide the overlay when countdown reaches 0
        clearInterval(intervalId); // Stop the countdown
        countdown = 3; // Reset the countdown for the next time
      } else {
        countdown--;
      }
      countdownElement.textContent = countdown;
    }, 1000);
  }

  function hideOverlay() {
    const overlay = document.getElementById("overlay");
    overlay.style.display = "none";
    updateUI();
  }

  function getDefaultUsers() {
    return ["Ana", "Beto", "Carlos", "Diana", "Elena", "Fernando"];
  }

  updateUI();
  updateUserList();
});
