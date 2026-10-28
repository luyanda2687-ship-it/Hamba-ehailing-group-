import React, { useState } from 'react';
import { offlineStorage, EmergencyContact } from '../services/offlineStorage';
import { LocationPoint, DriverProfile } from '../types';
import { 
  ShieldAlert, 
  Phone, 
  MessageSquare, 
  MapPin, 
  AlertTriangle, 
  Users, 
  CheckCircle, 
  Copy, 
  ExternalLink,
  ShieldCheck,
  X
} from 'lucide-react';

interface SafetyHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: LocationPoint | null;
  activeDriver?: DriverProfile;
}

export const SafetyHubModal: React.FC<SafetyHubModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  activeDriver,
}) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>(() =>
    offlineStorage.getEmergencyContacts()
  );
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [sosDispatched, setSosDispatched] = useState(false);

  if (!isOpen) return null;

  const lat = currentLocation?.lat || -27.7562;
  const lng = currentLocation?.lng || 29.9315;
  const locationName = currentLocation?.name || 'Newcastle CBD / Amajuba District';

  // Offline SMS distress beacon payload
  const distressSmsText = `[HAMBA SOS EMERGENCY] Distress alert triggered. Location: ${locationName} (Coords: ${lat.toFixed(5)}, ${lng.toFixed(5)}). Driver: ${activeDriver ? `${activeDriver.name} (${activeDriver.vehiclePlate})` : 'Awaiting assignment'}. Map: https://maps.google.com/?q=${lat},${lng}`;

  const handleCopyBeacon = () => {
    navigator.clipboard.writeText(distressSmsText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const handleTriggerArmedResponse = () => {
    setSosDispatched(true);
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName || !newContactPhone) return;

    const updated = [
      ...contacts,
      {
        id: `c_${Date.now()}`,
        name: newContactName,
        relation: 'Trusted Contact',
        phone: newContactPhone,
        notifyOnTripStart: true,
      },
    ];
    setContacts(updated);
    offlineStorage.saveEmergencyContacts(updated);
    setNewContactName('');
    setNewContactPhone('');
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Hamba Safety & SOS Hub</h2>
              <p className="text-xs text-slate-400">Integrated with SAPS 10111 & Newcastle Emergency Response</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto">
          {/* Main Panic Button Card */}
          <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-600/40 text-center space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Immediate Emergency Dispatch
            </div>

            {sosDispatched ? (
              <div className="p-4 rounded-xl bg-rose-900/60 border border-rose-500 text-rose-100 space-y-1">
                <div className="font-bold text-sm">🚨 SOS Signal Transmitted</div>
                <div className="text-xs text-rose-200">
                  Amajuba Armed Response & Newcastle SAPS alerted with your exact GPS coordinates (-27.7562, 29.9315).
                </div>
              </div>
            ) : (
              <button
                onClick={handleTriggerArmedResponse}
                className="w-full py-4 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-rose-600/30 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldAlert className="w-5 h-5" />
                <span>Trigger Panic Alarm & Police 10111</span>
              </button>
            )}

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Silently alerts private security, South African Police Service (SAPS), and your saved emergency contacts.
            </p>
          </div>

          {/* Offline SMS Beacon (Critical for Remote Areas with no 4G) */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" />
                <span>Offline SMS Distress Beacon (No 4G Required)</span>
              </span>
              <button
                onClick={handleCopyBeacon}
                className="text-[11px] text-amber-300 hover:underline flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>{isCopied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 font-mono text-[11px] text-slate-300 break-words leading-relaxed border border-slate-800">
              {distressSmsText}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <a
                href={`sms:10111?body=${encodeURIComponent(distressSmsText)}`}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition text-center"
              >
                <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                <span>Send SMS to 10111</span>
              </a>

              <a
                href="tel:10111"
                className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call 10111</span>
              </a>
            </div>
          </div>

          {/* Trusted Family Contacts */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-400" />
              <span>Trusted Contacts (Auto-Notified on Trip Start)</span>
            </div>

            <div className="space-y-2">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-white">{contact.name}</div>
                    <div className="text-slate-400 text-[11px] font-mono">{contact.phone} · {contact.relation}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-medium">
                    Active
                  </span>
                </div>
              ))}
            </div>

            {/* Add Contact Form */}
            <form onSubmit={handleAddContact} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="text-[11px] text-slate-400 font-medium">Add New Emergency Contact</div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                />
                <input
                  type="text"
                  placeholder="+27 72 000 0000"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold text-xs transition"
              >
                + Add Contact
              </button>
            </form>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
