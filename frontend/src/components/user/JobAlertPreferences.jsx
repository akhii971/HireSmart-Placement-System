import { useDispatch, useSelector } from "react-redux";
import {
  setPreferences,
  toggleMute,
  snoozeForHours,
  clearSnooze,
} from "../../redux/user/notificationsSlice";

export default function JobAlertPreferences() {
  const dispatch = useDispatch();
  const { preferences, muted, snoozedUntil } = useSelector(
    (s) => s.userNotifications
  );

  const updatePref = (key, value) => {
    dispatch(
      setPreferences({
        ...preferences,
        [key]: value,
      })
    );
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow border space-y-4">
      <h3 className="font-bold text-lg">🔔 Job Alert Preferences</h3>

      <div className="flex flex-col gap-3 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={preferences.onlyInternships}
            onChange={(e) => updatePref("onlyInternships", e.target.checked)}
          />
          Only Internships
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={preferences.onlyRemote}
            onChange={(e) => updatePref("onlyRemote", e.target.checked)}
          />
          Only Remote Jobs
        </label>

        <div>
          <p className="font-semibold mb-1">Skill-based Alerts</p>
          <input
            value={preferences.skills.join(", ")}
            onChange={(e) =>
              updatePref(
                "skills",
                e.target.value.split(",").map((s) => s.trim())
              )
            }
            className="w-full border rounded-lg px-3 py-2"
            placeholder="React, Node, MongoDB"
          />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => dispatch(toggleMute())}
          className={`px-4 py-2 rounded-lg text-sm font-semibold ${
            muted ? "bg-red-500 text-white" : "bg-slate-200"
          }`}
        >
          {muted ? "Muted" : "Mute Alerts"}
        </button>

        <button
          onClick={() => dispatch(snoozeForHours(24))}
          className="px-4 py-2 rounded-lg bg-yellow-500 text-white text-sm font-semibold"
        >
          Snooze 24h
        </button>

        <button
          onClick={() => dispatch(clearSnooze())}
          className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-semibold"
        >
          Clear Snooze
        </button>
      </div>

      {snoozedUntil && (
        <p className="text-xs text-slate-500">
          Snoozed until: {new Date(snoozedUntil).toLocaleString()}
        </p>
      )}
    </div>
  );
}
