const API_KEY = "97f69b9368382e085449660766ff3872";
const API_HOST = "api-football-v1.p.rapidapi.com";

let allTeams = [];
let allPlayers = [];
let allMatches = [];
let teamVotes = {};
let playerVotes = {};

// ===========================
// FETCH MATCHES (live)
async function fetchMatches() {
  const date = new Date().toISOString().split("T")[0];
  const url = `https://${API_HOST}/v3/fixtures?date=${date}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { "X-RapidAPI-Key": API_KEY, "X-RapidAPI-Host": API_HOST }
  });
  const data = await res.json();
  allMatches = data.response;

  const container = document.getElementById("matches-list");
  if (!container) return;
  container.innerHTML = "";

  allMatches.forEach(fix => {
    const li = document.createElement("li");
    li.className = "match-item";
    li.innerText = `${fix.teams.home.name} vs ${fix.teams.away.name} | ${fix.score.fulltime.home ?? "-"}-${fix.score.fulltime.away ?? "-"} | ${fix.league.name}`;
    container.appendChild(li);
  });
}

// ===========================
// FETCH LEAGUES → TEAMS → PLAYERS
async function fetchLeagues() {
  const url = `https://${API_HOST}/v3/leagues`;
  const res = await fetch(url, {
    method: "GET",
    headers: { "X-RapidAPI-Key": API_KEY, "X-RapidAPI-Host": API_HOST }
  });
  const leagues = (await res.json()).response.slice(0,3); // first 3 leagues for free plan

  for (let league of leagues) {
    await fetchTeams(league.league.id, 2025);
  }
}

// ===========================
// FETCH TEAMS
async function fetchTeams(leagueId, season) {
  const url = `https://${API_HOST}/v3/teams?league=${leagueId}&season=${season}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { "X-RapidAPI-Key": API_KEY, "X-RapidAPI-Host": API_HOST }
  });
  const teams = (await res.json()).response.map(t => t.team);
  allTeams.push(...teams);

  teams.forEach(t => teamVotes[t.name] = 0);
  displayTeams(allTeams);

  for (let team of teams) await fetchPlayers(team.id, season);
}

// ===========================
// FETCH PLAYERS
async function fetchPlayers(teamId, season) {
  const url = `https://${API_HOST}/v3/players?team=${teamId}&season=${season}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { "X-RapidAPI-Key": API_KEY, "X-RapidAPI-Host": API_HOST }
  });
  const players = (await res.json()).response.map(p => p.player);
  allPlayers.push(...players);
  players.forEach(p => playerVotes[p.name] = 0);

  displayPlayers(allPlayers);
  updateLeaderboard();
  updatePlayerSuggestions();
}

// ===========================
// DISPLAY TEAMS
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

// ===========================
// DISPLAY PLAYERS
function displayPlayers(players) {
  const container = document.querySelector(".player-list");
  if (!container) return;
  container.innerHTML = "";
  players.forEach(player => {
    const div = document.createElement("div");
    div.className = "player";
    div.dataset.name = player.name;
    div.innerHTML = `
      <img src="${player.photo ?? ''}" alt="${player.name}" style="width:60px;height:60px;margin-right:10px;border-radius:50%;">
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

// ===========================
// VOTING
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

// ===========================
// LEADERBOARD
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

// ===========================
// SEARCH (players page only)
function searchPlayers() {
  const query = document.getElementById("search")?.value.toLowerCase() || "";
  document.querySelectorAll(".player").forEach(player => {
    player.style.display = player.dataset.name.toLowerCase().includes(query) ? "flex" : "none";
  });
}

// ===========================
// AUTOFILL SUGGESTIONS
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

// ===========================
// INIT
window.onload = () => {
  fetchLeagues();
  fetchMatches();
};
