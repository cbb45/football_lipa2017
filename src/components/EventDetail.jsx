import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

function generateDefaultRoster() {
  const makeTeams = (count) =>
    Array.from({ length: count }, () => ({
      name: "Team",
      players: Array.from({ length: 7 }, () => ""),
    }));

  return {
    groups: [
      { name: "Chill Open Play", teams: makeTeams(6) },
      { name: "Competitive Open Play", teams: makeTeams(10) },
    ],
  };
}

const TEAM_COUNTS = {
  "Chill Open Play": 6,
  "Competitive Open Play": 10,
};

function normalizeRoster(roster) {
  if (!roster) return generateDefaultRoster();

  return {
    groups: roster.groups.map((group) => {
      const targetCount = TEAM_COUNTS[group.name] ?? group.teams.length;
      let teams = group.teams.map((team) => {
        const players = [...team.players];
        while (players.length < 7) {
          players.push("");
        }
        return { ...team, players: players.slice(0, 7) };
      });

      while (teams.length < targetCount) {
        teams.push({
          name: "Team",
          players: Array.from({ length: 7 }, () => ""),
        });
      }

      teams = teams.slice(0, targetCount);

      return { ...group, teams };
    }),
  };
}

function TeamColumn({ team, onNameChange, onPlayerChange }) {
  return (
    <div>
      <input
        value={team.name}
        onChange={(e) => onNameChange(e.target.value)}
        className="font-semibold text-sm text-gray-800 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-red-300 rounded px-1 mb-2 w-full"
      />
      <div className="space-y-1">
        {team.players.map((player, i) => (
          <input
            key={i}
            value={player}
            onChange={(e) => onPlayerChange(i, e.target.value)}
            placeholder={`Player ${i + 1}`}
            className="w-full bg-blue-50 border border-blue-100 rounded px-2 py-1 text-xs text-gray-700 placeholder-blue-300 focus:outline-none focus:ring-1 focus:ring-red-400"
          />
        ))}
      </div>
    </div>
  );
}

function GroupSection({ group, onTeamNameChange, onPlayerChange }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between mb-4"
      >
        <span className="font-semibold text-gray-800 text-sm">{group.name}</span>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {open && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {group.teams.map((team, teamIndex) => (
            <TeamColumn
              key={teamIndex}
              team={team}
              onNameChange={(name) => onTeamNameChange(teamIndex, name)}
              onPlayerChange={(playerIndex, value) =>
                onPlayerChange(teamIndex, playerIndex, value)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function generateMatchups(teams, order) {
  const ordered = order.map((i) => teams[i]);
  const matches = [];

  for (let i = 0; i < ordered.length; i += 2) {
    const home = ordered[i];
    const away = ordered[i + 1];
    matches.push({
      home: home?.name?.trim() || `Team ${i + 1}`,
      away: away ? (away.name?.trim() || `Team ${i + 2}`) : null,
    });
  }

  return matches;
}

function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function GameSequencer({ group }) {
  const [order, setOrder] = useState(() => group.teams.map((_, i) => i));

  const matches = generateMatchups(group.teams, order);

  const handleShuffle = () => {
    setOrder((prev) => shuffleArray(prev));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-gray-800 text-sm">
          {group.name} — Game Sequence
        </span>
        <button
          onClick={handleShuffle}
          className="text-xs font-medium text-red-600 border border-red-200 rounded-full px-3 py-1 hover:bg-red-50 transition-colors"
        >
          Shuffle
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {matches.map((match, i) => (
          <div
            key={i}
            className="border border-gray-100 rounded-lg px-3 py-2 bg-gray-50"
          >
            <p className="text-xs text-gray-400 mb-1">Game {i + 1}</p>
            {match.away ? (
              <p className="text-sm font-medium text-gray-800">
                {match.home} <span className="text-red-500">vs</span> {match.away}
              </p>
            ) : (
              <p className="text-sm font-medium text-gray-500">
                {match.home} <span className="text-gray-400">— Bye</span>
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EventDetail({ event, roster: savedRoster, status: savedStatus, onBack, onSave, onSignOut, onNavigate, activeTab }) {
  const [roster, setRoster] = useState(() => normalizeRoster(savedRoster));
  const [status, setStatus] = useState(savedStatus || "scheduled");
  const navItems = ["Open Play Session", "History of Boss April"];

  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const updateTeamName = (groupIndex, teamIndex, name) => {
    setRoster((prev) => {
      const groups = [...prev.groups];
      const teams = [...groups[groupIndex].teams];
      teams[teamIndex] = { ...teams[teamIndex], name };
      groups[groupIndex] = { ...groups[groupIndex], teams };
      return { ...prev, groups };
    });
  };

  const updatePlayer = (groupIndex, teamIndex, playerIndex, value) => {
    setRoster((prev) => {
      const groups = [...prev.groups];
      const teams = [...groups[groupIndex].teams];
      const players = [...teams[teamIndex].players];
      players[playerIndex] = value;
      teams[teamIndex] = { ...teams[teamIndex], players };
      groups[groupIndex] = { ...groups[groupIndex], teams };
      return { ...prev, groups };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 bg-white border-r border-gray-100 p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-6 px-2">
          <img src="/logo.png" alt="Football Lipa" className="h-8 w-8 object-contain" />
          <span className="font-bold text-gray-800">Football Lipa</span>
        </div>
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => onNavigate(item)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item
                  ? "bg-red-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
        <button
          onClick={onSignOut}
          className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-red-600 border-t border-gray-100 pt-3 mt-3"
        >
          Sign Out
        </button>
      </aside>

      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            {event.title} — {formattedDate}
          </h1>
          <button
            onClick={() => {
              const playerCount = roster.groups.reduce(
                (groupTotal, group) =>
                  groupTotal +
                  group.teams.reduce(
                    (teamTotal, team) =>
                      teamTotal + team.players.filter((p) => p.trim() !== "").length,
                    0
                  ),
                0
              );
              onSave(event.id, roster, status, playerCount);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2 rounded-lg"
          >
            Save
          </button>
        </div>

        {roster.groups.map((group, groupIndex) => (
          <GroupSection
            key={group.name}
            group={group}
            onTeamNameChange={(teamIndex, name) =>
              updateTeamName(groupIndex, teamIndex, name)
            }
            onPlayerChange={(teamIndex, playerIndex, value) =>
              updatePlayer(groupIndex, teamIndex, playerIndex, value)
            }
          />
        ))}

        {roster.groups.map((group) => (
          <GameSequencer key={`sequence-${group.name}`} group={group} />
        ))}
      </main>
    </div>
  );
}