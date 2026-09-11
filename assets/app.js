/* ============================================================
   WoVP Stats — Application
   Version 0.6 — Top scores, top positions, rivalries, fun facts
   ============================================================ */

const APP = { version: "0.6", dataPath: "data/" };

const DATA_FILES = {
  players: "players.json",
  challenges: "challenges.json",
  results: "results.json",
  standings: "standings.json",
  tableImages: "table-images.json",
};

const DB = {
  players: {},
  challenges: [],
  results: [],
  standings: {},
  tableImages: {},
  loaded: false,
};

/* ============================================================
   DIVISION MAPPING
   ============================================================ */
const DIVISION_MAP = {
  "Premier": { label: "ELITE", level: 1 },
  "ELITE": { label: "ELITE", level: 1 },
  "Division 1": { label: "PRO", level: 2 },
  "PRO": { label: "PRO", level: 2 },
  "Division 2": { label: "CHALLENGER", level: 3 },
  "CHALLENGER": { label: "CHALLENGER", level: 3 },
  "Division 3": { label: "OPEN", level: 4 },
  "OPEN": { label: "OPEN", level: 4 },
  "Division 4": { label: "Division 5", level: 5 },
  "Division 5": { label: "Division 6", level: 6 },
};

function getDivisionLabel(divName) { return DIVISION_MAP[divName]?.label || divName; }
function getDivisionLevel(divName) { return DIVISION_MAP[divName]?.level || 99; }

const DIVISION_COLORS = {
  ELITE: "#a78bfa", PRO: "#60a5fa", CHALLENGER: "#fbbf24",
  OPEN: "#34d399", "Division 5": "#fb923c", "Division 6": "#f87171",
};
function getDivisionColor(divName) {
  return DIVISION_COLORS[getDivisionLabel(divName)] || "#8b93a3";
}

/* ============================================================
   i18n
   ============================================================ */
const I18N = {
  en: {
    "nav.overview": "Overview", "nav.players": "Players", "nav.tables": "Tables",
    "nav.seasons": "Seasons", "nav.compare": "Compare", "nav.world": "World",
    "nav.records": "Hall of Fame",
    "nav.overview.home": "Home", "nav.players.all": "All players",
    "nav.tables.all": "All tables", "nav.tables.bySeason": "Challenges by season",
    "nav.seasons.all": "Final standings",
    "nav.compare.h2h": "Head-to-Head", "nav.world.countries": "Countries",
    "nav.records.all": "Records",
    "page.overview": "Overview", "page.players": "Players", "page.player": "Player",
    "page.tables": "Tables", "page.table": "Table",
    "page.tablesBySeason": "Challenges by season",
    "page.seasons": "Seasons", "page.season": "Season",
    "page.countries": "Countries", "page.records": "Hall of Fame", "page.h2h": "Head-to-Head",
    "loading": "Loading data…", "errorLoading": "Error loading data",
    "noResults": "No results", "noData": "No data",
    "playerCount": "player", "playersCount": "players",
    "tableCount": "table", "tablesCount": "tables",
    "occurrence": "occurrence", "occurrences": "occurrences",
    "result": "result", "resultsCount": "results",
    "challenge": "challenge", "challengesCount": "challenges",
    "seasonCount": "season", "seasonsCount": "seasons",
    "divisionCount": "division", "divisionsCount": "divisions",
    "participants": "participants", "played": "played",
    "wins": "Wins", "podiums": "Podiums", "top10": "Top 10",
    "avgPos": "Avg. pos.", "bestPos": "Best", "worstPos": "Worst",
    "playedLabel": "Played", "season": "Season", "week": "Week",
    "date": "Date", "position": "Position", "score": "Score", "points": "Points",
    "playerName": "Player", "tableName": "Table",
    "specialty": "Specialty", "nemesis": "Nemesis",
    "seasonHistory": "Season history", "recentResults": "Recent results",
    "tablesPerformance": "Tables performance", "allTimeLeaderboard": "All-time leaderboard",
    "allOccurrences": "All occurrences", "bestScoreEver": "Best score ever",
    "evolution": "Evolution over time", "metric": "Metric",
    "metric.participants": "Number of participants",
    "metric.bestScore": "Best score", "metric.medianScore": "Median score",
    "metric.score3": "Score of #3 (podium)", "metric.ratio": "Ratio best / median",
    "metric.halfBest": "Number of scores > 50% of best",
    "pleaseSelectTwo": "Please select two different players.",
    "commonChallenges": "Common challenges", "directEncounters": "Direct encounters",
    "advantage": "Advantage", "tie": "Tie", "tournament": "Tournament",
    "contributor": "Contributor", "country": "Country", "rank": "Rank", "total": "Total",
    "filter": "Filter", "sortBy": "Sort by", "searchPlayer": "Search a player…",
    "sort.occurrences": "Most occurrences", "sort.nameAsc": "Name (A-Z)",
    "sort.nameDesc": "Name (Z-A)", "sort.lastPlayed": "Recently played",
    "sort.firstPlayed": "First played",
    "sort.wins": "Most wins", "sort.podiums": "Most podiums",
    "sort.played": "Most played", "sort.avgPos": "Best average position",
    "sort.best": "Best position",
    "filter.all": "All tables", "filter.season": "Season only",
    "filter.tournament": "Tournaments only", "filter.mixed": "Season + Tournament",
    "filter.allPlayers": "All players", "filter.country": "Country",
    "noResultsInFilter": "No results in this filter",
    "topScores": "Top scores all-time", "showAll": "Show all", "showLess": "Show less",
    "showUnranked": "Show unranked", "hideUnranked": "Hide unranked",
    "session": "Session", "sortedBy": "sorted by",
    "careerTrajectory": "Career trajectory",
    "careerChart": "Career evolution",
    "noCareer": "No standings for this player",
    "champions": "Champions",
    "division": "Division",
    "finalStandings": "Final standings",
    "challengesTab": "Challenges",
    "standingsTab": "Final standings",
    "overviewTab": "Overview",
    "unranked": "Unranked", "champion": "Champion",
    "positionsAvailable": "Positions",
    "clickSeason": "Click a season to see the details",
    "topPlayerScores": "Your best scores",
    "topPlayerPositions": "Your best positions",
    "rivals": "Your rivals",
    "rivalCommunChallenges": "challenges",
    "rivalAvgGap": "avg gap",
    "rivalsHint": "Same division, minimum 5 common challenges",
    "noRivals": "No rivals detected",
    "didYouKnow": "Did you know?",
    "funFactsTitle": "Fun facts",
  },
  fr: {
    "nav.overview": "Vue d'ensemble", "nav.players": "Joueurs", "nav.tables": "Tables",
    "nav.seasons": "Saisons", "nav.compare": "Comparer", "nav.world": "Monde",
    "nav.records": "Panthéon",
    "nav.overview.home": "Accueil", "nav.players.all": "Tous les joueurs",
    "nav.tables.all": "Toutes les tables", "nav.tables.bySeason": "Challenges par saison",
    "nav.seasons.all": "Classements finaux",
    "nav.compare.h2h": "Face-à-Face", "nav.world.countries": "Pays",
    "nav.records.all": "Records",
    "page.overview": "Vue d'ensemble", "page.players": "Joueurs", "page.player": "Joueur",
    "page.tables": "Tables", "page.table": "Table",
    "page.tablesBySeason": "Challenges par saison",
    "page.seasons": "Saisons", "page.season": "Saison",
    "page.countries": "Pays", "page.records": "Panthéon", "page.h2h": "Face-à-Face",
    "loading": "Chargement des données…", "errorLoading": "Erreur de chargement",
    "noResults": "Aucun résultat", "noData": "Aucune donnée",
    "playerCount": "joueur", "playersCount": "joueurs",
    "tableCount": "table", "tablesCount": "tables",
    "occurrence": "occurrence", "occurrences": "occurrences",
    "result": "résultat", "resultsCount": "résultats",
    "challenge": "challenge", "challengesCount": "challenges",
    "seasonCount": "saison", "seasonsCount": "saisons",
    "divisionCount": "division", "divisionsCount": "divisions",
    "participants": "participants", "played": "joués",
    "wins": "Victoires", "podiums": "Podiums", "top10": "Top 10",
    "avgPos": "Pos. moy.", "bestPos": "Meilleure", "worstPos": "Pire",
    "playedLabel": "Joués", "season": "Saison", "week": "Semaine",
    "date": "Date", "position": "Position", "score": "Score", "points": "Points",
    "playerName": "Joueur", "tableName": "Table",
    "specialty": "Spécialité", "nemesis": "Némésis",
    "seasonHistory": "Historique par saison", "recentResults": "Résultats récents",
    "tablesPerformance": "Performance par table", "allTimeLeaderboard": "Classement général",
    "allOccurrences": "Toutes les occurrences", "bestScoreEver": "Meilleur score historique",
    "evolution": "Évolution dans le temps", "metric": "Métrique",
    "metric.participants": "Nombre de participants",
    "metric.bestScore": "Meilleur score", "metric.medianScore": "Score médian",
    "metric.score3": "Score du #3 (podium)", "metric.ratio": "Ratio meilleur / médian",
    "metric.halfBest": "Nombre de scores > 50% du meilleur",
    "pleaseSelectTwo": "Sélectionnez deux joueurs différents.",
    "commonChallenges": "Challenges communs", "directEncounters": "Confrontations directes",
    "advantage": "Avantage", "tie": "Égalité", "tournament": "Tournoi",
    "contributor": "Contributeur", "country": "Pays", "rank": "Rang", "total": "Total",
    "filter": "Filtre", "sortBy": "Trier par", "searchPlayer": "Rechercher un joueur…",
    "sort.occurrences": "Plus d'occurrences", "sort.nameAsc": "Nom (A-Z)",
    "sort.nameDesc": "Nom (Z-A)", "sort.lastPlayed": "Jouées récemment",
    "sort.firstPlayed": "Première jouée",
    "sort.wins": "Plus de victoires", "sort.podiums": "Plus de podiums",
    "sort.played": "Plus de challenges", "sort.avgPos": "Meilleure pos. moyenne",
    "sort.best": "Meilleure position",
    "filter.all": "Toutes les tables", "filter.season": "Saison uniquement",
    "filter.tournament": "Tournois uniquement", "filter.mixed": "Saison + Tournoi",
    "filter.allPlayers": "Tous les joueurs", "filter.country": "Pays",
    "noResultsInFilter": "Aucun résultat dans ce filtre",
    "topScores": "Meilleurs scores all-time", "showAll": "Voir tout", "showLess": "Réduire",
    "showUnranked": "Voir les non-classés", "hideUnranked": "Masquer les non-classés",
    "session": "Session", "sortedBy": "trié par",
    "careerTrajectory": "Trajectoire de carrière",
    "careerChart": "Évolution de carrière",
    "noCareer": "Pas de classement pour ce joueur",
    "champions": "Champions",
    "division": "Division",
    "finalStandings": "Classement final",
    "challengesTab": "Challenges",
    "standingsTab": "Classement final",
    "overviewTab": "Aperçu",
    "unranked": "Non classés", "champion": "Champion",
    "positionsAvailable": "Positions",
    "clickSeason": "Cliquez sur une saison pour voir les détails",
    "topPlayerScores": "Tes meilleurs scores",
    "topPlayerPositions": "Tes meilleures positions",
    "rivals": "Tes rivaux",
    "rivalCommunChallenges": "challenges",
    "rivalAvgGap": "écart moy.",
    "rivalsHint": "Même division, minimum 5 challenges communs",
    "noRivals": "Aucun rival détecté",
    "didYouKnow": "Le saviez-vous ?",
    "funFactsTitle": "Fun facts",
  },
};

let LANG = (navigator.language || "en").toLowerCase().startsWith("fr") ? "fr" : "en";
function t(key) { return (I18N[LANG] && I18N[LANG][key]) || (I18N.en[key]) || key; }

/* ============================================================
   HELPERS
   ============================================================ */
function countryFlag(cc) {
  if (!cc || cc.length !== 2) return "";
  const base = 0x1F1E6;
  return String.fromCodePoint(base + cc.charCodeAt(0) - 65, base + cc.charCodeAt(1) - 65);
}

const COUNTRY_NAMES = {
  FR: "France", US: "United States", CA: "Canada", GB: "United Kingdom",
  DE: "Germany", NL: "Netherlands", BE: "Belgium", CH: "Switzerland",
  ES: "Spain", IT: "Italy", PT: "Portugal", SE: "Sweden", NO: "Norway",
  DK: "Denmark", FI: "Finland", AT: "Austria", AU: "Australia",
  NZ: "New Zealand", JP: "Japan", CN: "China", BR: "Brazil",
  AR: "Argentina", CL: "Chile", UY: "Uruguay", MX: "Mexico",
  PL: "Poland", CZ: "Czech Republic", HU: "Hungary", GR: "Greece",
  RU: "Russia", UA: "Ukraine", ZA: "South Africa", IN: "India",
  PH: "Philippines", TR: "Turkey", MA: "Morocco", IE: "Ireland",
  AF: "Afghanistan", SZ: "Eswatini", RE: "Réunion",
  MK: "North Macedonia", VN: "Vietnam", RS: "Serbia", SI: "Slovenia",
  CW: "Curaçao", AX: "Åland Islands", MR: "Mauritania",
};
function countryName(cc) { return COUNTRY_NAMES[cc] || cc || "—"; }

function fmtScore(n) {
  if (n === null || n === undefined || n === "") return "";
  return Number(n).toLocaleString("en-US");
}
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}
function avg(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }
function median(arr) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
function round(n, decimals = 1) { const f = Math.pow(10, decimals); return Math.round(n * f) / f; }

function getInitials(tableName) {
  const words = tableName.replace(/\([^)]*\)/g, "").trim().split(/\s+/);
  let initials = "";
  for (const w of words) {
    if (w.length && /[a-z]/i.test(w[0])) { initials += w[0]; if (initials.length >= 2) break; }
  }
  if (!initials) initials = tableName.substring(0, 2);
  return initials.toUpperCase();
}
function getHashGradient(tableName) {
  let hash = 0;
  for (let i = 0; i < tableName.length; i++) hash = (hash * 31 + tableName.charCodeAt(i)) | 0;
  const hue = Math.abs(hash) % 360;
  return `linear-gradient(135deg, hsl(${hue}, 45%, 32%), hsl(${(hue + 40) % 360}, 45%, 20%))`;
}
function tablePlaceholder(tableName, size) {
  const cls = size === "lg" ? "table-thumb lg" : "table-thumb";
  const imgEntry = DB.tableImages && DB.tableImages[tableName];
  if (imgEntry && imgEntry.imgUrl) {
    return `<div class="${cls} table-thumb-img">
      <img src="${esc(imgEntry.imgUrl)}" alt="${esc(tableName)}" loading="lazy"
           onerror="this.parentNode.classList.remove('table-thumb-img'); this.parentNode.innerHTML='${esc(getInitials(tableName))}'; this.parentNode.style.background='${getHashGradient(tableName)}';">
    </div>`;
  }
  return `<div class="${cls}" style="background:${getHashGradient(tableName)};">${esc(getInitials(tableName))}</div>`;
}
function sessionLabel(challenge) {
  if (!challenge) return "";
  if (isTournament(challenge)) return t("tournament");
  return `S${challenge.season} W${challenge.week}`;
}

/* ============================================================
   DATA ACCESS
   ============================================================ */
function getChallengeById(id) { return DB.challenges.find(c => c.id === id); }
function getPlayerInfo(name) { return DB.players[name] || { country: "", contributor: false }; }
function getResultsForChallenge(id) { return DB.results.filter(r => r.challengeId === id); }
function getResultsForPlayer(name) { return DB.results.filter(r => r.playerName === name); }
function isTournament(challenge) { return !challenge || !challenge.season; }

function getPlayerStandings(name) {
  const results = [];
  for (const [seasonNum, seasonData] of Object.entries(DB.standings)) {
    for (const div of seasonData.divisions || []) {
      const entry = (div.standings || []).find(s => s.playerName === name);
      if (entry) {
        results.push({
          season: Number(seasonNum),
          seasonName: seasonData.name,
          division: div.name,
          divisionLabel: getDivisionLabel(div.name),
          divisionLevel: getDivisionLevel(div.name),
          position: entry.position,
          points: entry.points || 0,
          unranked: entry.unranked || false,
        });
      }
    }
  }
  return results.sort((a, b) => a.season - b.season);
}

/* Retourne la division d'un joueur pour une saison donnée */
function getPlayerDivisionForSeason(playerName, seasonNum) {
  const seasonData = DB.standings[seasonNum];
  if (!seasonData) return null;
  for (const div of seasonData.divisions || []) {
    if ((div.standings || []).some(s => s.playerName === playerName)) {
      return div.name;
    }
  }
  return null;
}

/* ============================================================
   RIVALRIES (intra-division)
   ============================================================ */
function computeRivals(playerName, minCommon = 5, topN = 5) {
  const myResults = getResultsForPlayer(playerName);
  if (!myResults.length) return [];

  // Pour chaque challenge du joueur, on identifie sa division
  // et on regarde qui d'autre a joué CE challenge dans CETTE division
  const rivals = {}; // { rivalName: { gaps: [], divisions: {}, challenges: Set } }

  for (const myRes of myResults) {
    const challenge = getChallengeById(myRes.challengeId);
    if (!challenge) continue;
    if (isTournament(challenge)) continue; // on ne fait que les saisons

    const myDivision = getPlayerDivisionForSeason(playerName, challenge.season);
    if (!myDivision) continue;

    // Tous les résultats de ce challenge
    const allResults = getResultsForChallenge(challenge.id);

    for (const otherRes of allResults) {
      if (otherRes.playerName === playerName) continue;

      // Cet autre joueur était-il dans la même division ?
      const otherDivision = getPlayerDivisionForSeason(otherRes.playerName, challenge.season);
      if (otherDivision !== myDivision) continue;

      const key = otherRes.playerName;
      if (!rivals[key]) rivals[key] = { gaps: [], divisions: {}, challenges: new Set() };
      rivals[key].gaps.push(Math.abs(myRes.position - otherRes.position));
      rivals[key].divisions[myDivision] = (rivals[key].divisions[myDivision] || 0) + 1;
      rivals[key].challenges.add(challenge.id);
    }
  }

  // Filtre + tri
  const list = [];
  for (const [name, data] of Object.entries(rivals)) {
    if (data.challenges.size < minCommon) continue;
    const avgGap = avg(data.gaps);
    // Division la plus fréquente
    let topDiv = "";
    let topCount = 0;
    for (const [d, c] of Object.entries(data.divisions)) {
      if (c > topCount) { topDiv = d; topCount = c; }
    }
    list.push({
      name,
      commonChallenges: data.challenges.size,
      avgGap,
      topDivision: topDiv,
    });
  }

  list.sort((a, b) => a.avgGap - b.avgGap);
  return list.slice(0, topN);
}

/* ============================================================
   FUN FACTS
   ============================================================ */
