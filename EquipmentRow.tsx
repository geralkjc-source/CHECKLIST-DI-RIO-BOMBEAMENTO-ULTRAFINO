
import React from 'react';
import { Equipment, EquipmentStatus } from '../types';

interface EquipmentRowProps {
  item: Equipment;
  onUpdate: (updated: Equipment) => void;
}

const EquipmentRow: React.FC<EquipmentRowProps> = ({ item, onUpdate }) => {
  const statuses = [
    { value: EquipmentStatus.RUNNING, color: 'bg-green-100 text-green-700 border-green-200' },
    { value: EquipmentStatus.STOPPED, color: 'bg-red-100 text-red-700 border-red-200' },
    { value: EquipmentStatus.STANDBY, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    { value: EquipmentStatus.ANOMALY, color: 'bg-orange-100 text-orange-700 border-orange-200' },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border-b last:border-b-0 gap-3 hover:bg-gray-50 transition-colors">
      <div className="flex flex-col">
        <span className="font-mono font-semibold text-gray-800">{item.tag}</span>
        <input
          type="text"
          value={item.comment || ''}
          placeholder="Adicionar observação..."
          onChange={(e) => onUpdate({ ...item, comment: e.target.value })}
          className="text-xs text-gray-500 mt-1 outline-none border-none bg-transparent focus:ring-0 placeholder-gray-400"
        />
      </div>
      <div className="flex gap-1">
        {statuses.map((s) => (
          <button
            key={s.value}
            onClick={() => onUpdate({ ...item, status: s.value })}
            className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all ${
              item.status === s.value ? `${s.color} scale-110 shadow-sm border-current` : 'border-transparent opacity-40 hover:opacity-100'
            }`}
          >
            {s.value}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EquipmentRow;
