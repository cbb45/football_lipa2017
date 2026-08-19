import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

function generateDefaultRoster() {
  const makeTeams = () =>
    Array.from({ length: 6 }, () => ({
      name: "Team",
      players: ["", "", "", "", ""],
    }));

  return {
    groups: [
      { name: "Chill Open Play", teams: makeTeams() },
      { name: "Competitive Open Play", teams: makeTeams() },
    ],
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
export default function EventDetail({ event, roster: savedRoster, status: savedStatus, onBack, onSave, onSignOut, onNavigate, activeTab }) {
  const [roster, setRoster] = useState(savedRoster || generateDefaultRoster());
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
      </main>
    </div>
  );
}