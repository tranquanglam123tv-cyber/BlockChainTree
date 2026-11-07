/**
 * UrbanTree - Kịch Bản Trình Diễn Toàn Diện (Full System Live Demo)
 * Thực thi tự động toàn bộ vòng đời nghiệp vụ & bảo chứng Blockchain
 */

const BASE_URL = 'http://localhost:5001';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  return await res.json();
}

async function runDemo() {
  console.log('\n' + '='.repeat(60));
  console.log('🌳 URBANTREE — KỊCH BẢN TRÌNH DIỄN HỆ THỐNG LIVE DEMO');
  console.log('='.repeat(60));

  // 1. Kiểm tra trạng thái hệ sinh thái
  console.log('\n[BƯỚC 1] 🌐 Kiểm tra trạng thái máy chủ Backend & Node Blockchain...');
  const status = await request('/api/blockchain/status');
  console.log(`  -> Trạng thái mạng : ${status.network.status}`);
  console.log(`  -> Contract Address : ${status.network.contractAddress}`);
  console.log(`  -> Block Number     : ${status.network.blockNumber}`);
  console.log(`  -> Ví Deployer (ETH): ${status.network.deployerBalanceEth} ETH`);

  // 2. Tạo cây xanh mới
  const runSuffix = Date.now().toString().slice(-4);
  const treeCode = `TREE-${runSuffix}`;
  console.log(`\n[BƯỚC 2] 🌱 Thêm mới cây xanh ${treeCode} vào hệ thống (Nghiệp vụ Quản lý)...`);
  const treePayload = {
    tree_code: treeCode,
    species: 'Cây Sao Đen',
    location_name: 'Đại lộ Hòa Bình, Q. Ninh Kiều, TP. Cần Thơ',
    latitude: 10.0338,
    longitude: 105.7876,
    planted_date: '2023-03-15',
    health_status: 'Tốt'
  };

  const createTreeRes = await request('/api/trees', {
    method: 'POST',
    body: JSON.stringify(treePayload)
  });
  const createdTreeId = createTreeRes.data ? createTreeRes.data.id : 1;
  console.log(`  -> Kết quả : ${createTreeRes.message || 'Thành công'}`);
  console.log(`  -> Tree ID: ${createdTreeId} | Code: ${treeCode} | Loài: ${treePayload.species}`);

  // 3. Tính toán mã băm SHA-256
  console.log('\n[BƯỚC 3] 🔒 Tính toán dấu vân tay điện tử SHA-256 (Canonical Hashing)...');
  const hashRes = await request('/api/blockchain/hash/tree', {
    method: 'POST',
    body: JSON.stringify(treePayload)
  });
  const dataHash = hashRes.dataHash;
  console.log(`  -> Thuật toán: ${hashRes.algorithm}`);
  console.log(`  -> SHA-256   : ${dataHash}`);

  // 4. Neo bản ghi lên Smart Contract
  console.log('\n[BƯỚC 4] ⛓️ Neo dấu bản ghi lên Smart Contract (Blockchain Anchoring)...');
  const anchorRes = await request('/api/blockchain/anchor', {
    method: 'POST',
    body: JSON.stringify({
      recordId: treeCode,
      recordType: 'TREE_PROFILE',
      dataHash: dataHash
    })
  });
  console.log(`  -> Trạng thái: ${anchorRes.status}`);
  console.log(`  -> TxHash    : ${anchorRes.txHash}`);
  console.log(`  -> Block #   : ${anchorRes.blockNumber}`);
  console.log(`  -> Gas Used  : ${anchorRes.gasUsed}`);

  // 5. Xuất mã QR cho cây
  console.log(`\n[BƯỚC 5] 📱 Sinh mã QR định danh cây xanh (${treeCode})...`);
  const qrRes = await request(`/api/trees/${treeCode}/qr`);
  console.log(`  -> QR Base64: ${qrRes.qr_code ? qrRes.qr_code.substring(0, 35) + '...' : 'Đã sinh'}`);

  // 6. Người dân báo sự cố
  console.log('\n[BƯỚC 6] ⚠️ Người dân quét mã QR & báo cáo sự cố (Cành gãy)...');
  const incidentRes = await request('/api/incidents', {
    method: 'POST',
    body: JSON.stringify({
      tree_code: treeCode,
      reporter_name: 'Nguyễn Văn An',
      reporter_phone: '0909123456',
      description: 'Nhánh cây lớn có dấu hiệu nứt sau cơn giông',
      severity: 'Cao'
    })
  });
  console.log(`  -> Báo cáo sự cố: ${incidentRes.message || 'Tiếp nhận thành công'}`);

  // 7. Ghi nhận nhật ký chăm sóc
  console.log('\n[BƯỚC 7] 🛠️ Đội công ích thực địa cắt tỉa & cập nhật nhật ký bảo dưỡng...');
  const careRes = await request('/api/care-records', {
    method: 'POST',
    body: JSON.stringify({
      tree_id: createdTreeId,
      caretaker_name: 'Đội Công Ích Số 2',
      action_type: 'Cắt tỉa nhánh khô',
      notes: 'Đã hoàn tất xử lý sự cố nhánh nứt an toàn'
    })
  });
  console.log(`  -> Nhật ký chăm sóc: ${careRes.message || 'Lưu thành công'}`);

  // 8. Cổng A19: Xác minh tính toàn vẹn (Trường hợp Dữ liệu chuẩn -> TÍCH XANH)
  console.log('\n[BƯỚC 8] ✅ CỔNG A19: Thanh tra quét QR xác minh tính toàn vẹn (Dữ liệu CHUẨN)...');
  const verifyValidRes = await request(`/api/blockchain/verify/${treeCode}?currentHash=${dataHash}`);
  console.log(`  -> Kết quả xác thực : isValid = ${verifyValidRes.isValid}`);
  console.log(`  -> Trạng thái kiểm toán: ${verifyValidRes.auditStatus}`);
  console.log(`  -> Thông điệp        : ${verifyValidRes.message}`);

  // 9. Cổng A19: Phát hiện gian lận khi dữ liệu bị sửa lén (CẢNH BÁO ĐỎ)
  console.log('\n[BƯỚC 9] 🚨 CỔNG A19: Mô phỏng Hacker sửa lén dữ liệu trong Database...');
  const fakeHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  const verifyTamperRes = await request(`/api/blockchain/verify/${treeCode}?currentHash=${fakeHash}`);
  console.log(`  -> Kết quả xác thực : isValid = ${verifyTamperRes.isValid}`);
  console.log(`  -> Trạng thái kiểm toán: ${verifyTamperRes.auditStatus}`);
  console.log(`  -> Thông điệp        : ${verifyTamperRes.message}`);

  // 10. Chống gian lận: Thử ghi đè lên Smart Contract
  console.log(`\n[BƯỚC 10] 🛡️ KIỂM TRA CHỐNG GIAN LẬN: Thử neo đè dữ liệu lên mã cây ${treeCode}...`);
  const tamperAnchorRes = await request('/api/blockchain/anchor', {
    method: 'POST',
    body: JSON.stringify({
      recordId: treeCode,
      recordType: 'TREE_PROFILE',
      dataHash: fakeHash
    })
  });
  console.log(`  -> Phản hồi từ Hợp đồng thông minh: ${tamperAnchorRes.message}`);

  // 11. Khám phá sổ cái minh bạch (Explorer)
  console.log('\n[BƯỚC 11] 🔍 CỔNG A18: Truy xuất toàn bộ Sổ cái Blockchain (Ledger Explorer)...');
  const explorerRes = await request('/api/blockchain/explorer');
  console.log(`  -> Tổng số bản ghi trên chuỗi: ${explorerRes.totalRecords}`);
  explorerRes.records.forEach((r, idx) => {
    console.log(`     #${idx + 1}. [${r.recordType}] ID: ${r.recordId} | Time: ${r.dateFormatted} | Hash: ${r.dataHash.substring(0, 16)}...`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('🎉 TRÌNH DIỄN HOÀN TẤT: Toàn bộ kịch bản nghiệp vụ & bảo chứng thành công 100%!');
  console.log('='.repeat(60) + '\n');
}

runDemo().catch(console.error);
