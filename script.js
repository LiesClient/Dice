const rack = document.getElementById("rack");
const title = document.getElementById("title");
const menu = document.getElementById("menu");

const tick = document.getElementById("tick");
const start = document.getElementById("start");
const finish = document.getElementById("finish");

let width = window.innerWidth;
let height = window.innerHeight;

let dice = [];
let rollCount = 8;

let sfx = [
  { name: "blip", file: "blip.wav" }, // 0
  { name: "click", file: "click.wav" }, // 1
  { name: "coin", file: "coin.wav" }, // 2
  { name: "gun", file: "gun.m4a" }, // 3
  { name: "wood", file: "wood.m4a" }, // 4
];

sfx.map(effect => effect.audio = new Audio(effect.file));

let tickIndex = 4;
let startIndex = 1;
let finishIndex = 2; 

create(100);
create(20);
create(12);
create(10);
create(8);
create(6);
create(4);
create(2);

function init() {
  menu.style.display = "none";
  
  dice.forEach(die => {
    die.div.onclick = () => {
      die.rolling = rollCount;
      die.rotation = Math.PI * 2 * (die.rolling / rollCount);
      set(die.div, "rolling");

      draw(die.index);
      setTimeout(() => die.start.play(), 250);
      setTimeout(update, 900, die.index, rollCount);
    }

    draw(die.index);
  });

  rack.addEventListener("click", event => {
    if (event.target.id != "rack") return;

    menu.style.display = "block";
  });

  menu.addEventListener("click", event => {
    if (event.target.id != "menu") return;

    menu.style.display = "none";
  });

  tick.textContent = "Tick SFX: " + sfx[tickIndex].name;
  start.textContent = "Start SFX: " + sfx[startIndex].name;
  finish.textContent = "Finish SFX: " + sfx[finishIndex].name;

  tick.addEventListener("click", () => {
    tickIndex = (tickIndex + 1) % sfx.length;
    tick.textContent = "Tick SFX: " + sfx[tickIndex].name;
    updateAudios("tick");
  });

  start.addEventListener("click", () => {
    startIndex = (startIndex + 1) % sfx.length;
    start.textContent = "Start SFX: " + sfx[startIndex].name;
    updateAudios("start");
  });

  finish.addEventListener("click", () => {
    finishIndex = (finishIndex + 1) % sfx.length;
    finish.textContent = "Finish SFX: " + sfx[finishIndex].name;
    updateAudios("done");
  });

  title.style.transform = "";

  let titleWidth = title.clientWidth;
  let titleHeight = title.clientHeight;

  title.style.transform = `scale(${width / titleWidth}, ${height / titleHeight})`;
  title.style.transformOrigin = "0 0";
}

function update(index, n = 0) {
  let die = dice[index];

  console.log("updating " + index);

  if (die.rolling != n) {
    return;
  }

  if (die.rolling == 1) die.current = -1;

  if (die.rolling > 0) {
    die.rolling--;
    die.current = rand(die.max, die.current);
    die.rotation = Math.PI * 2 * (die.rolling / rollCount);
    die.audio[die.rolling].play();

    draw(index);

    setTimeout(update, Math.random() * 50 + 150, die.index, die.rolling);
  }
  
  if (die.rolling == 0) {
    die.rotation = 0;
    die.done.play();
    dice.forEach(die => (die.div.classList.contains("special")) && set(die.div, "normal"));

    set(die.div, "special");

    draw(index);
    // die.div.style.borderRadius = "50% 40% 50% 50%";

    // setTimeout(() => draw(index), 200);
  }
}

function draw(index) {
  let die = dice[index];

  console.log(die);

  let text = die.current.toString();
  let maxLength = (die.max - 1).toString().length;

  if (text.length < maxLength) text = "0" + text;

  die.div.style.transform = `rotate(${die.rotation}rad)`;
  die.display.textContent = text;
  die.div.style.setProperty("--color", die.rolling > 0 ? "rgba(248, 248, 248, 1)" : "rgba(0, 0, 0, 1)");
  die.div.style.borderRadius = die.rolling > 0 ? "50% 50% 50% 30%" : "50%";
}

function create(num) {
  let div = document.createElement("div");
  div.classList.add("die");
  set(div, "rolling");

  let display = document.createElement("div");
  display.classList.add("display");
  div.appendChild(display);

  let text = document.createElement("p");
  text.classList.add("text");
  display.appendChild(text);

  let max = document.createElement("p");
  max.classList.add("max");
  display.appendChild(max);

  let data = {
    max: num,
    current: rand(num),
    rolling: 0,
    rotation: 0,
    display: text,
    div: div,
    index: dice.length,
    audio: new Array(rollCount).fill().map(() => sfx[tickIndex].audio.cloneNode(false)),
    done: sfx[finishIndex].audio.cloneNode(false),
    start: sfx[startIndex].audio.cloneNode(false),
  };

  text.textContent = data.current;
  max.textContent = data.max;
  rack.appendChild(div);

  dice.push(data);
}

function updateAudios(type) {
  if (type == "start" || type == "done") {
    dice.forEach(die => {
      die.start = sfx[startIndex].audio.cloneNode(false);
      die.done = sfx[finishIndex].audio.cloneNode(false);
    });

    return;
  }

  // type == "tick"
  return dice.forEach(die => die.audio = new Array(rollCount).fill().map(() => sfx[tickIndex].audio.cloneNode(false)));
}

function set(div, current) {
  div.classList.remove("normal");
  div.classList.remove("rolling");
  div.classList.remove("special");

  div.classList.add(current);
}

function rand(num, curr) {
  let x = Math.floor(Math.random() * num) + 1;
  if (x == curr) return rand(num);
  return x;
}

init();