function computeFunFacts() {
  const facts = [];

  // ============================================================
  // PRÉ-CALCULS (faits une fois, utilisés partout)
  // ============================================================
  const allResults = DB.results;
  const byChallenge = {};
  allResults.forEach(r => {
    if (!byChallenge[r.challengeId]) byChallenge[r.challengeId] = [];
    byChallenge[r.challengeId].push(r);
  });

  const winsByPlayer = {};
  const podiumsByPlayer = {};
  const top10ByPlayer = {};
  const secondPlacesByPlayer = {};
  const playsByPlayer = {};
  const sumPosByPlayer = {};

  allResults.forEach(r => {
    const p = r.playerName;
    playsByPlayer[p] = (playsByPlayer[p] || 0) + 1;
    sumPosByPlayer[p] = (sumPosByPlayer[p] || 0) + r.position;
    if (r.position === 1) winsByPlayer[p] = (winsByPlayer[p] || 0) + 1;
    if (r.position === 2) secondPlacesByPlayer[p] = (secondPlacesByPlayer[p] || 0) + 1;
    if (r.position <= 3) podiumsByPlayer[p] = (podiumsByPlayer[p] || 0) + 1;
    if (r.position <= 10) top10ByPlayer[p] = (top10ByPlayer[p] || 0) + 1;
  });

  // Résultats par joueur, triés par date
  const resultsByPlayer = {};
  allResults.forEach(r => {
    const c = getChallengeById(r.challengeId);
    if (!c) return;
    if (!resultsByPlayer[r.playerName]) resultsByPlayer[r.playerName] = [];
    resultsByPlayer[r.playerName].push({ ...r, date: c.date, table: c.table, season: c.season });
  });
  Object.values(resultsByPlayer).forEach(arr => {
    arr.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  });

  // ============================================================
  // 1. Plus grand écart entre #1 et #2
  // ============================================================
  let maxGap = { gap: 0 };
  for (const [cid, results] of Object.entries(byChallenge)) {
    const sorted = [...results].sort((a, b) => b.score - a.score);
    if (sorted.length >= 2 && sorted[0].score > 0 && sorted[1].score > 0) {
      const gap = sorted[0].score - sorted[1].score;
      if (gap > maxGap.gap) maxGap = { gap, challengeId: cid, player: sorted[0].playerName, table: getChallengeById(cid)?.table };
    }
  }
  if (maxGap.challengeId) {
    facts.push({
      text: `The biggest score gap between #1 and #2 was on <strong>${esc(maxGap.table)}</strong>: <strong>${fmtScore(maxGap.gap)}</strong> points by <strong>${esc(maxGap.player)}</strong>.`,
      textFr: `Le plus grand écart de score entre #1 et #2 était sur <strong>${esc(maxGap.table)}</strong> : <strong>${fmtScore(maxGap.gap)}</strong> points par <strong>${esc(maxGap.player)}</strong>.`,
    });
  }

  // ============================================================
  // 2. Joueur le plus titré (champion de division)
  // ============================================================
  const titleCount = {};
  for (const [season, data] of Object.entries(DB.standings)) {
    for (const div of data.divisions || []) {
      const champion = (div.standings || []).find(s => s.position === 1 && !s.unranked);
      if (champion) titleCount[champion.playerName] = (titleCount[champion.playerName] || 0) + 1;
    }
  }
  const topTitle = Object.entries(titleCount).sort((a, b) => b[1] - a[1])[0];
  if (topTitle && topTitle[1] >= 2) {
    facts.push({
      text: `<strong>${esc(topTitle[0])}</strong> has won <strong>${topTitle[1]}</strong> division championships — the most in WoVP history.`,
      textFr: `<strong>${esc(topTitle[0])}</strong> a remporté <strong>${topTitle[1]}</strong> titres de division — le plus de l'histoire de WoVP.`,
    });
  }

  // ============================================================
  // 3. Challenge le plus populaire
  // ============================================================
  let maxParticipants = { count: 0 };
  DB.challenges.forEach(c => {
    const n = c.resultCount || getResultsForChallenge(c.id).length;
    if (n > maxParticipants.count) maxParticipants = { count: n, table: c.table, season: c.season, week: c.week };
  });
  if (maxParticipants.count > 0) {
    facts.push({
      text: `The most popular challenge was <strong>${esc(maxParticipants.table)}</strong> (Season ${maxParticipants.season}, Week ${maxParticipants.week}) with <strong>${maxParticipants.count}</strong> participants.`,
      textFr: `Le challenge le plus populaire était <strong>${esc(maxParticipants.table)}</strong> (Saison ${maxParticipants.season}, Semaine ${maxParticipants.week}) avec <strong>${maxParticipants.count}</strong> participants.`,
    });
  }

  // ============================================================
  // 4. Éternel second (podiums sans victoire)
  // ============================================================
  const podiumsNoWin = {};
  allResults.forEach(r => {
    if ((r.position === 2 || r.position === 3) && !winsByPlayer[r.playerName]) {
      podiumsNoWin[r.playerName] = (podiumsNoWin[r.playerName] || 0) + 1;
    }
  });
  const eternalSecond = Object.entries(podiumsNoWin).sort((a, b) => b[1] - a[1])[0];
  if (eternalSecond && eternalSecond[1] >= 3) {
    facts.push({
      text: `<strong>${esc(eternalSecond[0])}</strong> has <strong>${eternalSecond[1]}</strong> podium finishes without a single win. So close!`,
      textFr: `<strong>${esc(eternalSecond[0])}</strong> a <strong>${eternalSecond[1]}</strong> podiums sans aucune victoire. Si proche !`,
    });
  }

  // ============================================================
  // 5. Table la plus jouée
  // ============================================================
  const tablePlays = {};
  DB.challenges.forEach(c => {
    if (!tablePlays[c.table]) tablePlays[c.table] = 0;
    tablePlays[c.table] += (c.resultCount || 0);
  });
  const topTable = Object.entries(tablePlays).sort((a, b) => b[1] - a[1])[0];
  if (topTable) {
    facts.push({
      text: `The most played table is <strong>${esc(topTable[0])}</strong> with <strong>${fmtScore(topTable[1])}</strong> total entries.`,
      textFr: `La table la plus jouée est <strong>${esc(topTable[0])}</strong> avec <strong>${fmtScore(topTable[1])}</strong> entrées au total.`,
    });
  }

  // ============================================================
  // 6. Pays le plus titré
  // ============================================================
  const countryWins = {};
  allResults.forEach(r => {
    if (r.position === 1) {
      const cc = getPlayerInfo(r.playerName).country;
      if (cc) countryWins[cc] = (countryWins[cc] || 0) + 1;
    }
  });
  const topCountry = Object.entries(countryWins).sort((a, b) => b[1] - a[1])[0];
  if (topCountry) {
    facts.push({
      text: `<strong>${countryFlag(topCountry[0])} ${esc(countryName(topCountry[0]))}</strong> leads with <strong>${topCountry[1]}</strong> challenge wins.`,
      textFr: `<strong>${countryFlag(topCountry[0])} ${esc(countryName(topCountry[0]))}</strong> mène avec <strong>${topCountry[1]}</strong> victoires de challenge.`,
    });
  }

  // ============================================================
  // 7. Meilleur winrate (min. 20 challenges)
  // ============================================================
  const eligibleWinrate = Object.entries(playsByPlayer)
    .filter(([p, n]) => n >= 20 && winsByPlayer[p])
    .map(([p, n]) => ({ player: p, rate: winsByPlayer[p] / n, wins: winsByPlayer[p], plays: n }))
    .sort((a, b) => b.rate - a.rate);
  if (eligibleWinrate.length && eligibleWinrate[0].rate >= 0.15) {
    const w = eligibleWinrate[0];
    facts.push({
      text: `Best win rate (20+ challenges): <strong>${esc(w.player)}</strong> with <strong>${(w.rate * 100).toFixed(1)}%</strong> (${w.wins} wins in ${w.plays} challenges).`,
      textFr: `Meilleur taux de victoire (20+ challenges) : <strong>${esc(w.player)}</strong> avec <strong>${(w.rate * 100).toFixed(1)}%</strong> (${w.wins} victoires sur ${w.plays} challenges).`,
    });
  }

  // ============================================================
  // 8. Le roi des 2èmes places
  // ============================================================
  const topSecond = Object.entries(secondPlacesByPlayer).sort((a, b) => b[1] - a[1])[0];
  if (topSecond && topSecond[1] >= 5) {
    facts.push({
      text: `<strong>${esc(topSecond[0])}</strong> finished in 2nd place <strong>${topSecond[1]}</strong> times. Always the bridesmaid!`,
      textFr: `<strong>${esc(topSecond[0])}</strong> a fini 2ème <strong>${topSecond[1]}</strong> fois. Toujours au pied du podium !`,
    });
  }

  // ============================================================
  // 9. Nombre total de pays représentés
  // ============================================================
  const countries = new Set();
  Object.values(DB.players).forEach(p => { if (p.country) countries.add(p.country); });
  if (countries.size > 1) {
    facts.push({
      text: `WoVP Stats gathers players from <strong>${countries.size}</strong> different countries.`,
      textFr: `WoVP Stats rassemble des joueurs de <strong>${countries.size}</strong> pays différents.`,
    });
  }

  // ============================================================
  // 10. Saison la plus disputée
  // ============================================================
  const seasonPlayerCount = {};
  for (const [season, data] of Object.entries(DB.standings)) {
    let total = 0;
    for (const div of data.divisions || []) total += (div.standings || []).length;
    seasonPlayerCount[season] = total;
  }
  const topSeason = Object.entries(seasonPlayerCount).sort((a, b) => b[1] - a[1])[0];
  if (topSeason) {
    facts.push({
      text: `<strong>Season ${topSeason[0]}</strong> was the most contested season with <strong>${topSeason[1]}</strong> ranked players.`,
      textFr: `<strong>Saison ${topSeason[0]}</strong> était la plus disputée avec <strong>${topSeason[1]}</strong> joueurs classés.`,
    });
  }

  // ============================================================
  // 11. Le joueur le plus présent en saisons
  // ============================================================
  const seasonsByPlayer = {};
  for (const [season, data] of Object.entries(DB.standings)) {
    for (const div of data.divisions || []) {
      for (const s of div.standings || []) {
        if (!s.unranked) {
          if (!seasonsByPlayer[s.playerName]) seasonsByPlayer[s.playerName] = new Set();
          seasonsByPlayer[s.playerName].add(season);
        }
      }
    }
  }
  const topSeasons = Object.entries(seasonsByPlayer)
    .map(([p, s]) => ({ player: p, count: s.size }))
    .sort((a, b) => b.count - a.count)[0];
  if (topSeasons && topSeasons.count >= 5) {
    facts.push({
      text: `<strong>${esc(topSeasons.player)}</strong> has been ranked in <strong>${topSeasons.count}</strong> different seasons — the most in WoVP.`,
      textFr: `<strong>${esc(topSeasons.player)}</strong> a été classé dans <strong>${topSeasons.count}</strong> saisons différentes — le record de WoVP.`,
    });
  }

  // ============================================================
  // 12. Plus longue série de Top 10 consécutifs
  // ============================================================
  let bestTop10Streak = { player: null, streak: 0 };
  for (const [player, results] of Object.entries(resultsByPlayer)) {
    let currentStreak = 0, maxStreak = 0;
    results.forEach(r => {
      if (r.position <= 10) { currentStreak++; maxStreak = Math.max(maxStreak, currentStreak); }
      else currentStreak = 0;
    });
    if (maxStreak > bestTop10Streak.streak) bestTop10Streak = { player, streak: maxStreak };
  }
  if (bestTop10Streak.streak >= 5) {
    facts.push({
      text: `<strong>${esc(bestTop10Streak.player)}</strong> has <strong>${bestTop10Streak.streak}</strong> consecutive Top 10 finishes. Impressive!`,
      textFr: `<strong>${esc(bestTop10Streak.player)}</strong> a <strong>${bestTop10Streak.streak}</strong> Top 10 consécutifs. Impressionnant !`,
    });
  }

  // ============================================================
  // 13. Plus longue série de podiums consécutifs
  // ============================================================
  let bestPodiumStreak = { player: null, streak: 0 };
  for (const [player, results] of Object.entries(resultsByPlayer)) {
    let currentStreak = 0, maxStreak = 0;
    results.forEach(r => {
      if (r.position <= 3) { currentStreak++; maxStreak = Math.max(maxStreak, currentStreak); }
      else currentStreak = 0;
    });
    if (maxStreak > bestPodiumStreak.streak) bestPodiumStreak = { player, streak: maxStreak };
  }
  if (bestPodiumStreak.streak >= 3) {
    facts.push({
      text: `<strong>${esc(bestPodiumStreak.player)}</strong> has <strong>${bestPodiumStreak.streak}</strong> consecutive podium finishes.`,
      textFr: `<strong>${esc(bestPodiumStreak.player)}</strong> a <strong>${bestPodiumStreak.streak}</strong> podiums consécutifs.`,
    });
  }

  // ============================================================
  // 14. Plus longue série de victoires consécutives
  // ============================================================
  let bestWinStreak = { player: null, streak: 0 };
  for (const [player, results] of Object.entries(resultsByPlayer)) {
    let currentStreak = 0, maxStreak = 0;
    results.forEach(r => {
      if (r.position === 1) { currentStreak++; maxStreak = Math.max(maxStreak, currentStreak); }
      else currentStreak = 0;
    });
    if (maxStreak > bestWinStreak.streak) bestWinStreak = { player, streak: maxStreak };
  }
  if (bestWinStreak.streak >= 2) {
    facts.push({
      text: `<strong>${esc(bestWinStreak.player)}</strong> won <strong>${bestWinStreak.streak}</strong> challenges in a row. Unstoppable!`,
      textFr: `<strong>${esc(bestWinStreak.player)}</strong> a remporté <strong>${bestWinStreak.streak}</strong> challenges consécutifs. Inarrêtable !`,
    });
  }

  // ============================================================
  // 15. Nombre total de résultats enregistrés
  // ============================================================
  if (allResults.length >= 1000) {
    facts.push({
      text: `WoVP Stats has recorded <strong>${allResults.length.toLocaleString("en-US")}</strong> challenge results so far.`,
      textFr: `WoVP Stats a enregistré <strong>${allResults.length.toLocaleString("en-US")}</strong> résultats de challenge jusqu'ici.`,
    });
  }

  // ============================================================
  // 16. Nombre total de challenges archivés
  // ============================================================
  if (DB.challenges.length >= 100) {
    facts.push({
      text: `The archive now contains <strong>${DB.challenges.length}</strong> archived challenges.`,
      textFr: `Les archives contiennent maintenant <strong>${DB.challenges.length}</strong> challenges archivés.`,
    });
  }

  // ============================================================
  // 17. Nombre total de tables distinctes
  // ============================================================
  const uniqueTables = new Set(DB.challenges.map(c => c.table));
  if (uniqueTables.size >= 50) {
    facts.push({
      text: `Over <strong>${uniqueTables.size}</strong> different pinball tables have been played in WoVP.`,
      textFr: `Plus de <strong>${uniqueTables.size}</strong> tables de flipper différentes ont été jouées dans WoVP.`,
    });
  }

  // ============================================================
  // 18. Meilleur score absolu (toutes tables)
  // ============================================================
  const bestScoreAllTime = [...allResults].sort((a, b) => b.score - a.score)[0];
  if (bestScoreAllTime && bestScoreAllTime.score > 0) {
    const c = getChallengeById(bestScoreAllTime.challengeId);
    facts.push({
      text: `The highest score ever recorded is <strong>${fmtScore(bestScoreAllTime.score)}</strong> by <strong>${esc(bestScoreAllTime.playerName)}</strong> on <strong>${esc(c?.table || "unknown")}</strong>.`,
      textFr: `Le meilleur score jamais enregistré est <strong>${fmtScore(bestScoreAllTime.score)}</strong> par <strong>${esc(bestScoreAllTime.playerName)}</strong> sur <strong>${esc(c?.table || "inconnu")}</strong>.`,
    });
  }

  // ============================================================
  // 19. Le joueur le plus actif
  // ============================================================
  const mostActive = Object.entries(playsByPlayer).sort((a, b) => b[1] - a[1])[0];
  if (mostActive && mostActive[1] >= 50) {
    facts.push({
      text: `<strong>${esc(mostActive[0])}</strong> is the most active player with <strong>${mostActive[1]}</strong> challenges played.`,
      textFr: `<strong>${esc(mostActive[0])}</strong> est le joueur le plus actif avec <strong>${mostActive[1]}</strong> challenges joués.`,
    });
  }

  // ============================================================
  // 20. Le joueur avec le plus de Top 10
  // ============================================================
  const topTop10 = Object.entries(top10ByPlayer).sort((a, b) => b[1] - a[1])[0];
  if (topTop10 && topTop10[1] >= 20) {
    facts.push({
      text: `<strong>${esc(topTop10[0])}</strong> has <strong>${topTop10[1]}</strong> Top 10 finishes. Consistency is key.`,
      textFr: `<strong>${esc(topTop10[0])}</strong> a <strong>${topTop10[1]}</strong> Top 10. La régularité paie.`,
    });
  }

  // ============================================================
  // 21. Le plus grand nombre de podiums dans une saison
  // ============================================================
  const podiumsBySeasonPlayer = {};
  for (const [season, data] of Object.entries(DB.standings)) {
    for (const div of data.divisions || []) {
      for (const s of div.standings || []) {
        if (s.position <= 3 && !s.unranked) {
          const key = s.playerName + "|" + season;
          podiumsBySeasonPlayer[key] = { player: s.playerName, season, position: s.position };
        }
      }
    }
  }
  // (Compte par joueur et saison — on utilise plutôt un comptage direct des positions dans les résultats)
  const seasonPodiumsCount = {};
  allResults.forEach(r => {
    const c = getChallengeById(r.challengeId);
    if (!c || !c.season) return;
    if (r.position <= 3) {
      const key = r.playerName + "|" + c.season;
      seasonPodiumsCount[key] = (seasonPodiumsCount[key] || 0) + 1;
    }
  });
  const topSeasonPodiums = Object.entries(seasonPodiumsCount)
    .map(([key, count]) => {
      const [player, season] = key.split("|");
      return { player, season: Number(season), count };
    })
    .sort((a, b) => b.count - a.count)[0];
  if (topSeasonPodiums && topSeasonPodiums.count >= 5) {
    facts.push({
      text: `<strong>${esc(topSeasonPodiums.player)}</strong> scored <strong>${topSeasonPodiums.count}</strong> podiums in a single season (Season ${topSeasonPodiums.season}).`,
      textFr: `<strong>${esc(topSeasonPodiums.player)}</strong> a décroché <strong>${topSeasonPodiums.count}</strong> podiums en une seule saison (Saison ${topSeasonPodiums.season}).`,
    });
  }

  // ============================================================
  // 22. Le plus grand nombre de victoires dans une saison
  // ============================================================
  const seasonWinsCount = {};
  allResults.forEach(r => {
    const c = getChallengeById(r.challengeId);
    if (!c || !c.season) return;
    if (r.position === 1) {
      const key = r.playerName + "|" + c.season;
      seasonWinsCount[key] = (seasonWinsCount[key] || 0) + 1;
    }
  });
  const topSeasonWins = Object.entries(seasonWinsCount)
    .map(([key, count]) => {
      const [player, season] = key.split("|");
      return { player, season: Number(season), count };
    })
    .sort((a, b) => b.count - a.count)[0];
  if (topSeasonWins && topSeasonWins.count >= 3) {
    facts.push({
      text: `<strong>${esc(topSeasonWins.player)}</strong> won <strong>${topSeasonWins.count}</strong> challenges in a single season (Season ${topSeasonWins.season}).`,
      textFr: `<strong>${esc(topSeasonWins.player)}</strong> a remporté <strong>${topSeasonWins.count}</strong> challenges en une seule saison (Saison ${topSeasonWins.season}).`,
    });
  }

  // ============================================================
  // 23. Plus grande série de challenges joués consécutivement
  // ============================================================
  // (nécessite de connaître l'ordre chronologique des challenges)
  const sortedChallenges = [...DB.challenges].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  const challengeOrder = {};
  sortedChallenges.forEach((c, i) => { challengeOrder[c.id] = i; });
  let bestPlayStreak = { player: null, streak: 0 };
  for (const [player, results] of Object.entries(resultsByPlayer)) {
    const indices = results.map(r => challengeOrder[r.challengeId]).filter(i => i !== undefined).sort((a, b) => a - b);
    let currentStreak = 1, maxStreak = 1;
    for (let i = 1; i < indices.length; i++) {
      if (indices[i] === indices[i - 1] + 1) { currentStreak++; maxStreak = Math.max(maxStreak, currentStreak); }
      else currentStreak = 1;
    }
    if (maxStreak > bestPlayStreak.streak) bestPlayStreak = { player, streak: maxStreak };
  }
  if (bestPlayStreak.streak >= 10) {
    facts.push({
      text: `<strong>${esc(bestPlayStreak.player)}</strong> played <strong>${bestPlayStreak.streak}</strong> consecutive challenges without missing one.`,
      textFr: `<strong>${esc(bestPlayStreak.player)}</strong> a joué <strong>${bestPlayStreak.streak}</strong> challenges consécutifs sans en rater un seul.`,
    });
  }

  // ============================================================
  // 24. Le podium le plus serré (écart #1-#2-#3)
  // ============================================================
  let tightestPodium = { gap: Infinity };
  for (const [cid, results] of Object.entries(byChallenge)) {
    if (results.length < 3) continue;
    const sorted = [...results].sort((a, b) => b.score - a.score);
    if (sorted[0].score > 0 && sorted[1].score > 0 && sorted[2].score > 0) {
      const top3Gap = sorted[0].score - sorted[2].score;
      if (top3Gap < tightestPodium.gap && sorted[0].score > 0) {
        tightestPodium = { gap: top3Gap, table: getChallengeById(cid)?.table, players: [sorted[0].playerName, sorted[1].playerName, sorted[2].playerName] };
      }
    }
  }
  if (tightestPodium.gap < Infinity) {
    facts.push({
      text: `The tightest podium ever was on <strong>${esc(tightestPodium.table)}</strong>: only <strong>${fmtScore(tightestPodium.gap)}</strong> points between #1 and #3.`,
      textFr: `Le podium le plus serré de tous les temps était sur <strong>${esc(tightestPodium.table)}</strong> : seulement <strong>${fmtScore(tightestPodium.gap)}</strong> points entre le #1 et le #3.`,
    });
  }

  // ============================================================
  // 25. Joueur avec le plus de challenges joués dans la même division
  // ============================================================
  const sameDivPlays = {};
  allResults.forEach(r => {
    const c = getChallengeById(r.challengeId);
    if (!c || !c.season) return;
    const div = getPlayerDivisionForSeason(r.playerName, c.season);
    if (!div) return;
    const key = r.playerName + "|" + div;
    sameDivPlays[key] = (sameDivPlays[key] || 0) + 1;
  });
  const topSameDiv = Object.entries(sameDivPlays)
    .map(([key, count]) => {
      const [player, div] = key.split("|");
      return { player, div, count };
    })
    .sort((a, b) => b.count - a.count)[0];
  if (topSameDiv && topSameDiv.count >= 30) {
    facts.push({
      text: `<strong>${esc(topSameDiv.player)}</strong> has played <strong>${topSameDiv.count}</strong> challenges in the <strong>${esc(topSameDiv.div)}</strong> division.`,
      textFr: `<strong>${esc(topSameDiv.player)}</strong> a joué <strong>${topSameDiv.count}</strong> challenges en division <strong>${esc(topSameDiv.div)}</strong>.`,
    });
  }

  // ============================================================
  // 26. Le joueur avec le plus de Top 10 en une saison
  // ============================================================
  const seasonTop10Count = {};
  allResults.forEach(r => {
    const c = getChallengeById(r.challengeId);
    if (!c || !c.season) return;
    if (r.position <= 10) {
      const key = r.playerName + "|" + c.season;
      seasonTop10Count[key] = (seasonTop10Count[key] || 0) + 1;
    }
  });
  const topSeasonTop10 = Object.entries(seasonTop10Count)
    .map(([key, count]) => {
      const [player, season] = key.split("|");
      return { player, season: Number(season), count };
    })
    .sort((a, b) => b.count - a.count)[0];
  if (topSeasonTop10 && topSeasonTop10.count >= 5) {
    facts.push({
      text: `<strong>${esc(topSeasonTop10.player)}</strong> got <strong>${topSeasonTop10.count}</strong> Top 10 finishes in Season ${topSeasonTop10.season}.`,
      textFr: `<strong>${esc(topSeasonTop10.player)}</strong> a obtenu <strong>${topSeasonTop10.count}</strong> Top 10 lors de la saison ${topSeasonTop10.season}.`,
    });
  }

  // ============================================================
  // 27. Le joueur le plus régulier (écart-type faible sur positions)
  // ============================================================
  const regularities = Object.entries(resultsByPlayer)
    .filter(([p, arr]) => arr.length >= 20)
    .map(([player, arr]) => {
      const positions = arr.map(r => r.position);
      const mean = avg(positions);
      const variance = avg(positions.map(p => Math.pow(p - mean, 2)));
      return { player, stdDev: Math.sqrt(variance), mean, plays: positions.length };
    })
    .sort((a, b) => a.stdDev - b.stdDev);
  if (regularities.length && regularities[0].stdDev > 0) {
    const r = regularities[0];
    facts.push({
      text: `<strong>${esc(r.player)}</strong> is the most consistent player: standard deviation of only <strong>${r.stdDev.toFixed(1)}</strong> places (over ${r.plays} challenges).`,
      textFr: `<strong>${esc(r.player)}</strong> est le joueur le plus régulier : écart-type de seulement <strong>${r.stdDev.toFixed(1)}</strong> places (sur ${r.plays} challenges).`,
    });
  }

  // ============================================================
  // 28. Le joueur le plus imprévisible (écart-type élevé)
  // ============================================================
  const unregularities = Object.entries(resultsByPlayer)
    .filter(([p, arr]) => arr.length >= 20)
    .map(([player, arr]) => {
      const positions = arr.map(r => r.position);
      const mean = avg(positions);
      const variance = avg(positions.map(p => Math.pow(p - mean, 2)));
      return { player, stdDev: Math.sqrt(variance), plays: positions.length };
    })
    .sort((a, b) => b.stdDev - a.stdDev);
  if (unregularities.length && unregularities[0].stdDev > 15) {
    const u = unregularities[0];
    facts.push({
      text: `<strong>${esc(u.player)}</strong> is the most unpredictable player: standard deviation of <strong>${u.stdDev.toFixed(1)}</strong> places. You never know what to expect!`,
      textFr: `<strong>${esc(u.player)}</strong> est le joueur le plus imprévisible : écart-type de <strong>${u.stdDev.toFixed(1)}</strong> places. On ne sait jamais à quoi s'attendre !`,
    });
  }

  // ============================================================
  // 29. Le joueur avec la meilleure moyenne (min. 20 challenges)
  // ============================================================
  const bestAvg = Object.entries(playsByPlayer)
    .filter(([p, n]) => n >= 20)
    .map(([p, n]) => ({ player: p, avg: sumPosByPlayer[p] / n, plays: n }))
    .sort((a, b) => a.avg - b.avg)[0];
  if (bestAvg) {
    facts.push({
      text: `<strong>${esc(bestAvg.player)}</strong> has the best average position: <strong>#${bestAvg.avg.toFixed(2)}</strong> over ${bestAvg.plays} challenges.`,
      textFr: `<strong>${esc(bestAvg.player)}</strong> a la meilleure position moyenne : <strong>#${bestAvg.avg.toFixed(2)}</strong> sur ${bestAvg.plays} challenges.`,
    });
  }

  // ============================================================
  // 30. Le joueur avec la pire moyenne (min. 20 challenges)
  // ============================================================
  const worstAvg = Object.entries(playsByPlayer)
    .filter(([p, n]) => n >= 20)
    .map(([p, n]) => ({ player: p, avg: sumPosByPlayer[p] / n, plays: n }))
    .sort((a, b) => b.avg - a.avg)[0];
  if (worstAvg) {
    facts.push({
      text: `Don't give up, <strong>${esc(worstAvg.player)}</strong>! Average position of <strong>#${worstAvg.avg.toFixed(2)}</strong> over ${worstAvg.plays} challenges.`,
      textFr: `Ne lâche pas, <strong>${esc(worstAvg.player)}</strong> ! Position moyenne de <strong>#${worstAvg.avg.toFixed(2)}</strong> sur ${worstAvg.plays} challenges.`,
    });
  }

  // ============================================================
  // 31. Le podium le plus haut (meilleur score du #2)
  // ============================================================
  let bestSecond = { score: 0 };
  for (const [cid, results] of Object.entries(byChallenge)) {
    const sorted = [...results].sort((a, b) => b.score - a.score);
    if (sorted.length >= 2 && sorted[1].score > bestSecond.score) {
      bestSecond = { score: sorted[1].score, player: sorted[1].playerName, table: getChallengeById(cid)?.table };
    }
  }
  if (bestSecond.score > 0) {
    facts.push({
      text: `Best score ever for a 2nd place: <strong>${fmtScore(bestSecond.score)}</strong> by <strong>${esc(bestSecond.player)}</strong> on <strong>${esc(bestSecond.table)}</strong>. Tough luck!`,
      textFr: `Meilleur score jamais réalisé pour une 2ème place : <strong>${fmtScore(bestSecond.score)}</strong> par <strong>${esc(bestSecond.player)}</strong> sur <strong>${esc(bestSecond.table)}</strong>. Pas de chance !`,
    });
  }

  // ============================================================
  // 32. Nombre total de saisons archivées
  // ============================================================
  const seasonCount = Object.keys(DB.standings).length;
  if (seasonCount >= 5) {
    facts.push({
      text: `WoVP Stats now covers <strong>${seasonCount}</strong> archived seasons.`,
      textFr: `WoVP Stats couvre maintenant <strong>${seasonCount}</strong> saisons archivées.`,
    });
  }

  // ============================================================
  // 33. Le premier champion (Season la plus ancienne)
  // ============================================================
  const oldestSeason = Object.keys(DB.standings).map(Number).sort((a, b) => a - b)[0];
  if (oldestSeason) {
    const data = DB.standings[oldestSeason];
    const topDiv = [...(data.divisions || [])].sort((a, b) => getDivisionLevel(a.name) - getDivisionLevel(b.name))[0];
    const firstChampion = topDiv?.standings?.find(s => s.position === 1);
    if (firstChampion) {
      facts.push({
        text: `The first recorded champion was <strong>${esc(firstChampion.playerName)}</strong> (Season ${oldestSeason}, ${esc(topDiv.name)}).`,
        textFr: `Le premier champion enregistré était <strong>${esc(firstChampion.playerName)}</strong> (Saison ${oldestSeason}, ${esc(topDiv.name)}).`,
      });
    }
  }

  // ============================================================
  // 34. Le joueur qui a joué le plus de tables différentes
  // ============================================================
  const tablesByPlayer = {};
  allResults.forEach(r => {
    const c = getChallengeById(r.challengeId);
    if (!c) return;
    if (!tablesByPlayer[r.playerName]) tablesByPlayer[r.playerName] = new Set();
    tablesByPlayer[r.playerName].add(c.table);
  });
  const topTablesPlayer = Object.entries(tablesByPlayer)
    .map(([p, s]) => ({ player: p, count: s.size }))
    .sort((a, b) => b.count - a.count)[0];
  if (topTablesPlayer && topTablesPlayer.count >= 30) {
    facts.push({
      text: `<strong>${esc(topTablesPlayer.player)}</strong> has played on <strong>${topTablesPlayer.count}</strong> different tables. The explorer!`,
      textFr: `<strong>${esc(topTablesPlayer.player)}</strong> a joué sur <strong>${topTablesPlayer.count}</strong> tables différentes. L'explorateur !`,
    });
  }

  // ============================================================
  // 35. Le joueur le plus "connecté" (le plus de rivaux différents)
  // ============================================================
  // Nécessite trop de calculs, on skip pour l'instant

  // ============================================================
  // 36. Nombre de contributeurs
  // ============================================================
  const contributors = Object.values(DB.players).filter(p => p.contributor).length;
  if (contributors >= 5) {
    facts.push({
      text: `WoVP Stats is supported by <strong>${contributors}</strong> contributors who help submit scores and data.`,
      textFr: `WoVP Stats est soutenu par <strong>${contributors}</strong> contributeurs qui aident à soumettre les scores et les données.`,
    });
  }

  // ============================================================
  // 37. Le plus grand nombre de challenges joués par un joueur sur une seule table
  // ============================================================
  const playerTableCount = {};
  allResults.forEach(r => {
    const c = getChallengeById(r.challengeId);
    if (!c) return;
    const key = r.playerName + "|" + c.table;
    playerTableCount[key] = (playerTableCount[key] || 0) + 1;
  });
  const topPlayerTable = Object.entries(playerTableCount)
    .map(([key, count]) => {
      const [player, table] = key.split("|");
      return { player, table, count };
    })
    .sort((a, b) => b.count - a.count)[0];
  if (topPlayerTable && topPlayerTable.count >= 5) {
    facts.push({
      text: `<strong>${esc(topPlayerTable.player)}</strong> has played <strong>${esc(topPlayerTable.table)}</strong> <strong>${topPlayerTable.count}</strong> times. A true specialist!`,
      textFr: `<strong>${esc(topPlayerTable.player)}</strong> a joué <strong>${esc(topPlayerTable.table)}</strong> <strong>${topPlayerTable.count}</strong> fois. Un vrai spécialiste !`,
    });
  }

  // ============================================================
  // 38. Première victoire (plus ancien challenge)
  // ============================================================
  const oldestChallenge = sortedChallenges[0];
  if (oldestChallenge) {
    const firstWinner = getResultsForChallenge(oldestChallenge.id).find(r => r.position === 1);
    if (firstWinner) {
      facts.push({
        text: `The first archived challenge was <strong>${esc(oldestChallenge.table)}</strong>, won by <strong>${esc(firstWinner.playerName)}</strong>.`,
        textFr: `Le premier challenge archivé était <strong>${esc(oldestChallenge.table)}</strong>, remporté par <strong>${esc(firstWinner.playerName)}</strong>.`,
      });
    }
  }

  // ============================================================
  // 39. Ratio podium/participation moyen (site-wide)
  // ============================================================
  if (allResults.length >= 1000) {
    const totalPodiums = Object.values(podiumsByPlayer).reduce((a, b) => a + b, 0);
    const podiumRate = (totalPodiums / allResults.length) * 100;
    facts.push({
      text: `Only <strong>${podiumRate.toFixed(1)}%</strong> of all recorded results are podium finishes. Elite company!`,
      textFr: `Seulement <strong>${podiumRate.toFixed(1)}%</strong> de tous les résultats enregistrés sont des podiums. Compagnie d'élite !`,
    });
  }

  // ============================================================
  // 40. Le joueur avec le plus de victoires dans la même saison
  // ============================================================
  // Déjà #22, on skip

  // ============================================================
  // 41. Le podium avec le plus grand nombre de pays différents
  // ============================================================
  let mostCountriesPodium = { count: 0 };
  for (const [cid, results] of Object.entries(byChallenge)) {
    const sorted = [...results].sort((a, b) => a.position - b.position).slice(0, 3);
    const countriesInPodium = new Set();
    sorted.forEach(r => {
      const cc = getPlayerInfo(r.playerName).country;
      if (cc) countriesInPodium.add(cc);
    });
    if (countriesInPodium.size > mostCountriesPodium.count) {
      mostCountriesPodium = { count: countriesInPodium.size, table: getChallengeById(cid)?.table, countries: [...countriesInPodium] };
    }
  }
  if (mostCountriesPodium.count >= 3) {
    facts.push({
      text: `Most international podium ever: <strong>${mostCountriesPodium.count}</strong> different countries on the podium of <strong>${esc(mostCountriesPodium.table)}</strong>.`,
      textFr: `Podium le plus international de tous les temps : <strong>${mostCountriesPodium.count}</strong> pays différents sur le podium de <strong>${esc(mostCountriesPodium.table)}</strong>.`,
    });
  }

  // ============================================================
  // 42. Le joueur avec le plus de 1ères places dans la même table
  // ============================================================
  const playerTableWins = {};
  allResults.forEach(r => {
    if (r.position === 1) {
      const c = getChallengeById(r.challengeId);
      if (!c) return;
      const key = r.playerName + "|" + c.table;
      playerTableWins[key] = (playerTableWins[key] || 0) + 1;
    }
  });
  const topTableWins = Object.entries(playerTableWins)
    .map(([key, count]) => {
      const [player, table] = key.split("|");
      return { player, table, count };
    })
    .sort((a, b) => b.count - a.count)[0];
  if (topTableWins && topTableWins.count >= 2) {
    facts.push({
      text: `<strong>${esc(topTableWins.player)}</strong> won <strong>${esc(topTableWins.table)}</strong> <strong>${topTableWins.count}</strong> times. Table domination!`,
      textFr: `<strong>${esc(topTableWins.player)}</strong> a remporté <strong>${esc(topTableWins.table)}</strong> <strong>${topTableWins.count}</strong> fois. Domination !`,
    });
  }

  // ============================================================
  // 43. Nombre total de joueurs dans la base
  // ============================================================
  const totalPlayers = Object.keys(DB.players).length;
  if (totalPlayers >= 100) {
    facts.push({
      text: `WoVP Stats tracks <strong>${totalPlayers}</strong> players across all divisions and seasons.`,
      textFr: `WoVP Stats suit <strong>${totalPlayers}</strong> joueurs à travers toutes les divisions et saisons.`,
    });
  }

  // ============================================================
  // 44. Le joueur avec le meilleur score sur une seule table
  // ============================================================
  const tableBestScores = {};
  allResults.forEach(r => {
    const c = getChallengeById(r.challengeId);
    if (!c || r.score <= 0) return;
    if (!tableBestScores[c.table] || r.score > tableBestScores[c.table].score) {
      tableBestScores[c.table] = { player: r.playerName, score: r.score };
    }
  });
  // (Pas assez intéressant seul, on skip)

  // ============================================================
  // 45. Le plus jeune podium (le plus grand nombre de nouveaux joueurs sur un podium)
  // ============================================================
  // Trop complexe, on skip

  return facts;
}

