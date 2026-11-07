/**
 * UrbanTree - Hash Service
 * Implements deterministic canonical JSON serialization and SHA-256 hashing
 * compliant with Section A6 of the UrbanTree 20-Day Roadmap.
 */

import { CareRecord, Incident, RecordType, Tree } from '../types';

/**
 * Normalizes string values: Unicode NFC and trimmed whitespace.
 */
function normalizeString(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  const str = String(val).trim().normalize('NFC');
  return str;
}

/**
 * Normalizes coordinate numbers to exactly 6 decimal places.
 */
function normalizeCoordinate(val: unknown): number {
  const num = typeof val === 'number' ? val : parseFloat(String(val) || '0');
  return Number(num.toFixed(6));
}

/**
 * Normalizes ISO-8601 UTC timestamp format.
 */
function normalizeTimestamp(val: unknown): string {
  if (!val) return new Date().toISOString();
  try {
    const d = new Date(String(val));
    return d.toISOString();
  } catch {
    return String(val);
  }
}

/**
 * Builds the strictly ordered canonical payload for TREE_PROFILE.
 */
export function buildTreePayload(tree: Partial<Tree>): Record<string, unknown> {
  return {
    schemaVersion: 1,
    recordType: 'TREE_PROFILE',
    recordId: normalizeString(tree.id) || '',
    publicCode: normalizeString(tree.publicCode) || '',
    treeTypeId: normalizeString(tree.treeTypeId),
    displayName: normalizeString(tree.displayName) || '',
    address: normalizeString(tree.address) || '',
    latitude: normalizeCoordinate(tree.latitude),
    longitude: normalizeCoordinate(tree.longitude),
    plantedAt: normalizeString(tree.plantedAt) || '',
    healthStatus: normalizeString(tree.healthStatus) || 'GOOD',
    updatedAt: normalizeTimestamp(tree.updatedAt || tree.createdAt),
  };
}

/**
 * Builds the strictly ordered canonical payload for CARE_RECORD.
 */
export function buildCareRecordPayload(care: Partial<CareRecord>): Record<string, unknown> {
  return {
    schemaVersion: 1,
    recordType: 'CARE_RECORD',
    recordId: normalizeString(care.id) || '',
    treeId: normalizeString(care.treeId) || '',
    actionType: normalizeString(care.actionType) || 'WATERING',
    notes: normalizeString(care.notes) || '',
    performedAt: normalizeTimestamp(care.performedAt || care.createdAt),
    performedByUserId: normalizeString(care.staffUserId) || '',
  };
}

/**
 * Builds the strictly ordered canonical payload for INCIDENT_REPORT.
 */
export function buildIncidentReportPayload(incident: Partial<Incident>): Record<string, unknown> {
  return {
    schemaVersion: 1,
    recordType: 'INCIDENT_REPORT',
    recordId: normalizeString(incident.id) || '',
    publicCode: normalizeString(incident.publicCode) || '',
    treeId: normalizeString(incident.treeId),
    severity: normalizeString(incident.severity) || 'MEDIUM',
    description: normalizeString(incident.description) || '',
    latitude: normalizeCoordinate(incident.latitude),
    longitude: normalizeCoordinate(incident.longitude),
    reportedAt: normalizeTimestamp(incident.reportedAt || incident.createdAt),
  };
}

/**
 * Builds the strictly ordered canonical payload for INCIDENT_RESOLUTION.
 */
export function buildIncidentResolutionPayload(incident: Partial<Incident>, resolvedByUserId: string, note: string): Record<string, unknown> {
  return {
    schemaVersion: 1,
    recordType: 'INCIDENT_RESOLUTION',
    recordId: normalizeString(incident.id) || '',
    incidentId: normalizeString(incident.id) || '',
    finalStatus: normalizeString(incident.status) || 'RESOLVED',
    resolutionNote: normalizeString(note) || '',
    resolvedAt: normalizeTimestamp(incident.resolvedAt || new Date().toISOString()),
    resolvedByUserId: normalizeString(resolvedByUserId) || '',
  };
}

/**
 * Converts a canonical payload object into standard compact single-line JSON string without whitespace.
 */
export function canonicalize(payload: Record<string, unknown>): string {
  return JSON.stringify(payload);
}

/**
 * Standalone pure TypeScript SHA-256 implementation.
 * Runs deterministically in any runtime (Browser, Node.js, Web Worker) without external dependencies.
 */
