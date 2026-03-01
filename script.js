// ============================
// CONFIG
// ============================
const API_KEY = "97f69b9368382e085449660766ff3872"; // Replace with your API-Football key
const API_HOST = "api-football-v1.p.rapidapi.com";

let teamVotes = {};
let playerVotes = [];
let allTeams = [];
let allPlayers = [];
let allMatches = [];

// ============================
// FETCH TEAMS
// ============================
async function fetchTeams() {
  // Example: Premier League (league=39, season=2025)
  const url = `https://${API_HOST}/v3/teams?league=39&season=2025`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": API_KEY,
      "X-RapidAPI-Host": API_HOST
    }
  });
  const data = await res.json();
  allTeams = data.response.map(t => t.team);
  displayTeams(allTeams);
  allTeams.forEach(t => teamVotes[t.name] = 0);
  updateLeaderboard();
}

// Display Teams
function displayTeams(teams) {
  const container = document.querySelector(".team-list");
  if (!container) return;
  container.innerHTML = "";
  teams.forEach(team => {
    const div = document.createElement("div");
    div.className = "team";
    div.dataset.name = team.name;
    div.innerHTML = `
      <img src="${team.logo}" alt="${team.name}">
      <h3>${team.name}</h3>
      <button onclick="voteTeam('${team.name}')">Vote</button>
      <span id="votes-${team.name}">0 votes</span>
    `;
    container.appendChild(div);
  });
}

// ============================
// FETCH PLAYERS (first team for example)
// ============================
async function fetchPlayers() {
  if (!allTeams.length) return;
  const teamId = allTeams[0].id;
  const url = `https://${API_HOST}/v3/players?team=${teamId}&season=2025`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": API_KEY,
      "X-RapidAPI-Host": API_HOST
    }
  });
  const data = await res.json();
  allPlayers = data.response.map(p => p.player);
  displayPlayers(allPlayers);
  allPlayers.forEach(p => playerVotes[p.name] = 0);
  updateLeaderboard();
}

// Display Players
function displayPlayers(players) {
  const container = document.querySelector(".player-list");
  if (!container) return;
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
async function fetchMatches() {
  const date = new Date().toISOString().split("T")[0];
  const url = `https://${API_HOST}/v3/fixtures?date=${date}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": API_KEY,
      "X-RapidAPI-Host": API_HOST
    }
  });
  const data = await res.json();
  allMatches = data.response;
  displayMatches(allMatches);
}

// Display Matches
function displayMatches(matches) {
  const container = document.getElementById("matches-list");
  if (!container) return;
  container.innerHTML = "";
  matches.forEach(fix => {
    const li = document.createElement("li");
    li.className = "match-item";
    li.innerText = `${fix.teams.home.name} vs ${fix.teams.away.name} | ${fix.score.fulltime.home ?? "-"}-${fix.score.fulltime.away ?? "-"} | ${fix.league.name}`;
    container.appendChild(li);
  });
}

// ============================
// VOTING
// ============================
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
    Object.entries(teamVotes)
      .sort((a,b) => b[1]-a[1])
      .forEach(([team, votes]) => {
        const li = document.createElement("li");
        li.innerText = `${team}: ${votes} votes`;
        teamList.appendChild(li);
      });
  }

  // Players
  const playerList = document.getElementById("player-leaderboard");
  if (playerList) {
    playerList.innerHTML = "";
    Object.entries(playerVotes)
      .sort((a,b) => b[1]-a[1])
      .forEach(([player, votes]) => {
        const li = document.createElement("li");
        li.innerText = `${player}: ${votes} votes`;
        playerList.appendChild(li);
      });
  }
}

// ============================
// SEARCH FUNCTION
// ============================
function searchItems() {
  const query = document.getElementById("search")?.value.toLowerCase() || "";

  // Teams
  document.querySelectorAll(".team").forEach(team => {
    team.style.display = team.dataset.name.toLowerCase().includes(query) ? "flex" : "none";
  });

  // Players
  document.querySelectorAll(".player").forEach(player => {
    player.style.display = player.dataset.name.toLowerCase().includes(query) ? "flex" : "none";
  });

  // Matches
  document.querySelectorAll(".match-item").forEach(match => {
    match.style.display = match.innerText.toLowerCase().includes(query) ? "block" : "none";
  });
}

// ============================
// INIT
// ============================
window.onload = () => {
  fetchTeams();
  fetchPlayers();
  fetchMatches();
};