function getRandomFunFact() {
  if (!window.__funFacts) window.__funFacts = computeFunFacts();
  if (!window.__funFacts.length) return null;
  return window.__funFacts[Math.floor(Math.random() * window.__funFacts.length)];
}

/* ============================================================
   LOAD DATA
   ============================================================ */
async function loadData() {
  try {
    const [players, challenges, results, standings, tableImages] = await Promise.all([
      fetch(APP.dataPath + DATA_FILES.players).then(r => r.ok ? r.json() : {}),
      fetch(APP.dataPath + DATA_FILES.challenges).then(r => r.ok ? r.json() : []),
      fetch(APP.dataPath + DATA_FILES.results).then(r => r.ok ? r.json() : []),
      fetch(APP.dataPath + DATA_FILES.standings).then(r => r.ok ? r.json() : {}),
      fetch(APP.dataPath + DATA_FILES.tableImages).then(r => r.ok ? r.json() : {}),
    ]);
    DB.players = players || {};
    DB.challenges = Array.isArray(challenges) ? challenges : [];
    DB.results = Array.isArray(results) ? results : [];
    DB.standings = standings || {};
    DB.tableImages = tableImages || {};
    DB.loaded = true;
    return true;
  } catch (err) {
    console.error("[WoVP Stats] Failed to load data:", err);
    return false;
  }
}

/* ============================================================
   STATE
   ============================================================ */