export function sha256Hex(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let i = 0, j = 0;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;

  // Initial hash values (first 32 bits of fractional parts of square roots of first 8 primes 2..19)
  let hash: number[] = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];

  // First 64 round constants (fractional parts of cube roots of first 64 primes 2..311)
  const k: number[] = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  // UTF-8 encode string
  const utf8: number[] = [];
  for (let idx = 0; idx < ascii.length; idx++) {
    let charCode = ascii.charCodeAt(idx);
    if (charCode < 0x80) {
      utf8.push(charCode);
    } else if (charCode < 0x800) {
      utf8.push(0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f));
    } else if (charCode < 0xd800 || charCode >= 0xe000) {
      utf8.push(0xe0 | (charCode >> 12), 0x80 | ((charCode >> 6) & 0x3f), 0x80 | (charCode & 0x3f));
    } else {
      // surrogate pair
      idx++;
      charCode = 0x10000 + (((charCode & 0x3ff) << 10) | (ascii.charCodeAt(idx) & 0x3ff));
      utf8.push(
        0xf0 | (charCode >> 18),
        0x80 | ((charCode >> 12) & 0x3f),
        0x80 | ((charCode >> 6) & 0x3f),
        0x80 | (charCode & 0x3f)
      );
    }
  }

  const utf8BitLength = utf8.length * 8;
  utf8.push(0x80);
  while ((utf8.length % 64) !== 56) {
    utf8.push(0);
  }

  for (i = 0; i < utf8.length; i += 4) {
    words.push(
      (utf8[i] << 24) |
      (utf8[i + 1] << 16) |
      (utf8[i + 2] << 8) |
      utf8[i + 3]
    );
  }

  // Append original length in bits as 64-bit big-endian integer
  words.push(Math.floor(utf8BitLength / maxWord));
  words.push(utf8BitLength >>> 0);

  // Process blocks
  const w = new Array(64);
  for (let block = 0; block < words.length; block += 16) {
    const subHash = hash.slice(0);

    for (i = 0; i < 64; i++) {
      if (i < 16) {
        w[i] = words[block + i];
      } else {
        const gamma0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        const gamma1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + gamma0 + w[i - 7] + gamma1) | 0;
      }

      const s1 = rightRotate(subHash[4], 6) ^ rightRotate(subHash[4], 11) ^ rightRotate(subHash[4], 25);
      const ch = (subHash[4] & subHash[5]) ^ (~subHash[4] & subHash[6]);
      const temp1 = (subHash[7] + s1 + ch + k[i] + w[i]) | 0;
      const s0 = rightRotate(subHash[0], 2) ^ rightRotate(subHash[0], 13) ^ rightRotate(subHash[0], 22);
      const maj = (subHash[0] & subHash[1]) ^ (subHash[0] & subHash[2]) ^ (subHash[1] & subHash[2]);
      const temp2 = (s0 + maj) | 0;

      subHash[7] = subHash[6];
      subHash[6] = subHash[5];
      subHash[5] = subHash[4];
      subHash[4] = (subHash[3] + temp1) | 0;
      subHash[3] = subHash[2];
      subHash[2] = subHash[1];
      subHash[1] = subHash[0];
      subHash[0] = (temp1 + temp2) | 0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + subHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const byteValue = (hash[i] >> (8 * j)) & 255;
      result += (byteValue < 16 ? '0' : '') + byteValue.toString(16);
    }
  }

  return result.toLowerCase();
}

/**
 * Convenience helper to compute the canonical JSON and SHA-256 hash for any supported record.
 */
export function computeRecordHash(recordType: RecordType, recordData: any, options?: { resolvedBy?: string; note?: string }): {
  canonicalJson: string;
  hash: string;
  payload: Record<string, unknown>;
} {
  let payload: Record<string, unknown>;

  switch (recordType) {
    case 'TREE_PROFILE':
      payload = buildTreePayload(recordData);
      break;
    case 'CARE_RECORD':
      payload = buildCareRecordPayload(recordData);
      break;
    case 'INCIDENT_REPORT':
      payload = buildIncidentReportPayload(recordData);
      break;
    case 'INCIDENT_RESOLUTION':
      payload = buildIncidentResolutionPayload(recordData, options?.resolvedBy || 'admin', options?.note || 'Đã giải quyết sự cố');
      break;
    default:
      throw new Error(`Unsupported record type: ${recordType}`);
  }

  const canonicalJson = canonicalize(payload);
  const hash = sha256Hex(canonicalJson);

  return { canonicalJson, hash, payload };
}
