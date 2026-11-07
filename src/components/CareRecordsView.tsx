import React, { useState } from 'react';
import {
  ClipboardList,
  Plus,
  ShieldCheck,
  Trees,
  CheckCircle2,
  Calendar,
  UserCheck,
  Search,
  Filter,
} from 'lucide-react';
import { storage } from '../db/storage';
import { CareActionType, CareRecord, TreeHealthStatus } from '../types';

interface CareRecordsViewProps {
  onOpenCareModal: (treeId?: string) => void;
  onSelectTree: (tree: any) => void;
}

export const CareRecordsView: React.FC<CareRecordsViewProps> = ({
  onOpenCareModal,
  onSelectTree,
}) => {
  const careRecords = storage.getCareRecords();
  const trees = storage.getTrees();

  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');

  const filteredCare = careRecords.filter((care) => {
    const tree = trees.find((t) => t.id === care.treeId);
    const matchesSearch =
      (tree && tree.publicCode.toLowerCase().includes(search.toLowerCase())) ||
      (tree && tree.displayName.toLowerCase().includes(search.toLowerCase())) ||
      care.notes.toLowerCase().includes(search.toLowerCase()) ||
      (care.staffName && care.staffName.toLowerCase().includes(search.toLowerCase()));

    const matchesAction = selectedAction === 'ALL' || care.actionType === selectedAction;

    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#174B36] flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-[#347A50]" />
            <span>Nhật ký Chăm sóc & Bảo dưỡng Cây xanh</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ghi nhận tiến trình cắt tỉa, tưới nước, bón phân, phòng trừ sâu bệnh. Dữ liệu được băm SHA-256 chống sửa đổi.
          </p>
        </div>

        <button
          onClick={() => onOpenCareModal()}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#174B36] hover:bg-[#347A50] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Ghi chăm sóc mới</span>
        </button>
      </div>

      {/* Filter and search */}
      <div className="p-3 bg-white rounded-xl border border-[#E0EBDD] shadow-2xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã cây, tên nhân viên, ghi chú..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:border-[#347A50] focus:ring-1 focus:ring-[#347A50]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Hoạt động:</span>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
          >
            <option value="ALL">Tất cả hoạt động</option>
            <option value="WATERING">Tưới nước</option>
            <option value="PRUNING">Cắt tỉa cành</option>
            <option value="FERTILIZING">Bón phân</option>
            <option value="PEST_CONTROL">Xử lý sâu bệnh</option>
            <option value="SURVEY">Khảo sát độ nghiêng/sâu mọt</option>
            <option value="SUPPORT_STAKE">Chống cọc đỡ</option>
          </select>
        </div>
      </div>

      {/* Care Records Feed */}
      {filteredCare.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
          Chưa có bản ghi chăm sóc nào phù hợp.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCare.map((care) => {
            const tree = trees.find((t) => t.id === care.treeId);
            return (
              <div
                key={care.id}
                className="bg-white p-4 rounded-xl border border-[#E0EBDD] shadow-2xs hover:border-[#347A50] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {tree && (
                      <button
                        onClick={() => onSelectTree(tree)}
                        className="font-mono text-xs font-bold text-[#174B36] bg-[#E0EBDD] px-2 py-0.5 rounded hover:bg-[#d0dfcc] transition-colors"
                      >
                        {tree.publicCode}
                      </button>
                    )}
                    <span className="text-xs font-bold text-slate-800">
                      {tree?.displayName || 'Cây xanh'}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#174B36] text-white">
                      {care.actionType}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500 font-mono">
                      {new Date(care.performedAt).toLocaleDateString('vi-VN')} {new Date(care.performedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">{care.notes}</p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Thực hiện: <strong>{care.staffName || 'Đội kỹ thuật'}</strong></span>
                    </span>
                    <span>
                      Chuyển biến sức khỏe: <strong className="text-slate-700">{care.healthBefore}</strong> ➔ <strong className="text-emerald-700">{care.healthAfter}</strong>
                    </span>
                  </div>
                </div>

                {/* Blockchain Badge on Right */}
                <div className="shrink-0 flex md:flex-col items-end justify-between md:justify-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-mono text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>CONFIRMED</span>
                  </div>
                  {care.txHash && (
                    <span className="text-[10px] text-slate-400 font-mono truncate max-w-[130px]" title={care.txHash}>
                      {care.txHash}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
