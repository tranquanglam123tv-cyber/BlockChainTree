import React, { useState } from 'react';
import {
  Trees,
  Search,
  Filter,
  Plus,
  QrCode,
  ShieldCheck,
  MapPin,
  ExternalLink,
  ClipboardList,
  Edit,
  LayoutGrid,
  List,
} from 'lucide-react';
import { Tree, TreeHealthStatus } from '../types';
import { storage } from '../db/storage';

interface TreeListViewProps {
  onSelectTree: (tree: Tree) => void;
  onOpenQrModal: (tree: Tree) => void;
  onOpenAddTree: () => void;
  onOpenEditTree: (tree: Tree) => void;
  onOpenCareModal: (treeId: string) => void;
  onOpenPublicView: (tree: Tree) => void;
}

export const TreeListView: React.FC<TreeListViewProps> = ({
  onSelectTree,
  onOpenQrModal,
  onOpenAddTree,
  onOpenEditTree,
  onOpenCareModal,
  onOpenPublicView,
}) => {
  const trees = storage.getTrees();
  const treeTypes = storage.getTreeTypes();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedHealth, setSelectedHealth] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filteredTrees = trees.filter((tree) => {
    const matchesSearch =
      tree.publicCode.toLowerCase().includes(search.toLowerCase()) ||
      tree.displayName.toLowerCase().includes(search.toLowerCase()) ||
      tree.address.toLowerCase().includes(search.toLowerCase());

    const matchesType = selectedType === 'ALL' || tree.treeTypeId === selectedType;
    const matchesHealth = selectedHealth === 'ALL' || tree.healthStatus === selectedHealth;

    return matchesSearch && matchesType && matchesHealth;
  });

  return (
    <div className="space-y-5">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#174B36] flex items-center gap-2">
            <Trees className="w-6 h-6 text-[#347A50]" />
            <span>Danh mục & Hồ sơ Cây xanh Đô thị</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Mỗi cây xanh được gán mã định danh duy nhất và bảo chứng tính toàn vẹn trên Smart Contract.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              title="Chế độ lưới"
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'grid' ? 'bg-white text-[#174B36] shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Chế độ bảng"
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'table' ? 'bg-white text-[#174B36] shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenAddTree}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#174B36] hover:bg-[#347A50] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm cây mới</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3 bg-white rounded-xl border border-[#E0EBDD] shadow-2xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã cây (TREE-001), tên, hoặc địa chỉ..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:border-[#347A50] focus:ring-1 focus:ring-[#347A50]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Loài cây:</span>
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
          >
            <option value="ALL">Tất cả các loài</option>
            {treeTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-2">
            <span>Sức khỏe:</span>
          </div>
          <select
            value={selectedHealth}
            onChange={(e) => setSelectedHealth(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="GOOD">Tốt (GOOD)</option>
            <option value="FAIR">Bình thường (FAIR)</option>
            <option value="POOR">Kém (POOR)</option>
            <option value="CRITICAL">Nguy cấp (CRITICAL)</option>
            <option value="DEAD">Chết khô (DEAD)</option>
          </select>

          <span className="text-xs text-slate-400 font-mono pl-2">
            {filteredTrees.length}/{trees.length} cây
          </span>
        </div>
      </div>

      {/* Main Trees Display */}
      {filteredTrees.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
          Không tìm thấy cây xanh nào phù hợp với bộ lọc tìm kiếm.
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTrees.map((tree) => {
            const treeType = treeTypes.find((t) => t.id === tree.treeTypeId);
            return (
              <div
                key={tree.id}
                className="bg-white rounded-xl border border-[#E0EBDD] overflow-hidden shadow-2xs hover:shadow-md hover:border-[#347A50] transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Card Image Banner */}
                  <div className="h-36 bg-slate-100 relative overflow-hidden">
                    <img
                      src={tree.imageUrl || 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=600&q=80'}
                      alt={tree.displayName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-[#174B36]/90 backdrop-blur-xs text-[#F3E8B2] font-mono text-xs font-bold shadow-2xs">
                      {tree.publicCode}
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs ${
                          tree.healthStatus === 'GOOD'
                            ? 'bg-emerald-500 text-white'
                            : tree.healthStatus === 'FAIR'
                            ? 'bg-slate-700 text-white'
                            : tree.healthStatus === 'POOR'
                            ? 'bg-amber-500 text-white'
                            : 'bg-red-600 text-white'
                        }`}
                      >
                        {tree.healthStatus}
                      </span>
                    </div>

                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-white drop-shadow-md">
                      <span className="bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
                        {treeType?.name}
                      </span>
                      <span className="bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs font-mono">
                        Trồng: {tree.plantedAt}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-2.5">
                    <div>
                      <h3
                        onClick={() => onSelectTree(tree)}
                        className="text-sm font-bold text-slate-900 group-hover:text-[#174B36] cursor-pointer transition-colors"
                      >
                        {tree.displayName}
                      </h3>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#347A50] shrink-0" />
                        <span className="truncate">{tree.address}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                      <span>ĐK: {tree.diameterCm || 30}cm · Cao: {tree.heightM || 8}m</span>
                      <div className="flex items-center gap-1 text-[#347A50] font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>ANCHORED</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-1.5 text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenQrModal(tree)}
                      title="Mã QR định danh"
                      className="p-1.5 text-[#174B36] hover:bg-[#E0EBDD] rounded-lg transition-colors"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onOpenPublicView(tree)}
                      title="Xem trang công khai"
                      className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onOpenEditTree(tree)}
                      title="Sửa thông tin"
                      className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenCareModal(tree.id)}
                      className="px-2.5 py-1 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md font-medium text-[11px]"
                    >
                      Chăm sóc
                    </button>
                    <button
                      onClick={() => onSelectTree(tree)}
                      className="px-2.5 py-1 bg-[#174B36] hover:bg-[#347A50] text-white rounded-md font-semibold text-[11px]"
                    >
                      Chi tiết
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* High-Density Table View */
        <div className="bg-white rounded-xl border border-[#E0EBDD] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Mã QR</th>
                  <th className="py-3 px-4">Tên & Loài cây</th>
                  <th className="py-3 px-4">Vị trí địa lý</th>
                  <th className="py-3 px-4">Sức khỏe</th>
                  <th className="py-3 px-4">Kích thước</th>
                  <th className="py-3 px-4">Blockchain</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTrees.map((tree) => {
                  const treeType = treeTypes.find((t) => t.id === tree.treeTypeId);
                  return (
                    <tr key={tree.id} className="hover:bg-[#F8FAF8] transition-colors">
                      <td className="py-3 px-4">
                        <button
                          onClick={() => onOpenQrModal(tree)}
                          className="flex items-center gap-1.5 font-mono font-bold text-[#174B36] hover:underline"
                        >
                          <QrCode className="w-3.5 h-3.5 text-[#347A50]" />
                          <span>{tree.publicCode}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{tree.displayName}</div>
                        <div className="text-[11px] text-slate-400">{treeType?.name}</div>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-600">
                        {tree.address}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            tree.healthStatus === 'GOOD'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tree.healthStatus === 'FAIR'
                              ? 'bg-slate-100 text-slate-700'
                              : tree.healthStatus === 'POOR'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {tree.healthStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {tree.diameterCm || 30}cm / {tree.heightM || 8}m
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold font-mono">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>CONFIRMED</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => onSelectTree(tree)}
                          className="px-2 py-1 text-slate-700 hover:bg-slate-100 rounded text-[11px] font-medium"
                        >
                          Xem
                        </button>
                        <button
                          onClick={() => onOpenCareModal(tree.id)}
                          className="px-2 py-1 bg-[#174B36] text-white hover:bg-[#347A50] rounded text-[11px] font-medium"
                        >
                          Chăm sóc
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
