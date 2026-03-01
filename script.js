// ==================== CONFIG
const API_KEY = "97f69b9368382e085449660766ff3872"; // dashboard.api-football.com key
const API_BASE = "https://v3.football.api-sports.io";

let allTeams = [];
let allPlayers = [];
let allMatches = [];
let teamVotes = {};
let playerVotes = {};

// ==================== FETCH MATCHES (TODAY)
async function fetchMatches() {
  const today = new Date().toISOString().split("T")[0];
  const res = await fetch(`${API_BASE}/fixtures?date=${today}`, {
    headers: { "x-apisports-key": API_KEY }
  });
  const data = await res.json();
  allMatches = data.response;

  const container = document.getElementById("matches-list");
  if (!container) return;
  container.innerHTML = "";

  allMatches.forEach(fix => {
    const li = document.createElement("li");
    li.className = "match-item";
    li.innerHTML = `
      <img src="${fix.teams.home.logo}" width="30"> <strong>${fix.teams.home.name}</strong>
      vs
      <img src="${fix.teams.away.logo}" width="30"> <strong>${fix.teams.away.name}</strong>
      | ${fix.score.fulltime.home ?? "-"}-${fix.score.fulltime.away ?? "-"}
      | ${fix.league.name}
    `;
    container.appendChild(li);
  });
}

// ==================== FETCH LEAGUES
async function fetchLeagues() {
  const res = await fetch(`${API_BASE}/leagues`, {
    headers: { "x-apisports-key": API_KEY }
  });
  const data = await res.json();
  const leagues = data.response.slice(0, 3); // first 3 leagues for simplicity
  for (let league of leagues) {
    await fetchTeams(league.league.id, 2025);
  }
}

// ==================== FETCH TEAMS
async function fetchTeams(leagueId, season) {
  const res = await fetch(`${API_BASE}/teams?league=${leagueId}&season=${season}`, {
    headers: { "x-apisports-key": API_KEY }
  });
  const data = await res.json();
  const teams = data.response.map(t => t.team);
  allTeams.push(...teams);
  teams.forEach(t => teamVotes[t.name] = 0);
  displayTeams(allTeams);

  for (let team of teams) await fetchPlayers(team.id, season);
}

// ==================== FETCH PLAYERS
async function fetchPlayers(teamId, season) {
  const res = await fetch(`${API_BASE}/players?team=${teamId}&season=${season}`, {
    headers: { "x-apisports-key": API_KEY }
  });
  const data = await res.json();
  const players = data.response.map(p => p.player);
  allPlayers.push(...players);
  players.forEach(p => playerVotes[p.name] = 0);
  displayPlayers(allPlayers);
  updateLeaderboard();
  updatePlayerSuggestions();
}

// ==================== DISPLAY TEAMS
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
      <div>
        <h3>${team.name}</h3>
        <p>Country: ${team.country ?? "N/A"}</p>
        <p>Founded: ${team.founded ?? "N/A"}</p>
        <p>Venue: ${team.venue ?? "N/A"}</p>
      </div>
      <button onclick="voteTeam('${team.name}')">Vote</button>
      <span id="votes-${team.name}">0 votes</span>
    `;
    container.appendChild(div);
  });
}

// ==================== DISPLAY PLAYERS
function displayPlayers(players) {
  const container = document.querySelector(".player-list");
  if (!container) return;
  container.innerHTML = "";
  players.forEach(player => {
    const div = document.createElement("div");
    div.className = "player";
    div.dataset.name = player.name;
    div.innerHTML = `
      <img src="${player.photo ?? ''}" alt="${player.name}">
      <div>
        <h3>${player.name}</h3>
        <p>Age: ${player.age ?? "N/A"} | Nationality: ${player.nationality ?? "N/A"}</p>
        <p>Position: ${player.position ?? "N/A"}</p>
      </div>
      <button onclick="votePlayer('${player.name}')">Vote</button>
      <span id="votes-${player.name}">0 votes</span>
    `;
    container.appendChild(div);
  });
}

// ==================== VOTING
function voteTeam(name) {
  teamVotes[name]++;
  document.getElementById(`votes-${name}`).innerText = `${teamVotes[name]} votes`;
  updateLeaderboard();
}
function votePlayer(name) {
  playerVotes[name]++;
  document.getElementById(`votes-${player.name}`).innerText = `${playerVotes[player.name]} votes`;
  updateLeaderboard();
}

// ==================== LEADERBOARD
function updateLeaderboard() {
  const teamList = document.getElementById("team-leaderboard");
  if (teamList) {
    teamList.innerHTML = "";
    Object.entries(teamVotes)
      .sort((a,b) => b[1]-a[1])
      .slice(0,10)
      .forEach(([team, votes]) => {
        const li = document.createElement("li");
        li.innerText = `${team}: ${votes} votes`;
        teamList.appendChild(li);
      });
  }

  const playerList = document.getElementById("player-leaderboard");
  if (playerList) {
    playerList.innerHTML = "";
    Object.entries(playerVotes)
      .sort((a,b) => b[1]-a[1])
      .slice(0,10)
      .forEach(([player, votes]) => {
        const li = document.createElement("li");
        li.innerText = `${player}: ${votes} votes`;
        playerList.appendChild(li);
      });
  }
}

// ==================== SEARCH
function searchPlayers() {
  const query = document.getElementById("player-search")?.value.toLowerCase() || "";
  document.querySelectorAll(".player").forEach(player => {
    player.style.display = player.dataset.name.toLowerCase().includes(query) ? "flex" : "none";
  });
}
function searchTeams() {
  const query = document.getElementById("team-search")?.value.toLowerCase() || "";
  document.querySelectorAll(".team").forEach(team => {
    team.style.display = team.dataset.name.toLowerCase().includes(query) ? "flex" : "none";
  });
}

// ==================== AUTOFILL
function updatePlayerSuggestions() {
  const datalist = document.getElementById("player-suggestions");
  if (!datalist) return;
  datalist.innerHTML = "";
  allPlayers.forEach(p => {
    const option = document.createElement("option");
    option.value = p.name;
    datalist.appendChild(option);
  });
}

// ==================== INIT
window.onload = () => {
  fetchLeagues();
  fetchMatches();
};