const state = {
  currentView: "overview",
  currentItem: "overview.home",
  tableName: null,
  playerName: null,
  countryCc: null,
  seasonNumber: null,
  seasonTab: "challenges",
  metric: "participants",
  tablesSort: "occurrences",
  tablesFilter: "all",
  playersSort: "wins",
  playersCountryFilter: "all",
  tableLeaderboardSort: "avg",
  tableLeaderboardShowAll: false,
  tableTopScoresShowAll: false,
  tableOccurrencesShowAll: false,
  playerTablesSort: "avg",
  playerTablesShowAll: false,
  playerResultsSort: "dateDesc",
  playerResultsShowAll: false,
  playerTopScoresShowAll: false,
  playerTopPositionsShowAll: false,
  countrySort: "wins",
  countryShowAll: false,
  standingsDivision: null,
  standingsShowUnranked: false,
  h2hP1: null, h2hP2: null, h2hShowAll: false,
};

function loadPrefs() {
  try {
    const m = localStorage.getItem("wovp.metric"); if (m) state.metric = m;
    const lang = localStorage.getItem("wovp.lang"); if (lang && I18N[lang]) LANG = lang;
    const ts = localStorage.getItem("wovp.tablesSort"); if (ts) state.tablesSort = ts;
    const tf = localStorage.getItem("wovp.tablesFilter"); if (tf) state.tablesFilter = tf;
    const ps = localStorage.getItem("wovp.playersSort"); if (ps) state.playersSort = ps;
  } catch (e) {}
}
function saveMetric(m) { state.metric = m; try { localStorage.setItem("wovp.metric", m); } catch (e) {} }
function saveTablesSort(s) { state.tablesSort = s; try { localStorage.setItem("wovp.tablesSort", s); } catch (e) {} }
function saveTablesFilter(f) { state.tablesFilter = f; try { localStorage.setItem("wovp.tablesFilter", f); } catch (e) {} }
function savePlayersSort(s) { state.playersSort = s; try { localStorage.setItem("wovp.playersSort", s); } catch (e) {} }

/* ============================================================
   NAV
   ============================================================ */
const NAV_GROUPS = [
  { id: "overview", icon: "📊", key: "nav.overview", items: [
    { id: "overview.home", key: "nav.overview.home" },
  ]},
  { id: "players", icon: "👤", key: "nav.players", items: [
    { id: "players.all", key: "nav.players.all" },
  ]},
  { id: "tables", icon: "🎯", key: "nav.tables", items: [
    { id: "tables.all", key: "nav.tables.all" },
    { id: "tables.bySeason", key: "nav.tables.bySeason" },
  ]},
  { id: "seasons", icon: "📅", key: "nav.seasons", items: [
    { id: "seasons.all", key: "nav.seasons.all" },
  ]},
  { id: "compare", icon: "⚔️", key: "nav.compare", items: [
    { id: "compare.h2h", key: "nav.compare.h2h" },
  ]},
  { id: "world", icon: "🌍", key: "nav.world", items: [
    { id: "world.countries", key: "nav.world.countries" },
  ]},
  { id: "records", icon: "🏆", key: "nav.records", items: [
    { id: "records.all", key: "nav.records.all" },
  ]},
];

let openGroups = new Set(["tables"]);

function renderNav() {
  const nav = document.getElementById("sidebarNav");
  if (!nav) return;
  nav.innerHTML = NAV_GROUPS.map(group => {
    const isOpen = openGroups.has(group.id);
    const isActive = state.currentItem.startsWith(group.id + ".");
    return `
      <div class="nav-group ${isOpen ? "open" : ""}">
        <div class="nav-group-header ${isActive ? "active" : ""}" onclick="toggleGroup('${group.id}')">
          <span class="icon">${group.icon}</span>
          <span>${t(group.key)}</span>
          <span class="caret">▶</span>
        </div>
        <div class="nav-subitems">
          ${group.items.map(item => `
  <button class="nav-subitem ${state.currentItem === item.id ? "active" : ""}" 
          onclick="handleNavClick(event, '${item.id}');">${t(item.key)}</button>
`).join("")}
        </div>
      </div>
    `;
  }).join("");
}

function toggleGroup(id) {
  if (openGroups.has(id)) openGroups.delete(id); else openGroups.add(id);
  renderNav();
}
/* Mobile menu (overlay) */
function toggleMobileMenu() {
  document.body.classList.toggle("menu-open");
}

function closeMobileMenu() {
  document.body.classList.remove("menu-open");
}
/* Gestionnaire de clic pour la navigation (mobile + desktop) */
function handleNavClick(event, itemId) {
  event.preventDefault();
  event.stopPropagation();
  goToItem(itemId);
  document.body.classList.remove("menu-open");
}

function goToItem(itemId) {
  state.currentItem = itemId;
  const [group, action] = itemId.split(".");
  if (group === "overview") { state.currentView = "overview"; renderNav(); renderOverview(); }
  else if (group === "players" && action === "all") { state.currentView = "players"; state.playerName = null; renderNav(); renderPlayersList(); }
  else if (group === "tables" && action === "all") { state.currentView = "tables"; state.tableName = null; renderNav(); renderTablesList(); }
  else if (group === "tables" && action === "bySeason") { state.currentView = "tablesBySeason"; state.seasonNumber = null; renderNav(); renderSeasonsListForTables(); }
  else if (group === "seasons" && action === "all") { state.currentView = "seasons"; state.seasonNumber = null; renderNav(); renderSeasonsGrid(); }
  else if (group === "world" && action === "countries") { state.currentView = "countries"; state.countryCc = null; renderNav(); renderCountries(); }
  else if (group === "records" && action === "all") { state.currentView = "records"; renderNav(); renderRecords(); }
  else if (group === "compare" && action === "h2h") { state.currentView = "h2h"; renderNav(); renderH2H(); }
}

function navigateToTable(tableName) {
  state.currentView = "tables"; state.tableName = tableName; state.currentItem = "tables.all";
  state.tableLeaderboardShowAll = false; state.tableTopScoresShowAll = false;
  state.tableOccurrencesShowAll = false;
  renderNav(); showTable(tableName);
}
function navigateToPlayer(name) {
  state.currentView = "players"; state.playerName = name; state.currentItem = "players.all";
  state.playerTablesShowAll = false; state.playerResultsShowAll = false;
  state.playerTopScoresShowAll = false; state.playerTopPositionsShowAll = false;
  renderNav(); showPlayer(name);
}
function navigateToCountry(cc) {
  state.currentView = "countries"; state.countryCc = cc; state.currentItem = "world.countries";
  state.countryShowAll = false;
  renderNav(); showCountry(cc);
}
function navigateToSeasonFromTables(seasonNum) {
  state.currentView = "tablesBySeason"; state.seasonNumber = seasonNum;
  state.currentItem = "tables.bySeason";
  renderNav(); renderSeasonDetailForTables(seasonNum);
}
function navigateToSeasonStandings(seasonNum) {
  state.currentView = "seasons"; state.seasonNumber = seasonNum;
  state.currentItem = "seasons.all";
  state.seasonTab = "standings";
  state.standingsDivision = null;
  state.standingsShowUnranked = false;
  renderNav(); renderSeasonStandingsDetail(seasonNum);
}

function setLang(l) {
  if (!I18N[l]) return;
  LANG = l;
  try { localStorage.setItem("wovp.lang", l); } catch (e) {}
  renderNav();
  if (state.currentView === "overview") renderOverview();
  else if (state.currentView === "players") state.playerName ? showPlayer(state.playerName) : renderPlayersList();
  else if (state.currentView === "tables") state.tableName ? showTable(state.tableName) : renderTablesList();
  else if (state.currentView === "tablesBySeason") state.seasonNumber ? renderSeasonDetailForTables(state.seasonNumber) : renderSeasonsListForTables();
  else if (state.currentView === "seasons") state.seasonNumber ? renderSeasonStandingsDetail(state.seasonNumber) : renderSeasonsGrid();
  else if (state.currentView === "countries") state.countryCc ? showCountry(state.countryCc) : renderCountries();
  else if (state.currentView === "records") renderRecords();
  else if (state.currentView === "h2h") renderH2H();
}

function setPageTitle(key) { const el = document.getElementById("pageTitle"); if (el) el.textContent = t(key); }
function updateDbStats() {
  const el = document.getElementById("dbStats");
  if (!el) return;
  const players = Object.keys(DB.players).length;
  const challenges = DB.challenges.length;
  const results = DB.results.length;
  el.textContent = `${players} ${t(players > 1 ? "playersCount" : "playerCount")} · ${challenges} ${t(challenges > 1 ? "challengesCount" : "challenge")} · ${results} ${t("resultsCount")}`;
}
function setContent(html) { const el = document.getElementById("content"); if (el) el.innerHTML = html; }

function renderShowAllToggle(currentCount, totalCount, stateKey, callbackName) {
  if (totalCount <= currentCount) return "";
  const isExpanded = state[stateKey];
  const label = isExpanded ? "▲ " + t("showLess") : `▼ ${t("showAll")} (+${totalCount - currentCount})`;
  return `<div class="show-all-toggle" onclick="${callbackName}()">${label}</div>`;
}

/* ============================================================
   SVG CHARTS
   ============================================================ */
