const BASE = 'http://localhost:3001/api/v1/inventory';
const AUTH_BASE = 'http://localhost:3001/api/v1/auth';
let passed = 0;
let failed = 0;
let createdPartId = '';
let createdReservationId = '';
let authToken = '';

function assert(condition: boolean, msg: string) {
  if (condition) {
    passed++;
    console.log(`  PASS: ${msg}`);
  } else {
    failed++;
    console.log(`  FAIL: ${msg}`);
  }
}

async function req(method: string, path: string, body?: any) {
  const opts: any = { method, headers: { 'Content-Type': 'application/json' } };
  if (authToken) opts.headers['Authorization'] = `Bearer ${authToken}`;
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, json };
}

async function run() {
  console.log('=== INVENTORY API VERIFICATION ===\n');

  // 0. Auth: login
  console.log('[0] POST /auth/login');
  const loginRes = await fetch(`${AUTH_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@aeroguard.com', password: 'admin123' }),
  });
  const loginData = await loginRes.json();
  assert(loginRes.status === 200, `200 OK (got ${loginRes.status})`);
  assert(loginData.token, 'returns token');
  authToken = loginData.token;

  // 0b. Unauthenticated access should fail
  console.log('\n[0b] GET /dashboard (no auth)');
  const noAuthRes = await fetch(`${BASE}/dashboard`);
  assert(noAuthRes.status === 401, `401 Unauthorized (got ${noAuthRes.status})`);

  // 1. GET /dashboard
  console.log('[1] GET /dashboard');
  let r = await req('GET', '/dashboard');
  assert(r.status === 200, `200 OK (got ${r.status})`);
  assert(typeof r.json.totalParts === 'number', 'has totalParts');
  assert(typeof r.json.lowStockCount === 'number', 'has lowStockCount');
  assert(typeof r.json.warehouseCount === 'number', 'has warehouseCount');
  assert(typeof r.json.totalValue === 'string', 'has totalValue');

  // 2. GET /warehouses
  console.log('\n[2] GET /warehouses');
  r = await req('GET', '/warehouses');
  assert(r.status === 200, `200 OK (got ${r.status})`);
  assert(Array.isArray(r.json), 'returns array');
  assert(r.json.length >= 2, `has >= 2 warehouses (got ${r.json.length})`);
  assert(r.json[0].id && r.json[0].name, 'warehouse has id + name');

  // 3. GET /categories
  console.log('\n[3] GET /categories');
  r = await req('GET', '/categories');
  assert(r.status === 200, `200 OK (got ${r.status})`);
  assert(Array.isArray(r.json), 'returns array');
  assert(r.json.length >= 3, `has >= 3 categories (got ${r.json.length})`);

  // 4. GET /suppliers
  console.log('\n[4] GET /suppliers');
  r = await req('GET', '/suppliers');
  assert(r.status === 200, `200 OK (got ${r.status})`);
  assert(Array.isArray(r.json), 'returns array');
  assert(r.json.length >= 2, `has >= 2 suppliers (got ${r.json.length})`);

  // 5. GET /parts (empty search)
  console.log('\n[5] GET /parts');
  r = await req('GET', '/parts');
  assert(r.status === 200, `200 OK (got ${r.status})`);
  assert(Array.isArray(r.json.data), 'has data array');
  assert(typeof r.json.total === 'number', 'has total');
  assert(r.json.total >= 5, `total >= 5 (got ${r.json.total})`);

  // 6. GET /parts pagination
  console.log('\n[6] GET /parts pagination');
  r = await req('GET', '/parts?page=1&pageSize=2');
  assert(r.status === 200, `200 OK (got ${r.status})`);
  assert(r.json.data.length <= 2, `pageSize respected (got ${r.json.data.length})`);

  // 7. GET /parts search
  console.log('\n[7] GET /parts search');
  r = await req('GET', '/parts?search=Flight');
  assert(r.status === 200, `200 OK (got ${r.status})`);
  assert(r.json.data.length >= 1, `found matching part (got ${r.json.data.length})`);
  createdPartId = r.json.data[0].id;

  // 8. GET /parts category filter
  console.log('\n[8] GET /parts category filter');
  r = await req('GET', '/parts?categoryId=Avionics');
  assert(r.status === 200, `200 OK (got ${r.status})`);

  // 9. GET /parts/:id
  console.log('\n[9] GET /parts/:id');
  r = await req('GET', `/parts/${createdPartId}`);
  assert(r.status === 200, `200 OK (got ${r.status})`);
  assert(r.json.id === createdPartId, 'returns correct part');
  assert(r.json.partNumber, 'has partNumber');
  assert(r.json.name, 'has name');

  // 10. GET /parts/:id not found
  console.log('\n[10] GET /parts/:id (not found)');
  r = await req('GET', '/parts/00000000-0000-0000-0000-000000000000');
  assert(r.status === 404, `404 Not Found (got ${r.status})`);

  // 11. GET /parts/:id invalid UUID
  console.log('\n[11] GET /parts/:id (invalid UUID)');
  r = await req('GET', '/parts/not-a-uuid');
  assert(r.status === 400, `400 Bad Request (got ${r.status})`);

  // 12. POST /parts (create)
  console.log('\n[12] POST /parts');
  r = await req('POST', '/parts', {
    partNumber: 'API-TEST-001',
    name: 'API Test Part',
    category: 'Testing',
    availableQty: 50,
    unitCost: 999.99,
  });
  assert(r.status === 201, `201 Created (got ${r.status})`);
  assert(r.json.id, 'returns id');
  const newPartId = r.json.id;

  // 13. POST /parts duplicate
  console.log('\n[13] POST /parts (duplicate)');
  r = await req('POST', '/parts', { partNumber: 'API-TEST-001', name: 'Dup' });
  assert(r.status === 409, `409 Conflict (got ${r.status})`);

  // 14. POST /parts validation
  console.log('\n[14] POST /parts (validation)');
  r = await req('POST', '/parts', { name: 'No part number' });
  assert(r.status === 400, `400 Bad Request (got ${r.status})`);

  // 15. PATCH /parts/:id
  console.log('\n[15] PATCH /parts/:id');
  r = await req('PATCH', `/parts/${newPartId}`, { name: 'Updated API Test Part', availableQty: 75 });
  assert(r.status === 200, `200 OK (got ${r.status})`);
  assert(r.json.name === 'Updated API Test Part', 'name updated');

  // 16. PATCH /parts/:id not found
  console.log('\n[16] PATCH /parts/:id (not found)');
  r = await req('PATCH', '/parts/00000000-0000-0000-0000-000000000000', { name: 'X' });
  assert(r.status === 404, `404 Not Found (got ${r.status})`);

  // 17. GET /parts/:id/history
  console.log('\n[17] GET /parts/:id/history');
  r = await req('GET', `/parts/${createdPartId}/history`);
  assert(r.status === 200, `200 OK (got ${r.status})`);
  assert(Array.isArray(r.json), 'returns array');

  // 18. GET /suppliers/:id
  console.log('\n[18] GET /suppliers/:id');
  const supList = await req('GET', '/suppliers');
  r = await req('GET', `/suppliers/${supList.json[0].id}`);
  assert(r.status === 200, `200 OK (got ${r.status})`);
  assert(r.json.name, 'has name');

  // 19. GET /suppliers/:id not found
  console.log('\n[19] GET /suppliers/:id (not found)');
  r = await req('GET', '/suppliers/00000000-0000-0000-0000-000000000000');
  assert(r.status === 404, `404 Not Found (got ${r.status})`);

  // 20. POST /reservations
  console.log('\n[20] POST /reservations');
  r = await req('POST', '/reservations', { partId: createdPartId, quantity: 5 });
  assert(r.status === 201, `201 Created (got ${r.status})`);
  assert(r.json.status === 'active', 'reservation is active');
  createdReservationId = r.json.id;

  // 21. POST /reservations insufficient
  console.log('\n[21] POST /reservations (insufficient stock)');
  r = await req('POST', '/reservations', { partId: createdPartId, quantity: 999999 });
  assert(r.status === 409, `409 Conflict (got ${r.status})`);

  // 22. POST /reservations invalid part
  console.log('\n[22] POST /reservations (invalid part)');
  r = await req('POST', '/reservations', { partId: '00000000-0000-0000-0000-000000000000', quantity: 1 });
  assert(r.status === 404, `404 Not Found (got ${r.status})`);

  // 23. POST /reservations validation
  console.log('\n[23] POST /reservations (validation)');
  r = await req('POST', '/reservations', { partId: 'not-uuid', quantity: -1 });
  assert(r.status === 400, `400 Bad Request (got ${r.status})`);

  // 24. DELETE /reservations/:id
  console.log('\n[24] DELETE /reservations/:id');
  r = await req('DELETE', `/reservations/${createdReservationId}`);
  assert(r.status === 200, `200 OK (got ${r.status})`);
  assert(r.json.status === 'cancelled', 'reservation cancelled');

  // 25. DELETE /reservations/:id not found
  console.log('\n[25] DELETE /reservations/:id (not found)');
  r = await req('DELETE', '/reservations/00000000-0000-0000-0000-000000000000');
  assert(r.status === 404, `404 Not Found (got ${r.status})`);

  // 26. POST /purchase-requests
  console.log('\n[26] POST /purchase-requests');
  r = await req('POST', '/purchase-requests', { partId: createdPartId, quantity: 100, notes: 'Urgent restock' });
  assert(r.status === 201, `201 Created (got ${r.status})`);
  assert(r.json.status === 'pending', 'PR is pending');

  // 27. POST /purchase-requests invalid part
  console.log('\n[27] POST /purchase-requests (invalid part)');
  r = await req('POST', '/purchase-requests', { partId: '00000000-0000-0000-0000-000000000000', quantity: 10 });
  assert(r.status === 404, `404 Not Found (got ${r.status})`);

  // 28. GET /lookup/:inspectionId
  console.log('\n[28] GET /lookup/:inspectionId');
  r = await req('GET', '/lookup/00000000-0000-0000-0000-000000000000');
  assert(r.status === 200, `200 OK (got ${r.status})`);
  assert(Array.isArray(r.json), 'returns array');

  // 29. DELETE /parts/:id
  console.log('\n[29] DELETE /parts/:id');
  r = await req('DELETE', `/parts/${newPartId}`);
  assert(r.status === 200, `200 OK (got ${r.status})`);

  // 30. DELETE /parts/:id not found
  console.log('\n[30] DELETE /parts/:id (not found)');
  r = await req('DELETE', `/parts/${newPartId}`);
  assert(r.status === 404, `404 Not Found (got ${r.status})`);

  // 31. DELETE /parts/:id invalid UUID
  console.log('\n[31] DELETE /parts/:id (invalid UUID)');
  r = await req('DELETE', '/parts/not-a-uuid');
  assert(r.status === 400, `400 Bad Request (got ${r.status})`);

  // Summary
  console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
}

run().catch((e) => {
  console.error('Test error:', e);
  process.exit(1);
});
