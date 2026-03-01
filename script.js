// Store votes in memory for now
let teamVotes = {
  "FC Barcelona": 0,
  "Real Madrid": 0,
  "Manchester City": 0,
  "Liverpool": 0
};

let playerVotes = {
  "Lionel Messi": 0,
  "Cristiano Ronaldo": 0,
  "Neymar Jr.": 0,
  "Kylian Mbappé": 0
};

// Voting functions
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

// Update leaderboard page if open
function updateLeaderboard() {
  if (document.getElementById("team-leaderboard")) {
    let teamList = document.getElementById("team-leaderboard");
    teamList.innerHTML = "";
    let sortedTeams = Object.entries(teamVotes).sort((a,b) => b[1]-a[1]);
    sortedTeams.forEach(([team,votes]) => {
      let li = document.createElement("li");
      li.innerText = `${team}: ${votes} votes`;
      teamList.appendChild(li);
    });
  }

  if (document.getElementById("player-leaderboard")) {
    let playerList = document.getElementById("player-leaderboard");
    playerList.innerHTML = "";
    let sortedPlayers = Object.entries(playerVotes).sort((a,b) => b[1]-a[1]);
    sortedPlayers.forEach(([player,votes]) => {
      let li = document.createElement("li");
      li.innerText = `${player}: ${votes} votes`;
      playerList.appendChild(li);
    });
  }
}

// Initialize leaderboard when page loads
window.onload = updateLeaderboard;
