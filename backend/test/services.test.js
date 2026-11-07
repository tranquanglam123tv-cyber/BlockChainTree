const { expect } = require('chai');
const hashService = require('../src/services/hashService');

describe('🔒 Cryptographic Hash Service Tests (LAM-03)', function () {
    const sampleTree1 = {
        tree_code: 'TREE-001',
        species: 'Cây Bàng Đài Loan',
        location_name: 'Công viên 23/9, Q.1, TP.HCM',
        latitude: 10.7684,
        longitude: 106.6934,
        planted_date: '2023-01-15'
    };

    const sampleTreeTampered = {
        tree_code: 'TREE-001',
        species: 'Cây Bàng Đài Loan (Đã bị sửa lén)',
        location_name: 'Công viên 23/9, Q.1, TP.HCM',
        latitude: 10.7684,
        longitude: 106.6934,
        planted_date: '2023-01-15'
    };

    it('Mã băm SHA-256 sinh ra phải có đúng 64 ký tự hex', function () {
        const hash = hashService.hashTreeProfile(sampleTree1);
        expect(hash).to.be.a('string');
        expect(hash).to.have.lengthOf(64);
        expect(/^[a-f0-9]{64}$/.test(hash)).to.be.true;
    });

    it('Cùng một dữ liệu đầu vào phải sinh ra mã băm đồng nhất 100% (Deterministic)', function () {
        const hash1 = hashService.hashTreeProfile(sampleTree1);
        const hash2 = hashService.hashTreeProfile(sampleTree1);
        expect(hash1).to.equal(hash2);
    });

    it('Dữ liệu chỉ cần thay đổi 1 ký tự thì mã băm phải hoàn toàn khác biệt (Avalanche effect)', function () {
        const hashOriginal = hashService.hashTreeProfile(sampleTree1);
        const hashTampered = hashService.hashTreeProfile(sampleTreeTampered);
        expect(hashOriginal).to.not.equal(hashTampered);
    });

    it('Băm nhật ký chăm sóc (CARE_LOG) phải hoạt động chính xác', function () {
        const careLog = {
            tree_id: 1,
            caretaker_name: 'Tổ Chăm Sóc 3',
            action_type: 'Cắt tỉa',
            action_date: '2026-11-04 10:00:00'
        };
        const hash = hashService.hashCareLog(careLog);
        expect(hash).to.have.lengthOf(64);
    });

    it('Băm báo cáo sự cố (INCIDENT_REPORT) phải hoạt động chính xác', function () {
        const incident = {
            id: 12,
            tree_id: 1,
            severity: 'Khẩn cấp',
            status: 'Đã hoàn thành',
            resolved_at: '2026-11-04 14:00:00'
        };
        const hash = hashService.hashIncidentReport(incident);
        expect(hash).to.have.lengthOf(64);
    });
});
