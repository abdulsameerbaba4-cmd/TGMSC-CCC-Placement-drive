import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import { AutomationRule } from '../../types/index.ts';
import {
  Zap,
  Play,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  Bell,
  ShieldCheck,
} from 'lucide-react';

export const AutomationCenter: React.FC = () => {
  const [automations, setAutomations] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggeringId, setTriggeringId] = useState<string | null>(null);

  useEffect(() => {
    fetchAutomations();
  }, []);

  const fetchAutomations = async () => {
    try {
      setLoading(true);
      const data = await api.getAutomations();
      setAutomations(data);
    } catch (e) {
      console.error('Failed fetching automations', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunTrigger = async (id: string) => {
    try {
      setTriggeringId(id);
      const res = await api.triggerAutomation(id);
      alert(res.message);
      fetchAutomations();
    } catch (e) {
      console.error('Error running automation trigger', e);
    } finally {
      setTriggeringId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-600" />
            Placement Workflow Automation Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated event-driven dispatchers for application deadlines, proctored anomalies, and interview invites
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {automations.map((auto) => (
          <div
            key={auto.id}
            className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{auto.name}</h3>
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Status: {auto.status}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleRunTrigger(auto.id)}
                  disabled={triggeringId === auto.id}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  <Play className="w-3 h-3 fill-indigo-700" />
                  {triggeringId === auto.id ? 'Running...' : 'Execute Now'}
                </button>
              </div>

              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                {auto.description}
              </p>

              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Trigger Condition:</span>
                  <strong className="text-slate-900 font-medium">{auto.trigger}</strong>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Last Executed:</span>
                  <span className="text-slate-700 font-mono text-[11px]">
                    {new Date(auto.lastExecuted).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Next Scheduled:</span>
                  <span className="text-indigo-600 font-medium">{auto.nextExecution}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Automatic Background Job</span>
              <span className="font-bold text-slate-800">
                {auto.actionsTakenCount} actions recorded
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
