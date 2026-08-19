import { useState } from "react";
import { X, Info, MapPin } from "lucide-react";

export default function CreateAppointmentModal({ onClose, onConfirm }) {
  const [form, setForm] = useState({
    eventName: "Open Play Football",
    location: "Aboitiz Pitch Lipa",
    startTime: "6:00 pm",
    endTime: "8:00 pm",
    date: "",
  });

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="w-full max-w-md bg-white h-full shadow-xl p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Create appointment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2 text-purple-600 font-semibold text-sm mb-4">
          <Info size={16} />
          General information
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Event Name</label>
            <input
              value={form.eventName}
              onChange={update("eventName")}
              className="w-full bg-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Location</label>
            <div className="relative">
              <input
                value={form.location}
                onChange={update("location")}
                className="w-full bg-gray-100 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <MapPin size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Time</label>
              <input
                value={`${form.startTime} to ${form.endTime}`}
                readOnly
                className="w-full bg-gray-100 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={update("date")}
                className="w-full bg-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>
        </div>

        <button
          onClick={() => onConfirm?.(form)}
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-lg"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}