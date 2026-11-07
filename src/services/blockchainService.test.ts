import test from 'node:test';
import assert from 'node:assert/strict';
import { blockchainService } from './blockchainService';
import { computeRecordHash } from './hashService';
import { Tree } from '../types';

test('blockchainService: anchors and verifies valid tree profile', async () => {
  const tree: Tree = {
    id: 'tree-test-1',
    publicCode: 'TREE-TEST-001',
    treeTypeId: 'type-bang',
    displayName: 'Bàng Đài Loan Test',
    address: '123 Lê Duẩn, Q1',
    latitude: 10.778,
    longitude: 106.698,
    plantedAt: '2022-01-01',
    healthStatus: 'GOOD',
    isActive: true,
    createdAt: '2026-11-05T00:00:00.000Z',
    updatedAt: '2026-11-05T00:00:00.000Z',
  };

  const { hash, canonicalJson } = computeRecordHash('TREE_PROFILE', tree);

  const receipt = await blockchainService.anchorRecord({
    recordType: 'TREE_PROFILE',
    recordId: tree.id,
    hash,
    canonicalJson,
  });

  assert.equal(receipt.status, 'CONFIRMED');
  assert.ok(receipt.txHash?.startsWith('0x'));
  assert.ok((receipt.blockNumber || 0) > 0);

  // Verification on unchanged tree should be VALID
  const verifyResult = await blockchainService.verifyRecord('TREE_PROFILE', tree);
  assert.equal(verifyResult.status, 'VALID');
  assert.equal(verifyResult.currentHash, hash);
  assert.equal(verifyResult.onChainHash, hash);
});

test('blockchainService: detects data tampering and returns MISMATCH', async () => {
  const tree: Tree = {
    id: 'tree-test-2',
    publicCode: 'TREE-TEST-002',
    treeTypeId: 'type-me',
    displayName: 'Me Tây Test',
    address: '45 Nguyễn Huệ, Q1',
    latitude: 10.774,
    longitude: 106.702,
    plantedAt: '2019-05-10',
    healthStatus: 'FAIR',
    isActive: true,
    createdAt: '2026-11-05T00:00:00.000Z',
    updatedAt: '2026-11-05T00:00:00.000Z',
  };

  const { hash, canonicalJson } = computeRecordHash('TREE_PROFILE', tree);

  await blockchainService.anchorRecord({
    recordType: 'TREE_PROFILE',
    recordId: tree.id,
    hash,
    canonicalJson,
  });

  // Tamper: maliciously alter health status from FAIR to POOR
  const tamperedTree: Tree = {
    ...tree,
    healthStatus: 'POOR',
  };

  const verifyResult = await blockchainService.verifyRecord('TREE_PROFILE', tamperedTree);
  assert.equal(verifyResult.status, 'MISMATCH');
  assert.notEqual(verifyResult.currentHash, verifyResult.onChainHash);
  assert.ok(verifyResult.diffFields && verifyResult.diffFields.length > 0);
  assert.equal(verifyResult.diffFields[0].field, 'healthStatus');
});

test('blockchainService: handles node offline gracefully', async () => {
  blockchainService.setNodeOnline(false);

  const res = await blockchainService.anchorRecord({
    recordType: 'TREE_PROFILE',
    recordId: 'tree-offline',
    hash: '0000',
  });

  assert.equal(res.status, 'UNAVAILABLE');

  // restore online
  blockchainService.setNodeOnline(true);
});
