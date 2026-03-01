// ============================
// CONFIG
// ============================
const API_KEY = "	v3.football.api-sports.io"; // <-- put your RapidAPI key
const API_HOST = "api-football-v1.p.rapidapi.com";

// Vote storage
let teamVotes = {};
let playerVotes = {};

// ============================
// FETCH TEAMS
// ============================
async function fetchTeams(leagueId = 39, season = 2025) { // 39 = Premier League example
  const url = `https://${API_HOST}/v3/teams?league=${leagueId}&season=${season}`;
  
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": API_KEY,
      "X-RapidAPI-Host": API_HOST
    }
  });
  
  const data = await res.json();
  const teams = data.response.map(t => t.team);
  
  displayTeams(teams);
  initializeVotes(teams, "team");
}

// Display teams on Teams page
function displayTeams(teams) {
  const container = document.querySelector(".team-list");
  if (!container) return; // only run on teams.html

  container.innerHTML = "";
  teams.forEach(team => {
    const div = document.createElement("div");
    div.className = "team";
    div.dataset.name = team.name;
    div.innerHTML = `
      <h3>${team.name}</h3>
      <img src="${team.logo}" alt="${team.name}" width="80">
      <button onclick="voteTeam('${team.name}')">Vote</button>
      <span id="votes-${team.name}">0 votes</span>
    `;
    container.appendChild(div);
  });
}

// ============================
// FETCH PLAYERS
// ============================
// Example: fetch players for first team in league
async function fetchPlayers(teamId = 33, season = 2025) {
  const url = `https://${API_HOST}/v3/players?team=${teamId}&season=${season}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": API_KEY,
      "X-RapidAPI-Host": API_HOST
    }
  });

  const data = await res.json();
  const players = data.response.map(p => p.player);

  displayPlayers(players);
  initializeVotes(players, "player");
}

// Display players on Players page
function displayPlayers(players) {
  const container = document.querySelector(".player-list");
  if (!container) return; // only run on players.html

  container.innerHTML = "";
  players.forEach(player => {
    const div = document.createElement("div");
    div.className = "player";
    div.dataset.name = player.name;
    div.innerHTML = `
      <h3>${player.name}</h3>
      <button onclick="votePlayer('${player.name}')">Vote</button>
      <span id="votes-${player.name}">0 votes</span>
    `;
    container.appendChild(div);
  });
}

// ============================
// FETCH MATCHES
// ============================
async function fetchMatches(date = "2026-03-01") {
  const url = `https://${API_HOST}/v3/fixtures?date=${date}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": API_KEY,
      "X-RapidAPI-Host": API_HOST
    }
  });

  const data = await res.json();
  const matches = data.response;

  displayMatches(matches);
}

// Display matches on Home page
function displayMatches(matches) {
  const container = document.querySelector("#matches ul");
  if (!container) return;

  container.innerHTML = "";
  matches.forEach(fix => {
    const home = fix.teams.home.name;
    const away = fix.teams.away.name;
    const score = fix.score.fulltime.home + " - " + fix.score.fulltime.away;
    const li = document.createElement("li");
    li.innerText = `${home} vs ${away} | ${score || "TBD"}`;
    container.appendChild(li);
  });
}

// ============================
// VOTING
// ============================
function initializeVotes(items, type) {
  items.forEach(item => {
    if (type === "team") teamVotes[item.name] = 0;
    if (type === "player") playerVotes[item.name] = 0;
  });
  updateLeaderboard();
}

function voteTeam(name) {
  teamVotes[name]++;
  document.getElementById(`votes-${name}`).innerText = `${teamVotes[name]} votes`;
  updateLeaderboard();
}

function votePlayer(name) {
  playerVotes[name]++;
  document.getElementById(`votes-${name}`).innerText = `${playerVotes[name]} votes`;
  updateLeaderboard();
}

// ============================
// LEADERBOARD
// ============================
function updateLeaderboard() {
  // Teams
  const teamList = document.getElementById("team-leaderboard");
  if (teamList) {
    teamList.innerHTML = "";
    const sortedTeams = Object.entries(teamVotes).sort((a,b) => b[1]-a[1]);
    sortedTeams.forEach(([team, votes]) => {
      const li = document.createElement("li");
      li.innerText = `${team}: ${votes} votes`;
      teamList.appendChild(li);
    });
  }

  // Players
  const playerList = document.getElementById("player-leaderboard");
  if (playerList) {
    playerList.innerHTML = "";
    const sortedPlayers = Object.entries(playerVotes).sort((a,b) => b[1]-a[1]);
    sortedPlayers.forEach(([player, votes]) => {
      const li = document.createElement("li");
      li.innerText = `${player}: ${votes} votes`;
      playerList.appendChild(li);
    });
  }
}

// ============================
// INITIALIZE
// ============================
window.onload = () => {
  fetchTeams(); // loads all teams
  fetchPlayers(); // loads players for first team (can loop through all later)
  fetchMatches(); // loads today’s matches
};
