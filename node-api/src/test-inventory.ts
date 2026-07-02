/**
 * Inventory Backend E2E Test Script
 * Run with: npx tsx src/test-inventory.ts
 * Requires the server to be running on http://localhost:3001
 */

const BASE = 'http://localhost:3001/api/v1/inventory';
const AUTH_BASE = 'http://localhost:3001/api/v1/auth';
let authToken = '';

let createdPartId: string;
let createdWarehouseId: string;
let createdSupplierId: string;
let createdReservationId: string;
let createdPrId: string;

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`  FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`  PASS: ${msg}`);
}

async function req(method: string, path: string, body?: any) {
  const opts: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (authToken) (opts.headers as any)['Authorization'] = `Bearer ${authToken}`;
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, json };
}

async function loginAndSetToken() {
  const loginRes = await fetch(`${AUTH_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@aeroguard.com', password: 'admin123' }),
  });
  const loginData = await loginRes.json();
  if (loginRes.status === 200 && loginData.token) {
    authToken = loginData.token;
    console.log('✅ Logged in, token acquired');
  } else {
    console.error('❌ Login failed, cannot run authenticated tests');
    process.exit(1);
  }
}

async function testGetDashboard() {
  console.log('\n[TEST] GET /dashboard');
  // Ensure we have a token
  if (!authToken) await loginAndSetToken();
  const { status, json } = await req('GET', '/dashboard');
  assert(status === 200, `Status 200 (got ${status})`);
  assert('totalParts' in json, 'Response has totalParts');
  assert('lowStockCount' in json, 'Response has lowStockCount');
  assert('warehouseCount' in json, 'Response has warehouseCount');
  assert('totalValue' in json, 'Response has totalValue');
}

async function testGetPartsEmpty() {
  console.log('\n[TEST] GET /parts (empty or existing)');
  const { status, json } = await req('GET', '/parts');
  assert(status === 200, `Status 200 (got ${status})`);
  assert(Array.isArray(json.data), 'Response has data array');
  assert(typeof json.total === 'number', 'Response has total number');
}

async function testGetPartsPagination() {
  console.log('\n[TEST] GET /parts with pagination');
  const { status, json } = await req('GET', '/parts?page=1&pageSize=5');
  assert(status === 200, `Status 200 (got ${status})`);
  assert(json.data.length <= 5, `Page size respected (got ${json.data.length})`);
}

async function testCreatePart() {
  console.log('\n[TEST] POST /parts');
  const { status, json } = await req('POST', '/parts', {
    partNumber: 'TEST-001',
    name: 'Test Part Alpha',
    category: 'Avionics',
    manufacturer: 'TestCorp',
    availableQty: 100,
    minStock: 10,
    maxStock: 200,
    unitCost: 1500.50,
    description: 'A test part for validation',
    aircraftModel: 'B737',
  });
  assert(status === 201, `Status 201 (got ${status})`);
  assert(uuidRegex.test(json.id), 'Returns valid UUID');
  assert(json.partNumber === 'TEST-001', 'partNumber matches');
  assert(json.name === 'Test Part Alpha', 'name matches');
  assert(json.availableQty === 100, 'availableQty matches');
  createdPartId = json.id;
}

async function testDuplicatePart() {
  console.log('\n[TEST] POST /parts (duplicate)');
  const { status } = await req('POST', '/parts', {
    partNumber: 'TEST-001',
    name: 'Duplicate',
  });
  assert(status === 409, `Status 409 for duplicate (got ${status})`);
}

async function testCreatePartValidation() {
  console.log('\n[TEST] POST /parts (validation failure)');
  const { status, json } = await req('POST', '/parts', {
    name: 'Missing partNumber',
  });
  assert(status === 400, `Status 400 for validation (got ${status})`);
  assert(json.error === 'Validation failed.', 'Error message correct');
}

async function testGetPartById() {
  console.log('\n[TEST] GET /parts/:id');
  const { status, json } = await req('GET', `/parts/${createdPartId}`);
  assert(status === 200, `Status 200 (got ${status})`);
  assert(json.id === createdPartId, 'Returns correct part');
  assert(json.partNumber === 'TEST-001', 'partNumber matches');
}

async function testGetPartNotFound() {
  console.log('\n[TEST] GET /parts/:id (not found)');
  const fakeId = '00000000-0000-0000-0000-000000000000';
  const { status } = await req('GET', `/parts/${fakeId}`);
  assert(status === 404, `Status 404 (got ${status})`);
}

async function testGetPartInvalidId() {
  console.log('\n[TEST] GET /parts/:id (invalid UUID)');
  const { status } = await req('GET', '/parts/not-a-uuid');
  assert(status === 400, `Status 400 (got ${status})`);
}

async function testUpdatePart() {
  console.log('\n[TEST] PATCH /parts/:id');
  const { status, json } = await req('PATCH', `/parts/${createdPartId}`, {
    name: 'Updated Test Part',
    availableQty: 150,
  });
  assert(status === 200, `Status 200 (got ${status})`);
  assert(json.name === 'Updated Test Part', 'Name updated');
  assert(json.availableQty === 150, 'Qty updated');
}

async function testSearchParts() {
  console.log('\n[TEST] GET /parts?search=Updated');
  const { status, json } = await req('GET', '/parts?search=Updated');
  assert(status === 200, `Status 200 (got ${status})`);
  assert(json.data.length >= 1, 'Found at least 1 part');
  assert(json.data[0].name === 'Updated Test Part', 'Search result correct');
}