function svgLineChart(data, opts) {
  opts = opts || {};
  const width = 760, height = 240;
  const pad = { top: 26, right: 24, bottom: 36, left: 52 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  if (!data.length) return `<p class="empty">${esc(opts.emptyLabel || t("noData"))}</p>`;
  const values = data.map(d => d.value);
  const minV = Math.min(...values), maxV = Math.max(...values);
  const range = maxV - minV || 1;
  const padRange = range * 0.15;
  const yMin = Math.max(0, minV - padRange), yMax = maxV + padRange;
  const xStep = data.length > 1 ? innerW / (data.length - 1) : 0;
  const xScale = i => pad.left + i * xStep;
  const yScale = opts.invertY
    ? v => pad.top + ((v - yMin) / (yMax - yMin)) * innerH
    : v => pad.top + innerH - ((v - yMin) / (yMax - yMin)) * innerH;
  let svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
  for (let i = 0; i <= 4; i++) {
    const v = yMin + (yMax - yMin) * i / 4;
    const y = yScale(v);
    svg += `<line x1="${pad.left}" y1="${y}" x2="${width - pad.right}" y2="${y}" stroke="#232733" stroke-width="1"/>`;
    svg += `<text x="${pad.left - 8}" y="${y + 3}" fill="#8b93a3" font-size="10" text-anchor="end" font-family="sans-serif">${opts.yFormatter ? opts.yFormatter(v) : Math.round(v)}</text>`;
  }
  let path = "";
  data.forEach((d, i) => {
    const x = xScale(i), y = yScale(d.value);
    path += (i === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1) + " ";
  });
  svg += `<path d="${path}" fill="none" stroke="#5eead4" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`;
  data.forEach((d, i) => {
    const x = xScale(i), y = yScale(d.value);
    const fill = d.color || "#5eead4";
    svg += `<circle cx="${x}" cy="${y}" r="5" fill="${fill}" stroke="#0f1115" stroke-width="2"/>`;
    svg += `<text x="${x}" y="${height - 12}" fill="#8b93a3" font-size="10" text-anchor="middle" font-family="sans-serif">${esc(d.label)}</text>`;
    if (opts.showValue) {
      svg += `<text x="${x}" y="${y - 10}" fill="${fill}" font-size="10" text-anchor="middle" font-weight="bold" font-family="sans-serif">#${d.value}</text>`;
    }
  });
  svg += `</svg>`;
  return svg;
}

function svgBarChart(data, opts) {
  opts = opts || {};
  const width = 760, height = 240;
  const pad = { top: 26, right: 24, bottom: 36, left: 52 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  if (!data.length) return `<p class="empty">${esc(opts.emptyLabel || t("noData"))}</p>`;
  const maxV = Math.max(...data.map(d => d.value), 1);
  const barW = (innerW / data.length) * 0.55;
  const slotW = innerW / data.length;
  const offset = (slotW - barW) / 2;
  let svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
  for (let i = 0; i <= 4; i++) {
    const v = maxV * i / 4;
    const y = pad.top + innerH - (v / maxV) * innerH;
    svg += `<line x1="${pad.left}" y1="${y}" x2="${width - pad.right}" y2="${y}" stroke="#232733" stroke-width="1"/>`;
    svg += `<text x="${pad.left - 8}" y="${y + 3}" fill="#8b93a3" font-size="10" text-anchor="end" font-family="sans-serif">${opts.yFormatter ? opts.yFormatter(v) : Math.round(v)}</text>`;
  }
  data.forEach((d, i) => {
    const x = pad.left + i * slotW + offset;
    const h = (d.value / maxV) * innerH;
    const y = pad.top + innerH - h;
    svg += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" fill="#5eead4" rx="6" opacity="0.85"/>`;
    svg += `<text x="${(x + barW / 2).toFixed(1)}" y="${(y - 7).toFixed(1)}" fill="#5eead4" font-size="10" text-anchor="middle" font-weight="bold" font-family="sans-serif">${opts.valueFormatter ? opts.valueFormatter(d.value) : d.value}</text>`;
    svg += `<text x="${(x + barW / 2).toFixed(1)}" y="${height - 12}" fill="#8b93a3" font-size="10" text-anchor="middle" font-family="sans-serif">${esc(d.label)}</text>`;
  });
  svg += `</svg>`;
  return svg;
}

/* ============================================================
   COMBOBOX
   ============================================================ */
let comboboxData = {};

function renderCombobox(id, items, selectedValue, placeholderKey, onSelectName) {
  comboboxData[id] = { items, onSelect: onSelectName, placeholder: t(placeholderKey) };
  const selected = items.find(i => i.value === selectedValue);
  return `
    <div class="combobox" id="${id}" data-combobox="${id}">
      <button type="button" class="combobox-trigger" onclick="toggleCombobox('${id}')">
        <span class="combobox-value">${selected ? esc(selected.label) : esc(t(placeholderKey))}</span>
        <span class="combobox-caret">▼</span>
      </button>
      <div class="combobox-panel" id="${id}-panel">
        <div class="combobox-search-wrap">
          <input type="text" class="combobox-search" placeholder="${esc(t("searchPlayer"))}"
                 oninput="filterCombobox('${id}', this.value)"
                 onkeydown="handleComboboxKey(event, '${id}')">
        </div>
        <div class="combobox-list" id="${id}-list">
          ${items.map(item => `
            <div class="combobox-item ${item.value === selectedValue ? "selected" : ""}"
                 data-value="${esc(item.value)}"
                 onclick="selectComboboxItem('${id}', '${esc(item.value).replace(/'/g, "\\'")}')">
              <span class="combobox-item-label">${esc(item.label)}</span>
              ${item.sublabel ? `<span class="combobox-item-sub">${esc(item.sublabel)}</span>` : ""}
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

function toggleCombobox(id) {
  const cb = document.getElementById(id);
  if (!cb) return;
  const isOpen = cb.classList.contains("open");
  document.querySelectorAll(".combobox.open").forEach(el => { if (el.id !== id) el.classList.remove("open"); });
  cb.classList.toggle("open", !isOpen);
  if (!isOpen) {
    const search = cb.querySelector(".combobox-search");
    if (search) { search.value = ""; filterCombobox(id, ""); setTimeout(() => search.focus(), 20); }
  }
}
function filterCombobox(id, query) {
  const cb = document.getElementById(id);
  if (!cb) return;
  const q = query.trim().toLowerCase();
  const items = cb.querySelectorAll(".combobox-item");
  items.forEach(item => {
    const label = item.querySelector(".combobox-item-label").textContent.toLowerCase();
    item.style.display = (!q || label.includes(q)) ? "" : "none";
    item.classList.remove("highlighted");
  });
  const firstVisible = [...items].find(el => el.style.display !== "none");
  if (firstVisible) firstVisible.classList.add("highlighted");
}
function selectComboboxItem(id, value) {
  const data = comboboxData[id];
  if (!data) return;
  const cb = document.getElementById(id);
  if (cb) cb.classList.remove("open");
  let fn = data.onSelect;
  if (typeof fn === "string") fn = window[fn];
  if (typeof fn === "function") fn(value);
  else console.warn("[WoVP Stats] onSelect introuvable pour", id, data.onSelect);
}
function handleComboboxKey(event, id) {
  if (event.key === "Escape") { document.getElementById(id)?.classList.remove("open"); return; }
  if (event.key === "Enter") {
    const highlighted = document.querySelector(`#${id} .combobox-item.highlighted`);
    if (highlighted) selectComboboxItem(id, highlighted.getAttribute("data-value"));
    return;
  }
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    const items = [...document.querySelectorAll(`#${id} .combobox-item`)].filter(el => el.style.display !== "none");
    if (!items.length) return;
    const current = items.findIndex(el => el.classList.contains("highlighted"));
    const next = event.key === "ArrowDown" ? (current + 1) % items.length : (current - 1 + items.length) % items.length;
    items.forEach(el => el.classList.remove("highlighted"));
    items[next].classList.add("highlighted");
    items[next].scrollIntoView({ block: "nearest" });
  }
}
document.addEventListener("click", (e) => {
  if (!e.target.closest(".combobox")) {
    document.querySelectorAll(".combobox.open").forEach(el => el.classList.remove("open"));
  }
});
function updateComboboxLabel(id, value) {
  const cb = document.getElementById(id);
  if (!cb) return;
  const data = comboboxData[id];
  if (!data) return;
  const item = data.items.find(i => i.value === value);
  const valueEl = cb.querySelector(".combobox-value");
  if (valueEl && item) valueEl.textContent = item.label;
  cb.querySelectorAll(".combobox-item").forEach(el => {
    el.classList.toggle("selected", el.getAttribute("data-value") === value);
  });
}

/* ============================================================
   VIEW: OVERVIEW (avec fun fact)
   ============================================================ */
function renderOverview() {
  setPageTitle("page.overview");
  state.currentView = "overview";

  const uniquePlayers = new Set(DB.results.map(r => r.playerName)).size;
  const uniqueTables = new Set(DB.challenges.map(c => c.table)).size;
  const regularCount = DB.challenges.filter(c => !isTournament(c)).length;
  const tournCount = DB.challenges.filter(c => isTournament(c)).length;
  const seasonsCount = Object.keys(DB.standings).length;

  const winsByPlayer = {};
  DB.results.forEach(r => { if (r.position === 1) winsByPlayer[r.playerName] = (winsByPlayer[r.playerName] || 0) + 1; });
  const topWins = Object.entries(winsByPlayer).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const podiumByPlayer = {};
  DB.results.forEach(r => { if (r.position <= 3) podiumByPlayer[r.playerName] = (podiumByPlayer[r.playerName] || 0) + 1; });
  const topPodiums = Object.entries(podiumByPlayer).sort((a, b) => b[1] - a[1]).slice(0, 5);

  let html = `
    <div class="stat-grid" style="grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));">
      <div class="stat-box"><div class="stat-value">${uniquePlayers}</div><div class="stat-label">${t("playersCount")}</div></div>
      <div class="stat-box"><div class="stat-value">${uniqueTables}</div><div class="stat-label">${t("tablesCount")}</div></div>
      <div class="stat-box"><div class="stat-value">${seasonsCount}</div><div class="stat-label">${t("seasonsCount")}</div></div>
      <div class="stat-box"><div class="stat-value">${regularCount + tournCount}</div><div class="stat-label">${t("challengesCount")}</div></div>
      <div class="stat-box"><div class="stat-value">${DB.results.length}</div><div class="stat-label">${t("resultsCount")}</div></div>
    </div>
  `;

  // Fun fact
  const fact = getRandomFunFact();
  if (fact) {
    const text = LANG === "fr" ? fact.textFr : fact.text;
    html += `<div class="fun-fact-card">
      <div class="fun-fact-label">💡 ${t("didYouKnow")}</div>
      <div class="fun-fact-text">${text}</div>
    </div>`;
  }

  html += `<div style="display:grid; grid-template-columns:1fr 1fr; gap:18px;">`;
  html += `<div class="card"><div class="card-title"><strong>🏆 ${t("wins")}</strong></div>`;
  topWins.forEach(([name, count], i) => {
    const info = getPlayerInfo(name);
    const rankClass = i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "";
    html += `<div class="result-row">
      <div class="rank ${rankClass}">${i + 1}</div>
      <span class="flag">${countryFlag(info.country)}</span>
      <div class="player-name" onclick="navigateToPlayer('${esc(name).replace(/'/g, "\\'")}')">${esc(name)}</div>
      <div style="color:var(--accent); font-weight:700; font-size:13px;">${count}</div>
    </div>`;
  });
  html += `</div>`;

  html += `<div class="card"><div class="card-title"><strong>🥇 ${t("podiums")}</strong></div>`;
  topPodiums.forEach(([name, count], i) => {
    const info = getPlayerInfo(name);
    const rankClass = i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "";
    html += `<div class="result-row">
      <div class="rank ${rankClass}">${i + 1}</div>
      <span class="flag">${countryFlag(info.country)}</span>
      <div class="player-name" onclick="navigateToPlayer('${esc(name).replace(/'/g, "\\'")}')">${esc(name)}</div>
      <div style="color:var(--accent); font-weight:700; font-size:13px;">${count}</div>
    </div>`;
  });
  html += `</div></div>`;

  const latest = [...DB.challenges].sort((a, b) => (b.date || "").localeCompare(a.date || ""))[0];
  if (latest) {
    const latestResults = getResultsForChallenge(latest.id).sort((a, b) => a.position - b.position);
    html += `<div class="section-title">${t("recentResults")}</div>`;
    html += `<div class="occurrence">
      <div class="occurrence-header">
        <div class="occurrence-title">${esc(latest.table)}<small>${isTournament(latest) ? t("tournament") : t("season") + " " + latest.season + " · " + t("week") + " " + latest.week} · ${esc(latest.date || "")}</small></div>
        <span class="badge platform">${latest.resultCount || latestResults.length} ${t("participants")}</span>
      </div>
      <div class="occurrence-body">`;
    latestResults.slice(0, 3).forEach((r, i) => {
      const info = getPlayerInfo(r.playerName);
      const medals = ["🥇", "🥈", "🥉"];
      html += `<div class="result-row">
        <div class="rank medal">${medals[i]}</div>
        <span class="flag">${countryFlag(info.country)}</span>
        <div class="player-name" onclick="navigateToPlayer('${esc(r.playerName).replace(/'/g, "\\'")}')">${esc(r.playerName)}</div>
        <div class="score-value">${fmtScore(r.score)}</div>
      </div>`;
    });
    html += `</div></div>`;
  }
  setContent(html);
}

/* ============================================================
   VIEW: TABLES LIST
   ============================================================ */
function renderTablesList() {
  setPageTitle("page.tables");
  state.currentView = "tables";
  state.tableName = null;

  const byTable = {};
  DB.challenges.forEach(c => {
    if (!byTable[c.table]) byTable[c.table] = [];
    byTable[c.table].push(c);
  });

  const tablesInfo = Object.keys(byTable).map(name => {
    const chals = byTable[name];
    const hasTournament = chals.some(c => isTournament(c));
    const hasRegular = chals.some(c => !isTournament(c));
    const lastPlayed = chals.map(c => c.date).filter(Boolean).sort().pop();
    const firstPlayed = chals.map(c => c.date).filter(Boolean).sort()[0];
    const totalResults = chals.reduce((s, c) => s + (c.resultCount || 0), 0);
    let typeLabel;
    if (hasRegular && hasTournament) typeLabel = t("filter.mixed");
    else if (hasTournament) typeLabel = t("tournament");
    else typeLabel = t("season");
    return { name, chals, hasTournament, hasRegular, lastPlayed, firstPlayed, totalResults, typeLabel };
  });

  let filtered = tablesInfo;
  if (state.tablesFilter === "season") filtered = tablesInfo.filter(x => x.hasRegular && !x.hasTournament);
  else if (state.tablesFilter === "tournament") filtered = tablesInfo.filter(x => x.hasTournament && !x.hasRegular);
  else if (state.tablesFilter === "mixed") filtered = tablesInfo.filter(x => x.hasRegular && x.hasTournament);

  const sorters = {
    occurrences: (a, b) => b.chals.length - a.chals.length || a.name.localeCompare(b.name),
    nameAsc: (a, b) => a.name.localeCompare(b.name),
    nameDesc: (a, b) => b.name.localeCompare(a.name),
    lastPlayed: (a, b) => (b.lastPlayed || "").localeCompare(a.lastPlayed || "") || a.name.localeCompare(b.name),
    firstPlayed: (a, b) => (a.firstPlayed || "").localeCompare(b.firstPlayed || "") || a.name.localeCompare(b.name),
  };
  filtered.sort(sorters[state.tablesSort] || sorters.occurrences);

  const filterOptions = [
    { v: "all", l: t("filter.all") },
    { v: "season", l: t("filter.season") },
    { v: "tournament", l: t("filter.tournament") },
    { v: "mixed", l: t("filter.mixed") },
  ];
  const sortOptions = [
    { v: "occurrences", l: t("sort.occurrences") },
    { v: "nameAsc", l: t("sort.nameAsc") },
    { v: "nameDesc", l: t("sort.nameDesc") },
    { v: "lastPlayed", l: t("sort.lastPlayed") },
    { v: "firstPlayed", l: t("sort.firstPlayed") },
  ];

  let html = `
    <div class="filters-bar">
      <div class="filters-bar-group">
        <span class="filters-bar-label">${t("filter")}</span>
        <select onchange="changeTablesFilter(this.value)">
          ${filterOptions.map(o => `<option value="${o.v}" ${state.tablesFilter === o.v ? "selected" : ""}>${o.l}</option>`).join("")}
        </select>
      </div>
      <div class="filters-bar-group">
        <span class="filters-bar-label">${t("sortBy")}</span>
        <select onchange="changeTablesSort(this.value)">
          ${sortOptions.map(o => `<option value="${o.v}" ${state.tablesSort === o.v ? "selected" : ""}>${o.l}</option>`).join("")}
        </select>
      </div>
      <div class="filters-bar-count">${filtered.length} ${filtered.length > 1 ? t("tablesCount") : t("tableCount")}</div>
    </div>
  `;

  if (!filtered.length) { html += `<p class="empty">${t("noResultsInFilter")}</p>`; setContent(html); return; }

  html += `<div class="table-grid">`;
  filtered.forEach(tbl => {
    const occLabel = tbl.chals.length > 1 ? t("occurrences") : t("occurrence");
    const resLabel = tbl.totalResults > 1 ? t("resultsCount") : t("result");
    html += `
      <div class="table-card" onclick="navigateToTable('${esc(tbl.name).replace(/'/g, "\\'")}')">
        ${tablePlaceholder(tbl.name)}
        <div class="info">
          <div class="name">${esc(tbl.name)}</div>
          <div class="meta">
            <span><strong>${tbl.chals.length}</strong> ${occLabel} · <strong>${tbl.totalResults}</strong> ${resLabel}</span>
            <span>${tbl.typeLabel}</span>
          </div>
        </div>
      </div>
    `;
  });
  html += `</div>`;
  setContent(html);
}

function changeTablesFilter(f) { saveTablesFilter(f); renderTablesList(); }
function changeTablesSort(s) { saveTablesSort(s); renderTablesList(); }

/* ============================================================
   VIEW: TABLE DETAIL
   ============================================================ */
function showTable(tableName) {
  setPageTitle("page.table");
  state.currentView = "tables";
  state.tableName = tableName;

  const challenges = DB.challenges
    .filter(c => c.table === tableName)
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const challengeIds = challenges.map(c => c.id);
  const allResults = DB.results.filter(r => challengeIds.includes(r.challengeId));

  const playerAgg = {};
  allResults.forEach(r => {
    if (!playerAgg[r.playerName]) playerAgg[r.playerName] = { positions: [], wins: 0, podiums: 0, best: Infinity };
    const p = playerAgg[r.playerName];
    p.positions.push(r.position);
    if (r.position === 1) p.wins++;
    if (r.position <= 3) p.podiums++;
    p.best = Math.min(p.best, r.position);
  });

  const allTimeBase = Object.entries(playerAgg).map(([name, s]) => ({
    name, plays: s.positions.length, wins: s.wins, podiums: s.podiums,
    avg: avg(s.positions), best: s.best,
  }));

  const sorters = {
    avg: (a, b) => a.avg - b.avg || b.wins - a.wins,
    wins: (a, b) => b.wins - a.wins || b.podiums - a.podiums || a.avg - b.avg,
    podiums: (a, b) => b.podiums - a.podiums || b.wins - a.wins || a.avg - b.avg,
    plays: (a, b) => b.plays - a.plays || a.avg - b.avg,
    nameAsc: (a, b) => a.name.localeCompare(b.name),
  };
  const allTime = [...allTimeBase].sort(sorters[state.tableLeaderboardSort] || sorters.avg);

  const bestScoreResult = allResults.slice().sort((a, b) => b.score - a.score)[0];
  const bestScoreInfo = bestScoreResult ? getPlayerInfo(bestScoreResult.playerName) : null;
  const uniquePlayers = allTime.length;
  const hasTournament = challenges.some(c => isTournament(c));
  const hasRegular = challenges.some(c => !isTournament(c));

  const occLabel = challenges.length > 1 ? t("occurrences") : t("occurrence");
  const resLabel = allResults.length > 1 ? t("resultsCount") : t("result");
  const playersLabel = uniquePlayers > 1 ? t("playersCount") : t("playerCount");

  let html = `
    <button class="btn" onclick="goToItem('tables.all')" style="margin-bottom:18px;">← ${t("nav.tables.all")}</button>
    <div class="entity-header">
      ${tablePlaceholder(tableName, "lg")}
      <div class="info">
        <h1>${esc(tableName)}</h1>
        <div class="subtitle">
          <span><strong>${challenges.length}</strong> ${occLabel}</span>
          <span><strong>${allResults.length}</strong> ${resLabel}</span>
          <span><strong>${uniquePlayers}</strong> ${playersLabel}</span>
          ${hasTournament && hasRegular ? `<span class="badge tournament">${t("filter.mixed")}</span>` : hasTournament ? `<span class="badge tournament">${t("tournament")}</span>` : ""}
          ${bestScoreInfo ? `<span>🏅 ${t("bestScoreEver")}: <strong>${esc(bestScoreResult.playerName)}</strong> · <span class="score-value" style="font-size:12px;">${fmtScore(bestScoreResult.score)}</span></span>` : ""}
        </div>
      </div>
    </div>
  `;

  if (challenges.length >= 2) html += renderTableChart(challenges);

  const allScoresSorted = [...allResults].sort((a, b) => b.score - a.score);
  const topScoresLimit = 15;
  const topScoresToShow = state.tableTopScoresShowAll ? allScoresSorted : allScoresSorted.slice(0, topScoresLimit);

  html += `<div class="section-title">🏅 ${t("topScores")} <small>${allScoresSorted.length} ${t("resultsCount")}</small></div>`;
  if (!allScoresSorted.length) {
    html += `<p class="empty">${t("noResults")}</p>`;
  } else {
    html += `<div class="card" style="padding:6px 20px;">`;
    topScoresToShow.forEach((r, i) => {
      const info = getPlayerInfo(r.playerName);
      const c = getChallengeById(r.challengeId);
      const rankClass = i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "";
      html += `<div class="result-row">
        <div class="rank ${rankClass}">${i + 1}</div>
        <span class="flag">${countryFlag(info.country)}</span>
        <div class="player-name" onclick="navigateToPlayer('${esc(r.playerName).replace(/'/g, "\\'")}')">${esc(r.playerName)}</div>
        <div class="muted" style="font-size:11.5px; white-space:nowrap;">${sessionLabel(c)}</div>
        <div class="score-value">${fmtScore(r.score)}</div>
      </div>`;
    });
    html += `</div>`;
    html += renderShowAllToggle(topScoresLimit, allScoresSorted.length, "tableTopScoresShowAll", "toggleTableTopScores");
  }

  html += `<div class="section-title">${t("allTimeLeaderboard")}</div>`;
  const leaderboardSortOptions = [
    { v: "avg", l: t("sort.avgPos") },
    { v: "wins", l: t("sort.wins") },
    { v: "podiums", l: t("sort.podiums") },
    { v: "plays", l: t("sort.played") },
    { v: "nameAsc", l: t("sort.nameAsc") },
  ];
  html += `<div class="filters-bar" style="margin-bottom:12px;">
    <div class="filters-bar-group">
      <span class="filters-bar-label">${t("sortBy")}</span>
      <select onchange="changeTableLeaderboardSort(this.value)">
        ${leaderboardSortOptions.map(o => `<option value="${o.v}" ${state.tableLeaderboardSort === o.v ? "selected" : ""}>${o.l}</option>`).join("")}
      </select>
    </div>
    <div class="filters-bar-count">${allTime.length} ${playersLabel}</div>
  </div>`;

  if (!allTime.length) {
    html += `<p class="empty">${t("noResults")}</p>`;
  } else {
    const leaderboardLimit = 20;
    const leaderboardToShow = state.tableLeaderboardShowAll ? allTime : allTime.slice(0, leaderboardLimit);
    html += `<div class="card" style="padding:6px 20px;"><table>
      <thead><tr>
        <th style="width:40px;"></th>
        <th>${t("playerName")}</th>
        <th class="num">${t("playedLabel")}</th>
        <th class="num">${t("wins")}</th>
        <th class="num">${t("podiums")}</th>
        <th class="num">${t("avgPos")}</th>
      </tr></thead><tbody>`;
    leaderboardToShow.forEach((p, i) => {
      const info = getPlayerInfo(p.name);
      const rankClass = i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "";
      html += `<tr>
        <td><span class="rank ${rankClass}">${i + 1}</span></td>
        <td>
          <span class="flag">${countryFlag(info.country)}</span>
          <span class="player-name" onclick="navigateToPlayer('${esc(p.name).replace(/'/g, "\\'")}')">${esc(p.name)}</span>
          ${info.contributor ? `<span class="badge contributor">${t("contributor")}</span>` : ""}
        </td>
        <td class="num">${p.plays}</td>
        <td class="num">${p.wins}</td>
        <td class="num">${p.podiums}</td>
        <td class="num" style="color:var(--accent); font-weight:700;">${p.avg.toFixed(1)}</td>
      </tr>`;
    });
    html += `</tbody></table></div>`;
    html += renderShowAllToggle(leaderboardLimit, allTime.length, "tableLeaderboardShowAll", "toggleTableLeaderboard");
  }

  const occLimit = 10;
  const occToShow = state.tableOccurrencesShowAll ? challenges : challenges.slice(0, occLimit);
  html += `<div class="section-title">${t("allOccurrences")} <small>${challenges.length}</small></div>`;
  occToShow.forEach(c => {
    const results = getResultsForChallenge(c.id).sort((a, b) => a.position - b.position);
    const posCount = {};
    results.forEach(r => { posCount[r.position] = (posCount[r.position] || 0) + 1; });
    const tiePositions = new Set(Object.entries(posCount).filter(([, cnt]) => cnt > 1).map(([p]) => Number(p)));
    const participantsLabel = c.resultCount || results.length;
    const headerTitle = isTournament(c)
      ? `<span class="badge tournament">${t("tournament")}</span>`
      : `${t("season")} ${c.season} · ${t("week")} #${c.week}`;
    html += `
      <div class="occurrence">
        <div class="occurrence-header">
          <div class="occurrence-title">${headerTitle}<small>${esc(c.date || "")}</small></div>
          <span class="badge platform">${participantsLabel} ${t("participants")}</span>
        </div>
        <div class="occurrence-body">
          ${results.slice(0, 5).map((r, i) => {
            const pi = getPlayerInfo(r.playerName);
            const medals = ["🥇", "🥈", "🥉"];
            const isMedal = i < 3;
            const rankClass = i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "";
            const tieBadge = tiePositions.has(r.position) ? `<span class="badge tie">${t("tie")}</span>` : "";
            const rankDisplay = isMedal ? medals[i] : "#" + r.position;
            return `
              <div class="result-row">
                <div class="rank ${isMedal ? "medal" : rankClass}">${rankDisplay}</div>
                <span class="flag">${countryFlag(pi.country)}</span>
                <div class="player-name" onclick="navigateToPlayer('${esc(r.playerName).replace(/'/g, "\\'")}')">${esc(r.playerName)}<span class="badge platform">${esc(r.platform || "")}</span>${tieBadge}</div>
                <div class="score-value">${fmtScore(r.score)}</div>
              </div>
            `;
          }).join("")}
          ${participantsLabel > 5 ? `<div class="muted" style="text-align:center; padding:10px; font-size:12px;">… +${participantsLabel - 5}</div>` : ""}
        </div>
      </div>
    `;
  });
  if (challenges.length > occLimit) {
    html += renderShowAllToggle(occLimit, challenges.length, "tableOccurrencesShowAll", "toggleTableOccurrences");
  }

  setContent(html);
}

function toggleTableTopScores() { state.tableTopScoresShowAll = !state.tableTopScoresShowAll; if (state.tableName) showTable(state.tableName); }
function toggleTableLeaderboard() { state.tableLeaderboardShowAll = !state.tableLeaderboardShowAll; if (state.tableName) showTable(state.tableName); }
function toggleTableOccurrences() { state.tableOccurrencesShowAll = !state.tableOccurrencesShowAll; if (state.tableName) showTable(state.tableName); }
function changeTableLeaderboardSort(s) { state.tableLeaderboardSort = s; if (state.tableName) showTable(state.tableName); }

function renderTableChart(challenges) {
  const sorted = [...challenges].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  const metric = state.metric;
  const data = sorted.map((c, idx) => {
    const results = getResultsForChallenge(c.id);
    const scores = results.map(r => Number(r.score) || 0).sort((a, b) => a - b);
    const best = scores[scores.length - 1] || 0;
    const med = median(scores);
    const third = scores[scores.length - 3] || 0;
    const ratio = med > 0 ? best / med : 0;
    const halfBest = best > 0 ? results.filter(r => r.score >= best * 0.5).length : 0;
    const label = isTournament(c) ? "T" + (idx + 1) : "S" + c.season + "W" + c.week;
    return { label, participants: results.length, bestScore: best, medianScore: med, score3: third, ratio, halfBest };
  });

  let values = [], chartType = "line", formatter = v => v;
  if (metric === "participants") { values = data.map(d => ({ label: d.label, value: d.participants })); chartType = "bar"; formatter = v => Math.round(v); }
  else if (metric === "bestScore") { values = data.map(d => ({ label: d.label, value: d.bestScore })); formatter = fmtBig; }
  else if (metric === "medianScore") { values = data.map(d => ({ label: d.label, value: d.medianScore })); formatter = fmtBig; }
  else if (metric === "score3") { values = data.map(d => ({ label: d.label, value: d.score3 })); formatter = fmtBig; }
  else if (metric === "ratio") { values = data.map(d => ({ label: d.label, value: round(d.ratio, 2) })); formatter = v => v.toFixed(2) + "×"; }
  else if (metric === "halfBest") { values = data.map(d => ({ label: d.label, value: d.halfBest })); chartType = "bar"; formatter = v => Math.round(v); }

  const metrics = [
    { id: "participants", key: "metric.participants" },
    { id: "bestScore", key: "metric.bestScore" },
    { id: "medianScore", key: "metric.medianScore" },
    { id: "score3", key: "metric.score3" },
    { id: "ratio", key: "metric.ratio" },
    { id: "halfBest", key: "metric.halfBest" },
  ];

  const selectHtml = `<select onchange="changeTableMetric(this.value)" aria-label="${t("metric")}">
      ${metrics.map(m => `<option value="${m.id}" ${state.metric === m.id ? "selected" : ""}>${t(m.key)}</option>`).join("")}
    </select>`;

  const chartOpts = { yFormatter: formatter, valueFormatter: formatter, emptyLabel: t("noData") };
  const chartHtml = chartType === "bar" ? svgBarChart(values, chartOpts) : svgLineChart(values, chartOpts);

  return `<div class="section-title">${t("evolution")}</div>
    <div class="chart-container">
      <div class="chart-header">
        <span class="title">${t("metric")}</span>
        ${selectHtml}
      </div>
      ${chartHtml}
    </div>`;
}

