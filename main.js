// Set query selector function
let qs = (el) => document.querySelector(el);

// Setting game name
let gameName = "Guess The Word";
document.title = gameName;
qs("h1").innerHTML = gameName;
qs("footer").innerHTML = `${gameName} Game Created By Elzero Web School`;

// Setting game options
let numberOfTries = 6,
  numberOfLetters = 6,
  currentTry = 1,
  hints = 2,
  random = Math.random(),
  letter;

const inputsContainer = qs(".inputs"),
  checkBut = qs(".check"),
  hintBut = qs(".hint"),
  hintSpan = qs(".hint span"),
  message = qs(".message");

hintSpan.innerHTML = hints;

function generateInput() {
  for (let i = 1; i <= numberOfTries; i++) {
    const tryDiv = document.createElement("div");
    tryDiv.classList.add(`try${i}`);
    tryDiv.innerHTML = `<span>Try ${i}</span>`;
    if (i !== 1) tryDiv.classList.add("disabled-inputs");

    for (let j = 1; j <= numberOfLetters; j++) {
      let input = document.createElement("input");
      input.id = `guess-${i}-letter${j}`;
      input.name = `guess-${i}-letter${j}`;
      input.setAttribute("maxlength", "1");
      input.addEventListener("keydown", handleInputNav);
      tryDiv.appendChild(input);
    }
    inputsContainer.appendChild(tryDiv);
  }
  inputsContainer.children[0].children[1].focus();
  document
    .querySelectorAll(".disabled-inputs input")
    .forEach((inp) => (inp.disabled = true));
  nextSibling();
}

function handleInputNav(e) {
  const input = e.target;
  const prev = input.previousElementSibling;
  const next = input.nextElementSibling;
  switch (e.key) {
    case "ArrowLeft":
      prev && prev.focus();
      break;
    case "ArrowRight":
      next && next.focus();
      break;
    case "Backspace":
      if (input.value) {
        input.value = "";
      }
      prev && (prev.value = "");
      prev && prev.focus();
      break;
  }
}

function nextSibling() {
  let currentTryDiv = qs(`.inputs .try${currentTry}`);
  if (!currentTryDiv) {
    disableButtons();
    showMessage(`Game Over The Right Word Is <span>${letter}</span>`);
    return;
  }
  currentTryDiv.classList.remove("disabled-inputs");
  currentTryDiv
    .querySelectorAll("input")
    .forEach((inp) => (inp.disabled = false));
  currentTryDiv.children[1].focus();
  fetchData();
}

function disableButtons() {
  [checkBut, hintBut].forEach((btn) => {
    btn.disabled = true;
    btn.style.opacity = 0.5;
  });
}

function fetchData() {
  fetch("/words.json")
    .then((res) => res.json())
    .then((wordData) => {
      letter = wordData[Math.floor(random * wordData.length)];
      document.querySelectorAll(".inputs input").forEach((input) => {
        input.removeEventListener("input", handleInput);
        input.addEventListener("input", handleInput);
      });
    })
    .catch(console.error);
}

function handleInput(event) {
  const input = event.target;
  if (input.nextElementSibling) {
    if (input.classList.contains("anim")) {
      document
        .querySelectorAll(`.try${currentTry} input`)
        .forEach((animInput) => animInput.classList.remove("anim"));
    }
    input.nextElementSibling.focus();
  }
}

hintBut.addEventListener("click", getHint);

function getHint() {
  if (hints > 0) {
    hintSpan.innerHTML = --hints;
    if (hints == 0) hintBut.style.opacity = 0.5;
    let inputs = document.querySelectorAll(`.inputs .try${currentTry} input`);
    let randomNum = Math.floor(Math.random() * inputs.length);
    for (let i = randomNum; i < inputs.length; i++) {
      if (inputs[i].value === "") {
        inputs[i].value = letter[i];
        return false;
      }
    }
  } else {
    showMessage("You Have 0 Hints");
  }
}

function showMessage(text) {
  message.style.opacity = 1;
  message.style.fontSize = "20px";
  message.innerHTML = text;
}
checkBut.addEventListener("click", nextTry);

function nextTry() {
  let currentRow = inputsContainer.querySelector(`.try${currentTry}`);
  let currentInputs = currentRow.querySelectorAll(`input`);
  // Check if there is anim class
  currentInputs.forEach((animInput) => animInput.classList.remove("anim"));
  // Check if try div contains any empty input
  let emptyCount = 0;
  currentInputs.forEach((emptyInput) => {
    if (emptyInput.value === "") {
      emptyInput.classList.add("anim");
      qs("#fail").play();
      emptyCount++;
    }
  });
  if (emptyCount > 0) {
    return false;
  }
  // Color the items according to status
  currentInputs.forEach((input, index) => {
    setClass(input, letter[index]);
  });
  // Check if all inputs are right
  if (
    Array.from(currentInputs).every((input) =>
      input.classList.contains("in-place")
    )
  ) {
    let wrongInputs = Array.from(
      document.querySelectorAll(".inputs input")
    ).filter(
      (inp) => inp.value !== "" && !inp.classList.contains("in-place")
    ).length;
    showMessage(
      `Your wrong tries are <span>${wrongInputs}</span> The Right Word Is <span>${letter}</span>`
    );
    qs("#success").play();
    disableButtons();
  } else {
    currentRow.classList.add("disabled-inputs");
    currentInputs.forEach((inp) => (inp.disabled = true));
    currentTry++;
    nextSibling();
  }
}

function setClass(input, letterChar) {
  input.classList.add(
    letter.includes(input.value)
      ? input.value === letterChar
        ? "in-place"
        : "not-in-place"
      : "no"
  );
}
window.onload = generateInput;