async function testGetWarehouses() {
  console.log('\n[TEST] GET /warehouses');
  const { status, json } = await req('GET', '/warehouses');
  assert(status === 200, `Status 200 (got ${status})`);
  assert(Array.isArray(json), 'Returns array');
}

async function testGetCategories() {
  console.log('\n[TEST] GET /categories');
  const { status, json } = await req('GET', '/categories');
  assert(status === 200, `Status 200 (got ${status})`);
  assert(Array.isArray(json), 'Returns array');
}

async function testGetSuppliers() {
  console.log('\n[TEST] GET /suppliers');
  const { status, json } = await req('GET', '/suppliers');
  assert(status === 200, `Status 200 (got ${status})`);
  assert(Array.isArray(json), 'Returns array');
}

async function testReservation() {
  console.log('\n[TEST] POST /reservations');
  const { status, json } = await req('POST', '/reservations', {
    partId: createdPartId,
    quantity: 10,
  });
  assert(status === 201, `Status 201 (got ${status})`);
  assert(json.status === 'active', 'Reservation is active');
  assert(json.quantity === 10, 'Quantity is 10');
  createdReservationId = json.id;
}

async function testReservationInsufficient() {
  console.log('\n[TEST] POST /reservations (insufficient stock)');
  const { status, json } = await req('POST', '/reservations', {
    partId: createdPartId,
    quantity: 99999,
  });
  assert(status === 409, `Status 409 for insufficient (got ${status})`);
}

async function testReservationInvalidPart() {
  console.log('\n[TEST] POST /reservations (invalid part)');
  const { status } = await req('POST', '/reservations', {
    partId: '00000000-0000-0000-0000-000000000000',
    quantity: 1,
  });
  assert(status === 404, `Status 404 for invalid part (got ${status})`);
}

async function testReleaseReservation() {
  console.log('\n[TEST] DELETE /reservations/:id');
  const { status, json } = await req('DELETE', `/reservations/${createdReservationId}`);
  assert(status === 200, `Status 200 (got ${status})`);
  assert(json.status === 'cancelled', 'Reservation cancelled');
}

async function testReleaseNonExistent() {
  console.log('\n[TEST] DELETE /reservations/:id (not found)');
  const { status } = await req('DELETE', '/reservations/00000000-0000-0000-0000-000000000000');
  assert(status === 404, `Status 404 (got ${status})`);
}

async function testPurchaseRequest() {
  console.log('\n[TEST] POST /purchase-requests');
  const { status, json } = await req('POST', '/purchase-requests', {
    partId: createdPartId,
    quantity: 50,
    notes: 'Urgent restocking',
  });
  assert(status === 201, `Status 201 (got ${status})`);
  assert(json.status === 'pending', 'PR status is pending');
  assert(json.quantity === 50, 'Quantity is 50');
  createdPrId = json.id;
}

async function testPurchaseRequestInvalidPart() {
  console.log('\n[TEST] POST /purchase-requests (invalid part)');
  const { status } = await req('POST', '/purchase-requests', {
    partId: '00000000-0000-0000-0000-000000000000',
    quantity: 10,
  });
  assert(status === 404, `Status 404 for invalid part (got ${status})`);
}

async function testPartHistory() {
  console.log('\n[TEST] GET /parts/:id/history');
  const { status, json } = await req('GET', `/parts/${createdPartId}/history`);
  assert(status === 200, `Status 200 (got ${status})`);
  assert(Array.isArray(json), 'Returns array');
}

async function testInspectionLookup() {
  console.log('\n[TEST] GET /lookup/:inspectionId (no results)');
  const { status, json } = await req('GET', `/lookup/00000000-0000-0000-0000-000000000000`);
  assert(status === 200, `Status 200 (got ${status})`);
  assert(Array.isArray(json), 'Returns array');
}

async function testDeletePart() {
  console.log('\n[TEST] DELETE /parts/:id');
  const { status } = await req('DELETE', `/parts/${createdPartId}`);
  assert(status === 200, `Status 200 (got ${status})`);
}

async function testDeletePartNotFound() {
  console.log('\n[TEST] DELETE /parts/:id (not found)');
  const { status } = await req('DELETE', `/parts/${createdPartId}`);
  assert(status === 404, `Status 404 (got ${status})`);
}

async function testDeletePartInvalidId() {
  console.log('\n[TEST] DELETE /parts/:id (invalid UUID)');
  const { status } = await req('DELETE', '/parts/not-a-uuid');
  assert(status === 400, `Status 400 (got ${status})`);
}

async function runTests() {
  console.log('=== AeroGuard Inventory Backend Tests ===\n');

  await testGetDashboard();
  await testGetPartsEmpty();
  await testGetPartsPagination();
  await testCreatePart();
  await testDuplicatePart();
  await testCreatePartValidation();
  await testGetPartById();
  await testGetPartNotFound();
  await testGetPartInvalidId();
  await testUpdatePart();
  await testSearchParts();
  await testGetWarehouses();
  await testGetCategories();
  await testGetSuppliers();
  await testReservation();
  await testReservationInsufficient();
  await testReservationInvalidPart();
  await testReleaseReservation();
  await testReleaseNonExistent();
  await testPurchaseRequest();
  await testPurchaseRequestInvalidPart();
  await testPartHistory();
  await testInspectionLookup();
  await testDeletePart();
  await testDeletePartNotFound();
  await testDeletePartInvalidId();

  console.log('\n=== All tests passed! ===');
}

runTests().catch((err) => {
  console.error('Test runner error:', err);
  process.exit(1);
});