function fmtBig(v) {
  if (v >= 1e9) return (v / 1e9).toFixed(1) + "B";
  if (v >= 1e6) return (v / 1e6).toFixed(0) + "M";
  if (v >= 1e3) return (v / 1e3).toFixed(0) + "K";
  return Math.round(v);
}
function changeTableMetric(metric) { saveMetric(metric); if (state.tableName) showTable(state.tableName); }

/* ============================================================
   ↓↓↓ BLOC 2 À COLLER ICI ↓↓↓
   ============================================================ */
/* ============================================================
   VIEW: TABLES → CHALLENGES BY SEASON
   ============================================================ */
function renderSeasonsListForTables() {
  setPageTitle("page.tablesBySeason");
  state.currentView = "tablesBySeason";
  state.seasonNumber = null;

  const seasons = [...new Set(DB.challenges.filter(c => !isTournament(c)).map(c => c.season))].sort((a, b) => b - a);

  let html = `<div class="section-title">${seasons.length} ${t("seasonsCount")} <small>${t("clickSeason")}</small></div>`;
  html += `<div class="season-grid">`;

  seasons.forEach(s => {
    const chals = DB.challenges.filter(c => !isTournament(c) && c.season === s);
    const totalResults = chals.reduce((sum, c) => sum + (c.resultCount || 0), 0);
    const dates = chals.map(c => c.date).filter(Boolean).sort();
    const firstDate = dates[0] || "";
    const lastDate = dates[dates.length - 1] || "";

    html += `
      <div class="season-card" onclick="navigateToSeasonFromTables(${s})">
        <div class="season-card-header">
          <div class="season-card-number">S${s}</div>
          <div class="season-card-name">${t("season")} ${s}</div>
        </div>
        <div class="season-card-meta">
          <span><strong>${chals.length}</strong> ${t("challengesCount")}</span>
          <span><strong>${totalResults}</strong> ${t("resultsCount")}</span>
        </div>
        <div class="season-card-dates">${esc(firstDate)} → ${esc(lastDate)}</div>
      </div>
    `;
  });

  html += `</div>`;
  setContent(html);
}

function renderSeasonDetailForTables(seasonNum) {
  setPageTitle("page.tablesBySeason");
  state.currentView = "tablesBySeason";
  state.seasonNumber = seasonNum;

  const chals = DB.challenges
    .filter(c => !isTournament(c) && c.season === seasonNum)
    .sort((a, b) => (a.week - b.week) || (a.date || "").localeCompare(b.date || ""));
  const totalResults = chals.reduce((sum, c) => sum + (c.resultCount || 0), 0);

  let html = `
    <button class="btn" onclick="goToItem('tables.bySeason')" style="margin-bottom:18px;">← ${t("nav.tables.bySeason")}</button>
    <div class="entity-header">
      <div class="info">
        <h1>${t("season")} ${seasonNum}</h1>
        <div class="subtitle">
          <span><strong>${chals.length}</strong> ${t("challengesCount")}</span>
          <span><strong>${totalResults}</strong> ${t("resultsCount")}</span>
        </div>
      </div>
    </div>
    <div class="card" style="padding:6px 20px;">`;

  chals.forEach(c => {
    const winner = getResultsForChallenge(c.id).sort((a, b) => a.position - b.position)[0];
    const info = winner ? getPlayerInfo(winner.playerName) : null;
    html += `<div class="season-challenge-row">
      <div class="season-challenge-week">W${c.week}</div>
      <div class="season-challenge-table" onclick="navigateToTable('${esc(c.table).replace(/'/g, "\\'")}')">${esc(c.table)}</div>
      ${winner ? `
        <div class="season-challenge-winner" onclick="navigateToPlayer('${esc(winner.playerName).replace(/'/g, "\\'")}')">
          <span class="flag">${countryFlag(info.country)}</span>
          <span>${esc(winner.playerName)}</span>
        </div>
        <div class="season-challenge-score">${fmtScore(winner.score)}</div>
      ` : `<div class="muted">${t("noResults")}</div>`}
    </div>`;
  });

  html += `</div>`;
  setContent(html);
}

/* ============================================================
   VIEW: SEASONS GRID (standings)
   ============================================================ */
function renderSeasonsGrid() {
  setPageTitle("page.seasons");
  state.currentView = "seasons";
  state.seasonNumber = null;

  const seasonNums = Object.keys(DB.standings).map(Number).sort((a, b) => b - a);

  if (!seasonNums.length) {
    setContent(`<p class="empty">${t("noData")}</p>`);
    return;
  }

  let html = `<div class="section-title">${seasonNums.length} ${t("seasonsCount")} <small>${t("clickSeason")}</small></div>`;
  html += `<div class="season-grid">`;

  seasonNums.forEach(s => {
    const data = DB.standings[s];
    const divisions = data.divisions || [];
    const totalPlayers = divisions.reduce((sum, d) => sum + (d.standings || []).length, 0);

    let champion = null;
    if (divisions.length) {
      const topDiv = [...divisions].sort((a, b) => getDivisionLevel(a.name) - getDivisionLevel(b.name))[0];
      if (topDiv && topDiv.standings && topDiv.standings.length) {
        champion = topDiv.standings[0];
      }
    }
    const champInfo = champion ? getPlayerInfo(champion.playerName) : null;

    html += `
      <div class="season-card" onclick="navigateToSeasonStandings(${s})">
        <div class="season-card-header">
          <div class="season-card-number">S${s}</div>
          <div class="season-card-name">${esc(data.name || ("Season " + s))}</div>
        </div>
        <div class="season-card-meta">
          <span><strong>${divisions.length}</strong> ${t("divisionsCount")}</span>
          <span><strong>${totalPlayers}</strong> ${t("playersCount")}</span>
        </div>
        <div class="season-card-dates">${esc(data.startDate || "")} → ${esc(data.endDate || "")}</div>
        ${champion ? `
          <div class="season-card-champion">
            🏆 <span class="flag">${countryFlag(champInfo.country)}</span>
            <strong>${esc(champion.playerName)}</strong>
          </div>
        ` : ""}
      </div>
    `;
  });

  html += `</div>`;
  setContent(html);
}

function renderSeasonStandingsDetail(seasonNum) {
  setPageTitle("page.season");
  state.currentView = "seasons";
  state.seasonNumber = seasonNum;

  const data = DB.standings[seasonNum];
  if (!data) { setContent(`<p class="empty">${t("noData")}</p>`); return; }

  const divisions = data.divisions || [];
  if (!state.standingsDivision && divisions.length) state.standingsDivision = divisions[0].name;

  const currentDiv = divisions.find(d => d.name === state.standingsDivision) || divisions[0];

  let html = `
    <button class="btn" onclick="goToItem('seasons.all')" style="margin-bottom:18px;">← ${t("nav.seasons.all")}</button>
    <div class="entity-header">
      <div class="info">
        <h1>${t("season")} ${seasonNum}</h1>
        <div class="subtitle">
          <span>${esc(data.startDate || "")} → ${esc(data.endDate || "")}</span>
          <span><strong>${divisions.length}</strong> ${t("divisionsCount")}</span>
        </div>
      </div>
    </div>
  `;

  html += `<div class="division-tabs">`;
  divisions.forEach(d => {
    const isActive = d.name === state.standingsDivision;
    const count = (d.standings || []).length;
    html += `<button class="division-tab ${isActive ? "active" : ""}"
                     onclick="setStandingsDivision('${esc(d.name).replace(/'/g, "\\'")}')"
                     style="${isActive ? `border-color: ${getDivisionColor(d.name)}; color: ${getDivisionColor(d.name)};` : ''}">
      ${esc(d.name)} <span class="muted">(${count})</span>
    </button>`;
  });
  html += `</div>`;

  if (currentDiv) {
    const standings = currentDiv.standings || [];
    const ranked = standings.filter(s => !s.unranked);
    const unranked = standings.filter(s => s.unranked);

    html += `<div class="card" style="padding:8px 20px;">`;
    html += `<table>
      <thead><tr>
        <th style="width:60px;">${t("rank")}</th>
        <th>${t("playerName")}</th>
        <th class="num">${t("points")}</th>
      </tr></thead><tbody>`;

    ranked.forEach(s => {
      const info = getPlayerInfo(s.playerName);
      const rankClass = s.position === 1 ? "gold" : s.position === 2 ? "silver" : s.position === 3 ? "bronze" : "";
      html += `<tr>
        <td><span class="rank ${rankClass}">${s.position}</span></td>
        <td>
          <span class="flag">${countryFlag(info.country)}</span>
          <span class="player-name" onclick="navigateToPlayer('${esc(s.playerName).replace(/'/g, "\\'")}')">${esc(s.playerName)}</span>
          ${info.contributor ? `<span class="badge contributor">${t("contributor")}</span>` : ""}
        </td>
        <td class="num" style="color:var(--accent); font-weight:700;">${s.points || 0}</td>
      </tr>`;
    });

    html += `</tbody></table></div>`;

    if (unranked.length) {
      const label = state.standingsShowUnranked ? `▲ ${t("hideUnranked")}` : `▼ ${t("showUnranked")} (${unranked.length})`;
      html += `<div class="show-all-toggle" onclick="toggleStandingsUnranked()">${label}</div>`;

      if (state.standingsShowUnranked) {
        html += `<div class="card" style="padding:8px 20px; opacity: 0.7;">`;
        html += `<table><thead><tr>
          <th>${t("playerName")}</th>
          <th class="num">${t("points")}</th>
        </tr></thead><tbody>`;
        unranked.forEach(s => {
          const info = getPlayerInfo(s.playerName);
          html += `<tr>
            <td>
              <span class="flag">${countryFlag(info.country)}</span>
              <span class="player-name muted" onclick="navigateToPlayer('${esc(s.playerName).replace(/'/g, "\\'")}')">${esc(s.playerName)}</span>
            </td>
            <td class="num muted">${s.points || 0}</td>
          </tr>`;
        });
        html += `</tbody></table></div>`;
      }
    }
  }

  setContent(html);
}

function setStandingsDivision(divName) {
  state.standingsDivision = divName;
  state.standingsShowUnranked = false;
  if (state.seasonNumber) renderSeasonStandingsDetail(state.seasonNumber);
}
function toggleStandingsUnranked() {
  state.standingsShowUnranked = !state.standingsShowUnranked;
  if (state.seasonNumber) renderSeasonStandingsDetail(state.seasonNumber);
}

/* ============================================================
   VIEW: PLAYERS LIST
   ============================================================ */
function renderPlayersList() {
  setPageTitle("page.players");
  state.currentView = "players";
  state.playerName = null;

  const stats = {};
  Object.keys(DB.players).forEach(name => {
    const rs = getResultsForPlayer(name);
    stats[name] = {
      played: rs.length,
      wins: rs.filter(r => r.position === 1).length,
      podiums: rs.filter(r => r.position <= 3).length,
      avg: rs.length ? avg(rs.map(r => r.position)) : 0,
    };
  });

  const countriesWithPlayers = new Set();
  Object.keys(DB.players).forEach(name => {
    if (stats[name].played > 0) {
      const cc = DB.players[name].country;
      if (cc) countriesWithPlayers.add(cc);
    }
  });

  let names = Object.keys(DB.players).filter(n => stats[n].played > 0);
  if (state.playersCountryFilter !== "all") {
    names = names.filter(n => (DB.players[n].country || "??") === state.playersCountryFilter);
  }

  const sorters = {
    wins: (a, b) => stats[b].wins - stats[a].wins || stats[b].podiums - stats[a].podiums || stats[a].avg - stats[b].avg,
    podiums: (a, b) => stats[b].podiums - stats[a].podiums || stats[b].wins - stats[a].wins || stats[a].avg - stats[b].avg,
    played: (a, b) => stats[b].played - stats[a].played || stats[b].wins - stats[a].wins,
    avgPos: (a, b) => stats[a].avg - stats[b].avg || stats[b].wins - stats[a].wins,
    nameAsc: (a, b) => a.localeCompare(b),
    nameDesc: (a, b) => b.localeCompare(a),
  };
  names.sort(sorters[state.playersSort] || sorters.wins);

  const countryOptions = [{ v: "all", l: t("filter.allPlayers") }];
  [...countriesWithPlayers].sort().forEach(cc => {
    countryOptions.push({ v: cc, l: `${countryFlag(cc)} ${countryName(cc)}` });
  });

  const sortOptions = [
    { v: "wins", l: t("sort.wins") },
    { v: "podiums", l: t("sort.podiums") },
    { v: "played", l: t("sort.played") },
    { v: "avgPos", l: t("sort.avgPos") },
    { v: "nameAsc", l: t("sort.nameAsc") },
    { v: "nameDesc", l: t("sort.nameDesc") },
  ];

  let html = `
    <div class="filters-bar">
      <div class="filters-bar-group">
        <span class="filters-bar-label">${t("filter.country")}</span>
        <select onchange="changePlayersCountry(this.value)">
          ${countryOptions.map(o => `<option value="${o.v}" ${state.playersCountryFilter === o.v ? "selected" : ""}>${o.l}</option>`).join("")}
        </select>
      </div>
      <div class="filters-bar-group">
        <span class="filters-bar-label">${t("sortBy")}</span>
        <select onchange="changePlayersSort(this.value)">
          ${sortOptions.map(o => `<option value="${o.v}" ${state.playersSort === o.v ? "selected" : ""}>${o.l}</option>`).join("")}
        </select>
      </div>
      <div class="filters-bar-count">${names.length} ${names.length > 1 ? t("playersCount") : t("playerCount")}</div>
    </div>
  `;

  if (!names.length) { html += `<p class="empty">${t("noResultsInFilter")}</p>`; setContent(html); return; }

  html += `<div class="card" style="padding:8px 20px;">
    <table>
      <thead><tr>
        <th style="width:50px;"></th>
        <th>${t("playerName")}</th>
        <th class="num">${t("playedLabel")}</th>
        <th class="num">${t("wins")}</th>
        <th class="num">${t("podiums")}</th>
        <th class="num">${t("avgPos")}</th>
      </tr></thead><tbody>`;

  names.forEach((name, i) => {
    const info = getPlayerInfo(name);
    const s = stats[name];
    html += `<tr>
      <td><span class="rank">${i + 1}</span></td>
      <td>
        <span class="flag">${countryFlag(info.country)}</span>
        <span class="player-name" onclick="navigateToPlayer('${esc(name).replace(/'/g, "\\'")}')">${esc(name)}</span>
        ${info.contributor ? `<span class="badge contributor">${t("contributor")}</span>` : ""}
      </td>
      <td class="num">${s.played}</td>
      <td class="num">${s.wins}</td>
      <td class="num">${s.podiums}</td>
      <td class="num" style="color:var(--accent); font-weight:700;">#${s.avg.toFixed(1)}</td>
    </tr>`;
  });

  html += `</tbody></table></div>`;
  setContent(html);
}

function changePlayersSort(s) { savePlayersSort(s); renderPlayersList(); }
function changePlayersCountry(c) { state.playersCountryFilter = c; renderPlayersList(); }

/* ============================================================
   VIEW: PLAYER DETAIL (avec top scores, top positions, rivals)
   ============================================================ */
