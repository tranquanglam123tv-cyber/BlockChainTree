import React, { useState } from 'react';
import { X, QrCode, Search, Camera, CheckCircle2, ArrowRight } from 'lucide-react';
import { storage } from '../db/storage';
import { Tree } from '../types';

interface QRScannerModalProps {
  onClose: () => void;
  onTreeScanned: (tree: Tree) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ onClose, onTreeScanned }) => {
  const trees = storage.getTrees();
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const clean = manualCode.trim().toUpperCase();
    const tree = storage.getTreeByPublicCode(clean);
    if (tree) {
      onTreeScanned(tree);
      onClose();
    } else {
      setError(`Không tìm thấy cây với mã "${manualCode}". Vui lòng thử lại.`);
    }
  };

  const handleSelectDemoTree = (tree: Tree) => {
    onTreeScanned(tree);
    onClose();
  };

  const handleSimulateCameraScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      // Pick TREE-001 by default
      const tree = trees[0];
      if (tree) {
        setIsScanning(false);
        onTreeScanned(tree);
        onClose();
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-[#E0EBDD] animate-in fade-in zoom-in-95 duration-150 text-xs">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#E0EBDD] text-[#174B36] rounded-lg">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#174B36]">Quét / Tra cứu Mã QR Cây xanh</h2>
              <p className="text-[11px] text-slate-500">Mở hồ sơ cây thực tế hoặc báo cáo sự cố</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Camera Simulation Viewfinder */}
          <div className="relative aspect-square rounded-2xl bg-slate-900 overflow-hidden flex flex-col items-center justify-center text-center p-6 text-white border-2 border-slate-800">
            {/* Viewfinder Target Borders */}
            <div className="absolute inset-8 border-2 border-dashed border-[#F3E8B2]/60 rounded-xl pointer-events-none flex items-center justify-center">
              {isScanning && (
                <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-bounce" />
              )}
            </div>

            <Camera className="w-10 h-10 text-white/50 mb-2" />
            <div className="font-bold text-sm">
              {isScanning ? 'Đang nhận diện mã QR...' : 'Hướng camera vào mã QR trên thân cây'}
            </div>
            <p className="text-[11px] text-white/60 max-w-xs mt-1">
              Hệ thống tự động đọc mã định danh publicCode và mở hồ sơ kiểm chứng
            </p>

            <button
              onClick={handleSimulateCameraScan}
              disabled={isScanning}
              className="mt-4 px-4 py-2 bg-[#347A50] hover:bg-[#4C956C] text-white font-bold rounded-xl text-xs transition-colors shadow-md"
            >
              {isScanning ? 'Đang quét...' : 'Mô phỏng quét mã thực địa'}
            </button>
          </div>

          {/* Manual Input Form */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-700">Hoặc nhập mã công khai thủ công:</div>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Ví dụ: TREE-001"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold text-[#174B36] uppercase"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#174B36] hover:bg-[#347A50] text-white font-semibold rounded-lg shrink-0"
              >
                Mở cây
              </button>
            </form>

            {error && <div className="p-2 rounded bg-red-50 text-red-600 text-[11px]">{error}</div>}
          </div>

          {/* Quick Select Demo Trees */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="text-[11px] text-slate-500 font-semibold">Chọn nhanh cây mẫu thử nghiệm:</div>
            <div className="grid grid-cols-2 gap-2">
              {trees.slice(0, 4).map((tree) => (
                <button
                  key={tree.id}
                  onClick={() => handleSelectDemoTree(tree)}
                  className="p-2 rounded-lg bg-slate-50 hover:bg-[#E0EBDD] hover:text-[#174B36] text-slate-700 border border-slate-200 text-left transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="font-mono font-bold text-[11px]">{tree.publicCode}</div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[120px]">{tree.displayName}</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
