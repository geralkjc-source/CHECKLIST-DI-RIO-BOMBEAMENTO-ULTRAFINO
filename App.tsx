
import React, { useState, useEffect, useCallback } from 'react';
import { INITIAL_GROUPS } from './constants';
import { DailyReport, EquipmentGroup, Equipment, EquipmentStatus } from './types';
import EquipmentRow from './components/EquipmentRow';
import { formatReportToText } from './utils/formatter';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const App: React.FC = () => {
  const [report, setReport] = useState<DailyReport>({
    id: crypto.randomUUID(),
    date: new Date().toLocaleDateString('pt-BR'),
    shift: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    team: 'C',
    operator: '',
    groups: INITIAL_GROUPS,
    observations: '',
    createdAt: Date.now()
  });

  const [savedReports, setSavedReports] = useState<DailyReport[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('pumping_reports');
    if (saved) {
      setSavedReports(JSON.parse(saved));
    }
  }, []);

  const handleUpdateItem = (groupIndex: number, updatedItem: Equipment) => {
    const newGroups = [...report.groups];
    const itemIndex = newGroups[groupIndex].items.findIndex(i => i.id === updatedItem.id);
    newGroups[groupIndex].items[itemIndex] = updatedItem;
    setReport(prev => ({ ...prev, groups: newGroups }));
  };

  const handleSave = () => {
    const newSaved = [report, ...savedReports].slice(0, 10);
    setSavedReports(newSaved);
    localStorage.setItem('pumping_reports', JSON.stringify(newSaved));
    alert('Relatório salvo localmente!');
  };

  const handleCopy = () => {
    const text = formatReportToText(report);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const calculateStats = () => {
    const stats = {
      [EquipmentStatus.RUNNING]: 0,
      [EquipmentStatus.STOPPED]: 0,
      [EquipmentStatus.STANDBY]: 0,
      [EquipmentStatus.ANOMALY]: 0,
    };
    report.groups.forEach(g => g.items.forEach(i => stats[i.status]++));
    return [
      { name: 'Rodando', value: stats[EquipmentStatus.RUNNING], color: '#22c55e' },
      { name: 'Parado', value: stats[EquipmentStatus.STOPPED], color: '#ef4444' },
      { name: 'Standby', value: stats[EquipmentStatus.STANDBY], color: '#eab308' },
      { name: 'Anomalia', value: stats[EquipmentStatus.ANOMALY], color: '#f97316' },
    ].filter(s => s.value > 0);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Navbar */}
      <nav className="bg-indigo-900 text-white p-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-white p-1 rounded">
              <svg className="w-6 h-6 text-indigo-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Smart Pumping Flow</h1>
          </div>
          <button 
            onClick={() => setShowPreview(!showPreview)}
            className="bg-indigo-700 hover:bg-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            {showPreview ? 'Editar Dados' : 'Ver Relatório'}
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-4 lg:p-6">
        {!showPreview ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Info */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Data</label>
                  <input 
                    type="text" 
                    value={report.date} 
                    onChange={e => setReport(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full border-slate-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Turno</label>
                  <input 
                    type="text" 
                    value={report.shift} 
                    onChange={e => setReport(prev => ({ ...prev, shift: e.target.value }))}
                    className="w-full border-slate-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Turma</label>
                  <input 
                    type="text" 
                    value={report.team} 
                    onChange={e => setReport(prev => ({ ...prev, team: e.target.value }))}
                    className="w-full border-slate-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Operador</label>
                  <input 
                    type="text" 
                    placeholder="Nome..."
                    value={report.operator} 
                    onChange={e => setReport(prev => ({ ...prev, operator: e.target.value }))}
                    className="w-full border-slate-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Equipment Groups */}
              <div className="space-y-4">
                {report.groups.map((group, gIdx) => (
                  <div key={group.name} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                      <h3 className="text-sm font-bold text-slate-700">{group.name}</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {group.items.map((item) => (
                        <EquipmentRow 
                          key={item.id} 
                          item={item} 
                          onUpdate={(updated) => handleUpdateItem(gIdx, updated)} 
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Observations */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Observações Adicionais</label>
                <textarea 
                  rows={4}
                  value={report.observations}
                  onChange={e => setReport(prev => ({ ...prev, observations: e.target.value }))}
                  placeholder="Descreva problemas, manutenções ou avisos importantes..."
                  className="w-full border-slate-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Saúde do Parque
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={calculateStats()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {calculateStats().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleSave}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Salvar Rascunho
                </button>
                <button 
                  onClick={handleCopy}
                  className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Copiado!
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Copiar Relatório
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
                <h2 className="font-bold">Visualização do Relatório</h2>
                <button onClick={() => setShowPreview(false)} className="text-slate-400 hover:text-white text-sm">Voltar</button>
              </div>
              <div className="p-8 bg-slate-100">
                <pre className="bg-white p-6 rounded-lg border border-slate-200 whitespace-pre-wrap text-sm font-mono text-slate-800 shadow-inner">
                  {formatReportToText(report)}
                </pre>
              </div>
              <div className="p-4 border-t flex justify-end gap-3 bg-white">
                <button 
                  onClick={handleCopy}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-md flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {copied ? 'Copiado!' : 'Copiar para WhatsApp/Email'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer / Status bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 text-center text-[10px] text-slate-400">
        Desenvolvido para Gestão de Bombeamento Ultrafino | © 2026
      </footer>
    </div>
  );
};

export default App;