function showPlayer(name) {
  setPageTitle("page.player");
  state.currentView = "players";
  state.playerName = name;

  const info = getPlayerInfo(name);
  const results = getResultsForPlayer(name);

  const resultSorters = {
    dateDesc: (a, b) => {
      const ca = getChallengeById(a.challengeId), cb = getChallengeById(b.challengeId);
      return ((cb && cb.date) || "").localeCompare((ca && ca.date) || "");
    },
    dateAsc: (a, b) => {
      const ca = getChallengeById(a.challengeId), cb = getChallengeById(b.challengeId);
      return ((ca && ca.date) || "").localeCompare((cb && cb.date) || "");
    },
    tableAsc: (a, b) => {
      const ca = getChallengeById(a.challengeId), cb = getChallengeById(b.challengeId);
      return (ca ? ca.table : "").localeCompare(cb ? cb.table : "");
    },
    position: (a, b) => a.position - b.position,
    score: (a, b) => b.score - a.score,
  };
  const sortedResults = [...results].sort(resultSorters[state.playerResultsSort] || resultSorters.dateDesc);

  const played = results.length;
  const wins = results.filter(r => r.position === 1).length;
  const podiums = results.filter(r => r.position <= 3).length;
  const top10 = results.filter(r => r.position <= 10).length;
  const avgPos = played ? avg(results.map(r => r.position)) : 0;
  const best = played ? Math.min(...results.map(r => r.position)) : null;
  const worst = played ? Math.max(...results.map(r => r.position)) : null;

  const seasons = [...new Set(results.map(r => {
    const c = getChallengeById(r.challengeId);
    return c && !isTournament(c) ? c.season : null;
  }).filter(Boolean))].sort((a, b) => b - a);
  const hasTournaments = results.some(r => { const c = getChallengeById(r.challengeId); return c && isTournament(c); });

  const seasonStats = {};
  seasons.forEach(s => seasonStats[s] = []);
  results.forEach(r => {
    const c = getChallengeById(r.challengeId);
    if (c && !isTournament(c)) seasonStats[c.season].push(r.position);
  });

  const tableStats = {};
  results.forEach(r => {
    const c = getChallengeById(r.challengeId);
    if (!c) return;
    if (!tableStats[c.table]) tableStats[c.table] = { positions: [], plays: 0 };
    tableStats[c.table].positions.push(r.position);
    tableStats[c.table].plays++;
  });

  const tablesListBase = Object.entries(tableStats).map(([table, s]) => ({
    table, plays: s.plays, avg: avg(s.positions),
    best: Math.min(...s.positions), worst: Math.max(...s.positions),
    wins: s.positions.filter(p => p === 1).length,
    podiums: s.positions.filter(p => p <= 3).length,
  }));

  const tableSorters = {
    avg: (a, b) => a.avg - b.avg || b.plays - a.plays,
    plays: (a, b) => b.plays - a.plays || a.avg - b.avg,
    wins: (a, b) => b.wins - a.wins || b.podiums - a.podiums || a.avg - b.avg,
    podiums: (a, b) => b.podiums - a.podiums || b.wins - a.wins || a.avg - b.avg,
    nameAsc: (a, b) => a.table.localeCompare(b.table),
    best: (a, b) => a.best - b.best || a.avg - b.avg,
  };
  const tablesList = [...tablesListBase].sort(tableSorters[state.playerTablesSort] || tableSorters.avg);

  const specialty = tablesListBase.length ? [...tablesListBase].sort((a, b) => a.avg - b.avg)[0] : null;
  const nemesis = tablesListBase.length ? [...tablesListBase].sort((a, b) => b.avg - a.avg)[0] : null;

  const playerStandings = getPlayerStandings(name);
  const rivals = computeRivals(name, 5, 5);

  let html = `
    <button class="btn" onclick="goToItem('players.all')" style="margin-bottom:18px;">← ${t("nav.players.all")}</button>
    <div class="entity-header">
      <div class="info">
        <h1>
          <span class="flag" style="font-size:26px;">${countryFlag(info.country)}</span>
          ${esc(name)}
          ${info.contributor ? `<span class="badge contributor">${t("contributor")}</span>` : ""}
        </h1>
        <div class="subtitle">
          <span>${info.country ? countryName(info.country) : "—"}</span>
          ${seasons.length ? `<span><strong>${seasons.length}</strong> ${t("season")}${seasons.length > 1 ? "s" : ""}</span>` : ""}
          <span><strong>${played}</strong> ${t("challengesCount")}</span>
          ${hasTournaments ? `<span class="badge tournament">${t("tournament")}</span>` : ""}
        </div>
      </div>
    </div>
    <div class="stat-grid">
      <div class="stat-box"><div class="stat-value">${played}</div><div class="stat-label">${t("playedLabel")}</div></div>
      <div class="stat-box"><div class="stat-value">${wins}</div><div class="stat-label">${t("wins")}</div></div>
      <div class="stat-box"><div class="stat-value">${podiums}</div><div class="stat-label">${t("podiums")}</div></div>
      <div class="stat-box"><div class="stat-value">${top10}</div><div class="stat-label">${t("top10")}</div></div>
      <div class="stat-box"><div class="stat-value">#${avgPos.toFixed(1)}</div><div class="stat-label">${t("avgPos")}</div></div>
      <div class="stat-box"><div class="stat-value">#${best ?? "–"}</div><div class="stat-label">${t("bestPos")}</div></div>
      <div class="stat-box"><div class="stat-value">#${worst ?? "–"}</div><div class="stat-label">${t("worstPos")}</div></div>
    </div>
  `;

  // Career trajectory
  if (playerStandings.length > 0) {
    html += `<div class="section-title">${t("careerTrajectory")}</div>`;
    const chartData = playerStandings.map(s => ({
      label: "S" + s.season,
      value: s.position,
      color: getDivisionColor(s.division),
    }));

    html += `<div class="chart-container">
      <div class="chart-header">
        <span class="title">${t("careerChart")}</span>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:12px; margin-bottom:16px; font-size:11px;">`;
    const usedDivisions = [...new Set(playerStandings.map(s => getDivisionLabel(s.division)))];
    usedDivisions.forEach(label => {
      html += `<span style="display:flex; align-items:center; gap:6px;">
        <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${DIVISION_COLORS[label] || "#8b93a3"};"></span>
        <span>${esc(label)}</span>
      </span>`;
    });
    html += `</div>`;
    html += svgLineChart(chartData, {
      yFormatter: v => "#" + Math.round(v),
      valueFormatter: v => "#" + Math.round(v),
      showValue: true,
      invertY: true,
      emptyLabel: t("noCareer"),
    });
    html += `</div>`;

    html += `<div class="card" style="padding:8px 20px;">
      <table>
        <thead><tr>
          <th>${t("season")}</th>
          <th>${t("division")}</th>
          <th class="num">${t("rank")}</th>
          <th class="num">${t("points")}</th>
        </tr></thead><tbody>`;
    playerStandings.forEach(s => {
      const divColor = getDivisionColor(s.division);
      html += `<tr class="clickable" onclick="navigateToSeasonStandings(${s.season})">
        <td><strong>${esc(s.seasonName || ("Season " + s.season))}</strong></td>
        <td>
          <span class="badge" style="background:${divColor}22; color:${divColor}; border:1px solid ${divColor}44;">
            ${esc(s.divisionLabel)}
          </span>
          ${s.division !== s.divisionLabel ? `<span class="muted" style="font-size:11px; margin-left:6px;">(${esc(s.division)})</span>` : ""}
        </td>
        <td class="num">${s.unranked ? "–" : "#" + s.position}</td>
        <td class="num" style="color:var(--accent); font-weight:700;">${s.points}</td>
      </tr>`;
    });
    html += `</tbody></table></div>`;
  }

  // Top scores
  const topScores = [...results]
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);
  if (topScores.length) {
    const topScoresLimit = 10;
    const topScoresToShow = state.playerTopScoresShowAll ? topScores : topScores.slice(0, topScoresLimit);

    html += `<div class="section-title">🏅 ${t("topPlayerScores")} <small>${topScores.length} ${t("resultsCount")}</small></div>`;
    html += `<div class="card" style="padding:6px 20px;">`;
    topScoresToShow.forEach((r, i) => {
      const c = getChallengeById(r.challengeId);
      const rankClass = i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "";
      html += `<div class="result-row">
        <div class="rank ${rankClass}">${i + 1}</div>
        <div class="player-name clickable" onclick="navigateToTable('${esc(c.table).replace(/'/g, "\\'")}')" style="flex:2;">
          ${esc(c.table)}
          ${isTournament(c) ? `<span class="badge tournament">${t("tournament")}</span>` : ""}
        </div>
        <div class="muted" style="font-size:11.5px; white-space:nowrap;">
          ${isTournament(c) ? esc(c.date || "") : `S${c.season} · W${c.week}`}
        </div>
        <div class="score-value">${fmtScore(r.score)}</div>
      </div>`;
    });
    html += `</div>`;
    html += renderShowAllToggle(topScoresLimit, topScores.length, "playerTopScoresShowAll", "togglePlayerTopScores");
  }

  // Top positions
  const topPositions = [...results]
    .filter(r => r.position >= 1)
    .sort((a, b) => a.position - b.position || b.score - a.score);
  if (topPositions.length) {
    const topPositionsLimit = 10;
    const topPositionsToShow = state.playerTopPositionsShowAll ? topPositions : topPositions.slice(0, topPositionsLimit);

    html += `<div class="section-title">🎯 ${t("topPlayerPositions")} <small>${topPositions.length} ${t("resultsCount")}</small></div>`;
    html += `<div class="card" style="padding:6px 20px;">`;
    topPositionsToShow.forEach((r, i) => {
      const c = getChallengeById(r.challengeId);
      const rankClass = r.position === 1 ? "gold" : r.position === 2 ? "silver" : r.position === 3 ? "bronze" : "";
      html += `<div class="result-row">
        <div class="rank ${rankClass}">#${r.position}</div>
        <div class="player-name clickable" onclick="navigateToTable('${esc(c.table).replace(/'/g, "\\'")}')" style="flex:2;">
          ${esc(c.table)}
          ${isTournament(c) ? `<span class="badge tournament">${t("tournament")}</span>` : ""}
        </div>
        <div class="muted" style="font-size:11.5px; white-space:nowrap;">
          ${isTournament(c) ? esc(c.date || "") : `S${c.season} · W${c.week}`}
        </div>
        <div class="score-value">${fmtScore(r.score)}</div>
      </div>`;
    });
    html += `</div>`;
    html += renderShowAllToggle(topPositionsLimit, topPositions.length, "playerTopPositionsShowAll", "togglePlayerTopPositions");
  }

  // Rivals
  if (rivals.length) {
    html += `<div class="section-title">⚔️ ${t("rivals")} <small>${t("rivalsHint")}</small></div>`;
    html += `<div class="card" style="padding:8px 20px;"><table>
      <thead><tr>
        <th style="width:40px;"></th>
        <th>${t("playerName")}</th>
        <th>${t("division")}</th>
        <th class="num">${t("rivalCommunChallenges")}</th>
        <th class="num">${t("rivalAvgGap")}</th>
      </tr></thead><tbody>`;
    rivals.forEach((r, i) => {
      const rInfo = getPlayerInfo(r.name);
      const divColor = getDivisionColor(r.topDivision);
      html += `<tr>
        <td><span class="rank">${i + 1}</span></td>
        <td>
          <span class="flag">${countryFlag(rInfo.country)}</span>
          <span class="player-name" onclick="navigateToPlayer('${esc(r.name).replace(/'/g, "\\'")}')">${esc(r.name)}</span>
          ${rInfo.contributor ? `<span class="badge contributor">${t("contributor")}</span>` : ""}
        </td>
        <td>
          <span class="badge" style="background:${divColor}22; color:${divColor}; border:1px solid ${divColor}44;">
            ${esc(getDivisionLabel(r.topDivision))}
          </span>
        </td>
        <td class="num">${r.commonChallenges}</td>
        <td class="num" style="color:var(--accent); font-weight:700;">${r.avgGap.toFixed(1)}</td>
      </tr>`;
    });
    html += `</tbody></table></div>`;
  }

  // Season history
  if (seasons.length) {
    html += `<div class="section-title">${t("seasonHistory")}</div>`;
    html += `<div class="card" style="padding:8px 20px;"><table>
      <thead><tr>
        <th>${t("season")}</th>
        <th class="num">${t("playedLabel")}</th>
        <th class="num">${t("wins")}</th>
        <th class="num">${t("podiums")}</th>
        <th class="num">${t("avgPos")}</th>
      </tr></thead><tbody>`;
    seasons.forEach(s => {
      const pos = seasonStats[s];
      html += `<tr>
        <td><strong>${t("season")} ${s}</strong></td>
        <td class="num">${pos.length}</td>
        <td class="num">${pos.filter(p => p === 1).length}</td>
        <td class="num">${pos.filter(p => p <= 3).length}</td>
        <td class="num" style="color:var(--accent); font-weight:700;">#${avg(pos).toFixed(1)}</td>
      </tr>`;
    });
    html += `</tbody></table></div>`;
  }

  if (specialty) {
    html += `<div class="section-title">${t("specialty")} & ${t("nemesis")}</div>`;
    html += `<div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">`;
    html += `<div class="card" style="border-left:3px solid var(--accent);">
      <div class="card-title"><strong>🌟 ${t("specialty")}</strong></div>
      <div style="font-weight:700; font-size:14px; margin-bottom:6px;" class="clickable"
           onclick="navigateToTable('${esc(specialty.table).replace(/'/g, "\\'")}')">${esc(specialty.table)}</div>
      <div class="muted" style="font-size:12px;">
        ${specialty.plays} ${t("played")} · ${specialty.wins} ${t("wins").toLowerCase()} · ${specialty.podiums} ${t("podiums").toLowerCase()} · ${t("avgPos").toLowerCase()} <strong style="color:var(--accent);">#${specialty.avg.toFixed(1)}</strong>
      </div>
    </div>`;
    if (nemesis && nemesis.table !== specialty.table) {
      html += `<div class="card" style="border-left:3px solid var(--danger);">
        <div class="card-title"><strong>😈 ${t("nemesis")}</strong></div>
        <div style="font-weight:700; font-size:14px; margin-bottom:6px;" class="clickable"
             onclick="navigateToTable('${esc(nemesis.table).replace(/'/g, "\\'")}')">${esc(nemesis.table)}</div>
        <div class="muted" style="font-size:12px;">
          ${nemesis.plays} ${t("played")} · ${nemesis.wins} ${t("wins").toLowerCase()} · ${nemesis.podiums} ${t("podiums").toLowerCase()} · ${t("avgPos").toLowerCase()} <strong style="color:var(--danger);">#${nemesis.avg.toFixed(1)}</strong>
        </div>
      </div>`;
    }
    html += `</div>`;
  }

  if (tablesList.length) {
    html += `<div class="section-title">${t("tablesPerformance")}</div>`;
    const tableSortOptions = [
      { v: "avg", l: t("sort.avgPos") },
      { v: "plays", l: t("sort.played") },
      { v: "wins", l: t("sort.wins") },
      { v: "podiums", l: t("sort.podiums") },
      { v: "best", l: t("sort.best") },
      { v: "nameAsc", l: t("sort.nameAsc") },
    ];
    html += `<div class="filters-bar" style="margin-bottom:12px;">
      <div class="filters-bar-group">
        <span class="filters-bar-label">${t("sortBy")}</span>
        <select onchange="changePlayerTablesSort(this.value)">
          ${tableSortOptions.map(o => `<option value="${o.v}" ${state.playerTablesSort === o.v ? "selected" : ""}>${o.l}</option>`).join("")}
        </select>
      </div>
      <div class="filters-bar-count">${tablesList.length} ${tablesList.length > 1 ? t("tablesCount") : t("tableCount")}</div>
    </div>`;

    const tablesLimit = 15;
    const tablesToShow = state.playerTablesShowAll ? tablesList : tablesList.slice(0, tablesLimit);

    html += `<div class="card" style="padding:8px 20px;"><table>
      <thead><tr>
        <th>${t("tableName")}</th>
        <th class="num">${t("playedLabel")}</th>
        <th class="num">${t("wins")}</th>
        <th class="num">${t("podiums")}</th>
        <th class="num">${t("avgPos")}</th>
        <th class="num">${t("bestPos")}</th>
      </tr></thead><tbody>`;
    tablesToShow.forEach(tl => {
      html += `<tr>
        <td class="clickable" onclick="navigateToTable('${esc(tl.table).replace(/'/g, "\\'")}')">${esc(tl.table)}</td>
        <td class="num">${tl.plays}</td>
        <td class="num">${tl.wins}</td>
        <td class="num">${tl.podiums}</td>
        <td class="num" style="color:var(--accent); font-weight:700;">#${tl.avg.toFixed(1)}</td>
        <td class="num">#${tl.best}</td>
      </tr>`;
    });
    html += `</tbody></table></div>`;
    html += renderShowAllToggle(tablesLimit, tablesList.length, "playerTablesShowAll", "togglePlayerTables");
  }

  html += `<div class="section-title">${t("recentResults")} <small>${sortedResults.length} ${t("resultsCount")}</small></div>`;
  const resultSortOptions = [
    { v: "dateDesc", l: t("sort.lastPlayed") },
    { v: "dateAsc", l: t("sort.firstPlayed") },
    { v: "tableAsc", l: t("sort.nameAsc") },
    { v: "position", l: t("position") },
    { v: "score", l: t("score") },
  ];
  html += `<div class="filters-bar" style="margin-bottom:12px;">
    <div class="filters-bar-group">
      <span class="filters-bar-label">${t("sortBy")}</span>
      <select onchange="changePlayerResultsSort(this.value)">
        ${resultSortOptions.map(o => `<option value="${o.v}" ${state.playerResultsSort === o.v ? "selected" : ""}>${o.l}</option>`).join("")}
      </select>
    </div>
  </div>`;

  if (!sortedResults.length) {
    html += `<p class="empty">${t("noResults")}</p>`;
  } else {
    const resultsLimit = 20;
    const resultsToShow = state.playerResultsShowAll ? sortedResults : sortedResults.slice(0, resultsLimit);
    html += `<div class="card" style="padding:6px 20px;">`;
    resultsToShow.forEach(r => {
      const c = getChallengeById(r.challengeId);
      if (!c) return;
      const rankClass = r.position === 1 ? "gold" : r.position <= 3 ? "silver" : "";
      const tournBadge = isTournament(c) ? `<span class="badge tournament">${t("tournament")}</span>` : "";
      const dateLabel = isTournament(c) ? esc(c.date || "") : `S${c.season} · W${c.week}`;
      html += `<div class="result-row">
        <div class="rank ${rankClass}">#${r.position}</div>
        <div class="player-name clickable" onclick="navigateToTable('${esc(c.table).replace(/'/g, "\\'")}')" style="flex:2;">
          ${esc(c.table)} ${tournBadge}
        </div>
        <div class="muted" style="font-size:11.5px; white-space:nowrap;">${dateLabel}</div>
        <div class="score-value">${fmtScore(r.score)}</div>
      </div>`;
    });
    html += `</div>`;
    html += renderShowAllToggle(resultsLimit, sortedResults.length, "playerResultsShowAll", "togglePlayerResults");
  }

  setContent(html);
}

function togglePlayerTables() { state.playerTablesShowAll = !state.playerTablesShowAll; if (state.playerName) showPlayer(state.playerName); }
function togglePlayerResults() { state.playerResultsShowAll = !state.playerResultsShowAll; if (state.playerName) showPlayer(state.playerName); }
function togglePlayerTopScores() { state.playerTopScoresShowAll = !state.playerTopScoresShowAll; if (state.playerName) showPlayer(state.playerName); }
function togglePlayerTopPositions() { state.playerTopPositionsShowAll = !state.playerTopPositionsShowAll; if (state.playerName) showPlayer(state.playerName); }
function changePlayerTablesSort(s) { state.playerTablesSort = s; if (state.playerName) showPlayer(state.playerName); }
function changePlayerResultsSort(s) { state.playerResultsSort = s; if (state.playerName) showPlayer(state.playerName); }

/* ============================================================
   VIEW: COUNTRIES
   ============================================================ */
function renderCountries() {
  setPageTitle("page.countries");
  state.currentView = "countries";
  state.countryCc = null;

  const countryStats = {};
  Object.keys(DB.players).forEach(name => {
    const cc = DB.players[name].country || "??";
    if (!countryStats[cc]) countryStats[cc] = { players: 0, wins: 0, podiums: 0, top10: 0, results: 0 };
    countryStats[cc].players++;
  });
  DB.results.forEach(r => {
    const cc = getPlayerInfo(r.playerName).country || "??";
    if (!countryStats[cc]) countryStats[cc] = { players: 0, wins: 0, podiums: 0, top10: 0, results: 0 };
    countryStats[cc].results++;
    if (r.position === 1) countryStats[cc].wins++;
    if (r.position <= 3) countryStats[cc].podiums++;
    if (r.position <= 10) countryStats[cc].top10++;
  });

  const sorted = Object.entries(countryStats).sort((a, b) =>
    b[1].wins - a[1].wins || b[1].podiums - a[1].podiums || b[1].players - a[1].players
  );

  let html = `<div class="section-title">${sorted.length} ${t("country")}${sorted.length > 1 ? "s" : ""}</div>`;
  html += `<div class="card" style="padding:8px 20px;"><table>
    <thead><tr>
      <th>${t("country")}</th>
      <th class="num">${t("playersCount")}</th>
      <th class="num">${t("wins")}</th>
      <th class="num">${t("podiums")}</th>
      <th class="num">${t("top10")}</th>
      <th class="num">${t("resultsCount")}</th>
    </tr></thead><tbody>`;

  sorted.forEach(([cc, s]) => {
    html += `<tr class="clickable" onclick="navigateToCountry('${esc(cc)}')">
      <td><span class="flag">${countryFlag(cc)}</span> <strong>${esc(countryName(cc))}</strong></td>
      <td class="num">${s.players}</td>
      <td class="num" style="color:var(--accent); font-weight:700;">${s.wins}</td>
      <td class="num">${s.podiums}</td>
      <td class="num">${s.top10}</td>
      <td class="num muted">${s.results}</td>
    </tr>`;
  });

  html += `</tbody></table></div>`;
  setContent(html);
}

