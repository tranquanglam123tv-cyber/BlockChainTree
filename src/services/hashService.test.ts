import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildTreePayload,
  buildCareRecordPayload,
  canonicalize,
  computeRecordHash,
  sha256Hex,
} from './hashService';

test('sha256Hex matches known test vectors', () => {
  // Empty string SHA-256
  assert.equal(
    sha256Hex(''),
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  );

  // 'UrbanTree'
  assert.equal(
    sha256Hex('UrbanTree'),
    'd935554e4cb46c708c9a8f0f805ece10a241c44fa78c064f5b8bf9643f49749f'
  );
});

test('canonicalize produces deterministic compact single-line JSON', () => {
  const tree = {
    id: 'tree-001',
    publicCode: 'TREE-001',
    treeTypeId: 'type-bang',
    displayName: 'Cây Bàng Đài Loan',
    address: 'Công viên Tao Đàn, Quận 1',
    latitude: 10.773829,
    longitude: 106.691741,
    plantedAt: '2021-03-15',
    healthStatus: 'GOOD' as const,
    updatedAt: '2026-11-05T04:30:00.000Z',
  };

  const payload = buildTreePayload(tree);
  const json1 = canonicalize(payload);
  const json2 = canonicalize(payload);

  assert.equal(json1, json2);
  assert.ok(!json1.includes('\n'), 'JSON must not contain newlines');
  assert.ok(json1.includes('"schemaVersion":1'));
  assert.ok(json1.includes('"recordType":"TREE_PROFILE"'));
  assert.ok(json1.includes('"displayName":"Cây Bàng Đài Loan"'));
});

test('changing any critical field changes the canonical hash', () => {
  const care1 = {
    id: 'care-101',
    treeId: 'tree-001',
    actionType: 'PRUNING' as const,
    notes: 'Đã cắt tỉa cành khô',
    performedAt: '2026-11-05T04:30:00.000Z',
    staffUserId: 'staff-01',
  };

  const res1 = computeRecordHash('CARE_RECORD', care1);

  // Altering notes slightly
  const careTampered = {
    ...care1,
    notes: 'Đã cắt tỉa cành mục và lá sâu',
  };

  const res2 = computeRecordHash('CARE_RECORD', careTampered);

  assert.notEqual(res1.hash, res2.hash, 'Hashes must differ when data is modified');
  assert.equal(res1.hash.length, 64, 'SHA-256 hash must be 64 hex characters');
});

test('Vietnamese Unicode NFC and whitespace trimming work consistently', () => {
  const treeA = {
    id: 'tree-002',
    publicCode: 'TREE-002',
    displayName: '   Cây Giáng Hương   ',
    latitude: 10.77112233,
    longitude: 106.69998811,
    plantedAt: '2020-01-01',
    updatedAt: '2026-11-05T04:30:00.000Z',
  };

  const treeB = {
    id: 'tree-002',
    publicCode: 'TREE-002',
    displayName: 'Cây Giáng Hương',
    latitude: 10.771122,
    longitude: 106.699988,
    plantedAt: '2020-01-01',
    updatedAt: '2026-11-05T04:30:00.000Z',
  };

  const resA = computeRecordHash('TREE_PROFILE', treeA);
  const resB = computeRecordHash('TREE_PROFILE', treeB);

  // Both should normalize to trimmed string and 6-decimal coordinates
  assert.equal(resA.hash, resB.hash);
});