function showCountry(cc) {
  setPageTitle("page.countries");
  state.currentView = "countries";
  state.countryCc = cc;

  const players = Object.keys(DB.players).filter(n => (DB.players[n].country || "") === cc);

  const stats = {};
  players.forEach(name => {
    const rs = getResultsForPlayer(name);
    stats[name] = {
      played: rs.length,
      wins: rs.filter(r => r.position === 1).length,
      podiums: rs.filter(r => r.position <= 3).length,
      avg: rs.length ? avg(rs.map(r => r.position)) : 0,
    };
  });

  const sorters = {
    wins: (a, b) => stats[b].wins - stats[a].wins || stats[b].podiums - stats[a].podiums || stats[a].avg - stats[b].avg,
    podiums: (a, b) => stats[b].podiums - stats[a].podiums || stats[b].wins - stats[a].wins || stats[a].avg - stats[b].avg,
    played: (a, b) => stats[b].played - stats[a].played || stats[b].wins - stats[a].wins,
    avgPos: (a, b) => stats[a].avg - stats[b].avg || stats[b].wins - stats[a].wins,
    nameAsc: (a, b) => a.localeCompare(b),
  };
  const sorted = [...players].sort(sorters[state.countrySort] || sorters.wins);

  let html = `
    <button class="btn" onclick="goToItem('world.countries')" style="margin-bottom:18px;">← ${t("nav.world.countries")}</button>
    <div class="entity-header">
      <div class="info">
        <h1><span class="flag" style="font-size:32px;">${countryFlag(cc)}</span> ${esc(countryName(cc))}</h1>
        <div class="subtitle"><span><strong>${players.length}</strong> ${t("playersCount")}</span></div>
      </div>
    </div>`;

  const sortOptions = [
    { v: "wins", l: t("sort.wins") },
    { v: "podiums", l: t("sort.podiums") },
    { v: "played", l: t("sort.played") },
    { v: "avgPos", l: t("sort.avgPos") },
    { v: "nameAsc", l: t("sort.nameAsc") },
  ];
  html += `<div class="filters-bar" style="margin-bottom:12px;">
    <div class="filters-bar-group">
      <span class="filters-bar-label">${t("sortBy")}</span>
      <select onchange="changeCountrySort(this.value)">
        ${sortOptions.map(o => `<option value="${o.v}" ${state.countrySort === o.v ? "selected" : ""}>${o.l}</option>`).join("")}
      </select>
    </div>
    <div class="filters-bar-count">${sorted.length} ${sorted.length > 1 ? t("playersCount") : t("playerCount")}</div>
  </div>`;

  const countryLimit = 20;
  const toShow = state.countryShowAll ? sorted : sorted.slice(0, countryLimit);

  html += `<div class="card" style="padding:8px 20px;"><table>
    <thead><tr>
      <th>${t("playerName")}</th>
      <th class="num">${t("playedLabel")}</th>
      <th class="num">${t("wins")}</th>
      <th class="num">${t("podiums")}</th>
      <th class="num">${t("avgPos")}</th>
    </tr></thead><tbody>`;

  toShow.forEach(name => {
    const info = getPlayerInfo(name);
    const s = stats[name];
    html += `<tr>
      <td class="clickable" onclick="navigateToPlayer('${esc(name).replace(/'/g, "\\'")}')">
        ${esc(name)} ${info.contributor ? `<span class="badge contributor">${t("contributor")}</span>` : ""}
      </td>
      <td class="num">${s.played}</td>
      <td class="num">${s.wins}</td>
      <td class="num">${s.podiums}</td>
      <td class="num" style="color:var(--accent); font-weight:700;">#${s.avg.toFixed(1)}</td>
    </tr>`;
  });

  html += `</tbody></table></div>`;
  html += renderShowAllToggle(countryLimit, sorted.length, "countryShowAll", "toggleCountryShowAll");
  setContent(html);
}

function changeCountrySort(s) { state.countrySort = s; if (state.countryCc) showCountry(state.countryCc); }
function toggleCountryShowAll() { state.countryShowAll = !state.countryShowAll; if (state.countryCc) showCountry(state.countryCc); }

/* ============================================================
   VIEW: RECORDS
   ============================================================ */
/* État local pour les records dépliés */
let expandedRecords = new Set();

function renderRecords() {
  setPageTitle("page.records");
  state.currentView = "records";

  // ---- Précalculs ----
  const allResults = DB.results;

  const playerStats = {};
  allResults.forEach(r => {
    const p = r.playerName;
    if (!playerStats[p]) playerStats[p] = { positions: [], wins: 0, podiums: 0, top10: 0 };
    playerStats[p].positions.push(r.position);
    if (r.position === 1) playerStats[p].wins++;
    if (r.position <= 3) playerStats[p].podiums++;
    if (r.position <= 10) playerStats[p].top10++;
  });

  const resultsByPlayer = {};
  allResults.forEach(r => {
    const c = getChallengeById(r.challengeId);
    if (!c) return;
    if (!resultsByPlayer[r.playerName]) resultsByPlayer[r.playerName] = [];
    resultsByPlayer[r.playerName].push({ ...r, date: c.date });
  });
  Object.values(resultsByPlayer).forEach(arr => {
    arr.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  });

  const enriched = {};
  Object.entries(playerStats).forEach(([name, s]) => {
    const plays = s.positions.length;
    if (plays === 0) return;
    const avgPos = avg(s.positions);
    const mean = avgPos;
    const variance = avg(s.positions.map(p => Math.pow(p - mean, 2)));
    const stdDev = Math.sqrt(variance);
    const wins = s.wins;
    const podiums = s.podiums;
    const top10 = s.top10;
    const winrate = wins / plays;
    const podiumRate = podiums / plays;

    const seasonsSet = new Set();
    for (const [season, data] of Object.entries(DB.standings)) {
      for (const div of data.divisions || []) {
        if ((div.standings || []).some(x => x.playerName === name && !x.unranked)) {
          seasonsSet.add(season);
        }
      }
    }

    const results = resultsByPlayer[name] || [];
    let maxTop10Streak = 0, maxPodiumStreak = 0, maxWinStreak = 0;
    let curTop10 = 0, curPodium = 0, curWin = 0;
    results.forEach(r => {
      if (r.position <= 10) { curTop10++; maxTop10Streak = Math.max(maxTop10Streak, curTop10); }
      else curTop10 = 0;

      if (r.position <= 3) { curPodium++; maxPodiumStreak = Math.max(maxPodiumStreak, curPodium); }
      else curPodium = 0;

      if (r.position === 1) { curWin++; maxWinStreak = Math.max(maxWinStreak, curWin); }
      else curWin = 0;
    });

    enriched[name] = {
      name, plays, wins, podiums, top10, avgPos, stdDev, winrate, podiumRate,
      seasons: seasonsSet.size,
      maxTop10Streak, maxPodiumStreak, maxWinStreak,
    };
  });

  const enrichedList = Object.values(enriched);

  // ---- Helpers pour extraire le "top" ----
  // Renvoie { value, players: [name1, name2, ...] } pour le maximum
  function maxBy(key, filterFn) {
    const eligible = enrichedList.filter(filterFn || (() => true));
    if (!eligible.length) return null;
    const maxVal = Math.max(...eligible.map(p => p[key]));
    const players = eligible
      .filter(p => p[key] === maxVal)
      .map(p => p.name)
      .sort((a, b) => a.localeCompare(b));
    return { value: maxVal, players };
  }

  // Pour la position moyenne : on veut le MINIMUM (meilleure = plus petit)
  function minBy(key, filterFn) {
    const eligible = enrichedList.filter(filterFn || (() => true));
    if (!eligible.length) return null;
    const minVal = Math.min(...eligible.map(p => p[key]));
    const players = eligible
      .filter(p => p[key] === minVal)
      .map(p => p.name)
      .sort((a, b) => a.localeCompare(b));
    return { value: minVal, players };
  }

  // ---- Construction des records ----
  const records = [];

  // 1. Most wins
  {
    const r = maxBy("wins");
    if (r) records.push({ id: "wins", label: "🏆 Most wins", value: r.value, players: r.players });
  }
  // 2. Most podiums
  {
    const r = maxBy("podiums");
    if (r) records.push({ id: "podiums", label: "🥇 Most podiums", value: r.value, players: r.players });
  }
  // 3. Most Top 10
  {
    const r = maxBy("top10");
    if (r) records.push({ id: "top10", label: "🎯 Most Top 10", value: r.value, players: r.players });
  }
  // 4. Most challenges
  {
    const r = maxBy("plays");
    if (r) records.push({ id: "plays", label: "📊 Most challenges played", value: r.value, players: r.players });
  }
  // 5-8. Best average (5+, 20+, 50+, 100+)
  [5, 20, 50, 100].forEach(min => {
    const r = minBy("avgPos", p => p.plays >= min);
    if (r) records.push({
      id: "avg" + min,
      label: `📈 Best average position (${min}+ challenges)`,
      value: `#${r.value.toFixed(2)}`,
      players: r.players,
    });
  });
  // 9. Best winrate (20+)
  {
    const r = maxBy("winrate", p => p.plays >= 20);
    if (r) records.push({
      id: "winrate",
      label: "🥇 Best win rate (20+ challenges)",
      value: `${(r.value * 100).toFixed(1)}%`,
      players: r.players,
    });
  }
  // 10. Best podium ratio (20+)
  {
    const r = maxBy("podiumRate", p => p.plays >= 20);
    if (r) records.push({
      id: "podiumRate",
      label: "🎯 Best podium ratio (20+ challenges)",
      value: `${(r.value * 100).toFixed(1)}%`,
      players: r.players,
    });
  }
  // 11. Longest Top 10 streak
  {
    const r = maxBy("maxTop10Streak", p => p.maxTop10Streak >= 3);
    if (r) records.push({ id: "top10Streak", label: "🔥 Longest Top 10 streak", value: r.value, players: r.players });
  }
  // 12. Longest podium streak
  {
    const r = maxBy("maxPodiumStreak", p => p.maxPodiumStreak >= 2);
    if (r) records.push({ id: "podiumStreak", label: "🔥 Longest podium streak", value: r.value, players: r.players });
  }
  // 13. Longest win streak
  {
    const r = maxBy("maxWinStreak", p => p.maxWinStreak >= 2);
    if (r) records.push({ id: "winStreak", label: "👑 Longest win streak", value: r.value, players: r.players });
  }
  // 14. Most seasons played
  {
    const r = maxBy("seasons", p => p.seasons >= 3);
    if (r) records.push({ id: "seasons", label: "📅 Most seasons played", value: r.value, players: r.players });
  }
  // 15. Most consistent
  {
    const r = minBy("stdDev", p => p.plays >= 20);
    if (r) records.push({
      id: "consistent",
      label: "🎲 Most consistent (20+ challenges)",
      value: r.value.toFixed(2),
      players: r.players,
    });
  }
  // 16. Most unpredictable
  {
    const r = maxBy("stdDev", p => p.plays >= 20);
    if (r) records.push({
      id: "unpredictable",
      label: "🎢 Most unpredictable (20+ challenges)",
      value: r.value.toFixed(2),
      players: r.players,
    });
  }

  // ---- Affichage ----
  const VISIBLE = 3;

  let html = `<div class="section-title">🏆 ${t("allTimeRecords") || "All-time records"} <small>${records.length} records</small></div>`;
  html += `<div class="records-grid">`;

  records.forEach(rec => {
    const isExpanded = expandedRecords.has(rec.id);
    const visiblePlayers = isExpanded ? rec.players : rec.players.slice(0, VISIBLE);
    const hiddenCount = rec.players.length - VISIBLE;

    html += `<div class="record-card">`;
    html += `<div class="record-label">${rec.label}</div>`;
    html += `<div class="record-list">`;

    visiblePlayers.forEach((playerName, i) => {
      const info = getPlayerInfo(playerName);
      html += `
        <div class="record-item" onclick="navigateToPlayer('${esc(playerName).replace(/'/g, "\\'")}')">
          <span class="record-item-name">
            <span class="flag">${countryFlag(info.country)}</span>
            ${esc(playerName)}
            ${info.contributor ? `<span class="badge contributor">${t("contributor")}</span>` : ""}
          </span>
          ${i === 0 ? `<span class="record-value-inline">${rec.value}</span>` : ""}
        </div>
      `;
    });

    if (!isExpanded && hiddenCount > 0) {
      html += `<div class="record-item-more" onclick="toggleRecordExpand('${rec.id}')">
        ▸ Voir +${hiddenCount} autre${hiddenCount > 1 ? "s" : ""} (${rec.value})
      </div>`;
    } else if (isExpanded && hiddenCount > 0) {
      html += `<div class="record-item-more" onclick="toggleRecordExpand('${rec.id}')">
        ▴ Réduire
      </div>`;
    }

    html += `</div>`;
    html += `</div>`;
  });

  html += `</div>`;

  setContent(html);
}

function toggleRecordExpand(recordId) {
  if (expandedRecords.has(recordId)) {
    expandedRecords.delete(recordId);
  } else {
    expandedRecords.add(recordId);
  }
  renderRecords();
}

/* ============================================================
   VIEW: HEAD-TO-HEAD
   ============================================================ */
function renderH2H() {
  setPageTitle("page.h2h");
  state.currentView = "h2h";

  const players = Object.keys(DB.players)
    .filter(n => DB.results.some(r => r.playerName === n))
    .sort();

  const playerItems = players.map(n => {
    const info = getPlayerInfo(n);
    return { value: n, label: n, sublabel: info.country ? countryFlag(info.country) + " " + countryName(info.country) : "" };
  });

  const sorted = [...players].sort((a, b) => getResultsForPlayer(b).length - getResultsForPlayer(a).length);
  const defaultP1 = state.h2hP1 && players.includes(state.h2hP1) ? state.h2hP1 : (sorted[0] || "");
  const defaultP2 = state.h2hP2 && players.includes(state.h2hP2) ? state.h2hP2 : (sorted[1] || "");

  state.h2hP1 = defaultP1;
  state.h2hP2 = defaultP2;
  state.h2hShowAll = false;

  let html = `
    <div class="card">
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:22px;">
        <div>
          <label>${t("nav.players")} 1</label>
          <div id="h2hP1-combobox-wrap">${renderCombobox("h2hP1-combobox", playerItems, defaultP1, "searchPlayer", "onH2HP1Select")}</div>
        </div>
        <div>
          <label>${t("nav.players")} 2</label>
          <div id="h2hP2-combobox-wrap">${renderCombobox("h2hP2-combobox", playerItems, defaultP2, "searchPlayer", "onH2HP2Select")}</div>
        </div>
      </div>
      <div id="h2hContent" style="margin-top:24px;"></div>
    </div>
  `;

  setContent(html);
  updateH2H();
}

function onH2HP1Select(value) { state.h2hP1 = value; state.h2hShowAll = false; updateComboboxLabel("h2hP1-combobox", value); updateH2H(); }
function onH2HP2Select(value) { state.h2hP2 = value; state.h2hShowAll = false; updateComboboxLabel("h2hP2-combobox", value); updateH2H(); }
function toggleH2HShowAll() { state.h2hShowAll = !state.h2hShowAll; updateH2H(); }

function updateH2H() {
  const p1 = state.h2hP1;
  const p2 = state.h2hP2;
  const box = document.getElementById("h2hContent");
  if (!box) return;

  if (!p1 || !p2) { box.innerHTML = ""; return; }
  if (p1 === p2) { box.innerHTML = `<p class="empty">${t("pleaseSelectTwo")}</p>`; return; }

  const r1 = getResultsForPlayer(p1);
  const r2 = getResultsForPlayer(p2);
  const c1 = new Set(r1.map(r => r.challengeId));
  const common = r2.filter(r => c1.has(r.challengeId));

  let wins1 = 0, wins2 = 0, ties = 0;
  common.forEach(r2i => {
    const r1i = r1.find(r => r.challengeId === r2i.challengeId);
    if (r1i.position < r2i.position) wins1++;
    else if (r2i.position < r1i.position) wins2++;
    else ties++;
  });

  const avg1 = common.length ? avg(common.map(c => r1.find(r => r.challengeId === c.challengeId).position)) : 0;
  const avg2 = common.length ? avg(common.map(c => c.position)) : 0;
  const short1 = esc(p1.split(" ")[0]);
  const short2 = esc(p2.split(" ")[0]);

  let html = `
    <div class="stat-grid">
      <div class="stat-box"><div class="stat-value">${common.length}</div><div class="stat-label">${t("commonChallenges")}</div></div>
      <div class="stat-box"><div class="stat-value">${wins1}</div><div class="stat-label">${short1}</div></div>
      <div class="stat-box"><div class="stat-value">${wins2}</div><div class="stat-label">${short2}</div></div>
      <div class="stat-box"><div class="stat-value">${ties}</div><div class="stat-label">${t("tie")}</div></div>
      <div class="stat-box"><div class="stat-value">#${avg1.toFixed(1)}</div><div class="stat-label">${t("avgPos")} ${short1}</div></div>
      <div class="stat-box"><div class="stat-value">#${avg2.toFixed(1)}</div><div class="stat-label">${t("avgPos")} ${short2}</div></div>
    </div>
  `;

  if (!common.length) {
    html += `<p class="empty">${t("noResults")}</p>`;
    box.innerHTML = html;
    return;
  }

  const sorted = [...common].sort((a, b) => {
    const ca = getChallengeById(a.challengeId), cb = getChallengeById(b.challengeId);
    return ((cb && cb.date) || "").localeCompare((ca && ca.date) || "");
  });

  html += `<div class="section-title">${t("directEncounters")}</div>`;
  html += `<table><thead><tr>
    <th>${t("tableName")}</th>
    <th>${t("date")}</th>
    <th class="num">${esc(p1)}</th>
    <th class="num">${esc(p2)}</th>
    <th>${t("advantage")}</th>
  </tr></thead><tbody>`;

  const h2hLimit = 50;
  const toShow = state.h2hShowAll ? sorted : sorted.slice(0, h2hLimit);

  toShow.forEach(r2i => {
    const r1i = r1.find(r => r.challengeId === r2i.challengeId);
    const c = getChallengeById(r2i.challengeId);
    if (!c) return;
    let adv = "—";
    if (r1i.position < r2i.position) adv = `<span style="color:var(--accent); font-weight:600;">${esc(p1)}</span>`;
    else if (r2i.position < r1i.position) adv = `<span style="color:var(--accent); font-weight:600;">${esc(p2)}</span>`;
    else adv = `<span class="muted">${t("tie")}</span>`;
    html += `<tr>
      <td class="clickable" onclick="navigateToTable('${esc(c.table).replace(/'/g, "\\'")}')">${esc(c.table)}</td>
      <td class="muted">${esc(c.date || "")}</td>
      <td class="num">#${r1i.position}</td>
      <td class="num">#${r2i.position}</td>
      <td>${adv}</td>
    </tr>`;
  });

  html += `</tbody></table>`;
  box.innerHTML = html;

  if (sorted.length > h2hLimit) {
    const toggleHtml = renderShowAllToggle(h2hLimit, sorted.length, "h2hShowAll", "toggleH2HShowAll");
    box.insertAdjacentHTML("beforeend", toggleHtml);
  }
}

/* ============================================================
   GLOBAL SEARCH
   ============================================================ */
function initSearch() {
  const input = document.getElementById("globalSearch");
  const results = document.getElementById("searchResults");
  if (!input || !results) return;

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) { results.classList.remove("open"); return; }

    const playerMatches = Object.keys(DB.players).filter(n => n.toLowerCase().includes(q)).slice(0, 6);
    const tableMatches = [...new Set(DB.challenges.map(c => c.table))].filter(tbl => tbl.toLowerCase().includes(q)).slice(0, 6);

    if (!playerMatches.length && !tableMatches.length) { results.classList.remove("open"); return; }

    let html = "";
    playerMatches.forEach(name => {
      const info = getPlayerInfo(name);
      html += `<div class="result-item" onclick="selectPlayerFromSearch('${esc(name).replace(/'/g, "\\'")}')">
        <span><span class="flag">${countryFlag(info.country)}</span> ${esc(name)}</span>
        <span class="result-type">${t("playerName")}</span>
      </div>`;
    });
    tableMatches.forEach(tbl => {
      html += `<div class="result-item" onclick="selectTableFromSearch('${esc(tbl).replace(/'/g, "\\'")}')">
        <span>🎯 ${esc(tbl)}</span>
        <span class="result-type">${t("tableName")}</span>
      </div>`;
    });
    results.innerHTML = html;
    results.classList.add("open");
  });

  document.addEventListener("click", e => {
    if (!e.target.closest(".topbar-search")) results.classList.remove("open");
  });
}

function selectPlayerFromSearch(name) {
  document.getElementById("searchResults").classList.remove("open");
  document.getElementById("globalSearch").value = "";
  navigateToPlayer(name);
}
function selectTableFromSearch(table) {
  document.getElementById("searchResults").classList.remove("open");
  document.getElementById("globalSearch").value = "";
  navigateToTable(table);
}

/* ============================================================
   INIT
   ============================================================ */
async function init() {
  loadPrefs();
  setContent(`<p class="empty">${t("loading")}</p>`);
  const ok = await loadData();
  if (!ok) { setContent(`<p class="empty">${t("errorLoading")}</p>`); return; }
  renderNav();
  initSearch();
  updateDbStats();
  renderOverview();
}

document.addEventListener("DOMContentLoaded", init);