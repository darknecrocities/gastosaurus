import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setupHarness } from './helpers/harness.js';

const h = setupHarness();

const ok = (res, status = 200) => {
  assert.equal(res.status, status, JSON.stringify(res.body));
  return res.body;
};

test('the last admin leaving hands admin to the longest-standing member with an account', async () => {
  const alex = await h.login('alex-admin@example.com', 'Alex');
  const carlo = await h.login('carlo-admin@example.com', 'Carlo');

  const office = ok(
    await h.call('POST', '/groups', { token: alex.token, body: { name: 'Office Coffee', members: [{ name: 'Dana' }] } }),
    201,
  );
  const gid = office.group.id;
  ok(await h.call('POST', `/groups/${gid}/invites`, { token: alex.token, body: { email: 'carlo-admin@example.com' } }), 201);
  const { invites } = ok(await h.call('GET', '/invites', { token: carlo.token }));
  ok(await h.call('POST', `/invites/${invites[0].id}/accept`, { token: carlo.token }));

  assert.equal((await h.call('DELETE', `/groups/${gid}/members/me`, { token: alex.token })).status, 204);
  const detail = ok(await h.call('GET', `/groups/${gid}`, { token: carlo.token }));
  assert.equal(detail.members.find((m) => m.isCurrentUser).role, 'admin'); // not Dana: guests can't be admin
});

test('when the last member with an account leaves, the whole group and its history is deleted', async () => {
  const alex = await h.login('alex-solo@example.com', 'Alex');
  const g = ok(await h.call('POST', '/groups', { token: alex.token, body: { name: 'Solo Snacks', members: [{ name: 'Fin' }] } }), 201);
  const gid = g.group.id;
  const [alexId, finId] = g.members.map((m) => m.id);

  ok(
    await h.call('POST', `/groups/${gid}/expenses`, {
      token: alex.token,
      body: { description: 'Chips', splitType: 'equal', totalAmount: 100, memberIds: [alexId, finId] },
    }),
    201,
  );
  ok(
    await h.call('POST', `/groups/${gid}/settlements`, {
      token: alex.token,
      body: { fromMemberId: finId, toMemberId: alexId, amount: 50, method: 'cash' },
    }),
    201,
  );

  assert.equal((await h.call('DELETE', `/groups/${gid}/members/me`, { token: alex.token })).status, 204);
  const left = await h.pool.query(
    `SELECT (SELECT count(*)::int FROM public.groups WHERE id = $1) AS groups,
            (SELECT count(*)::int FROM public.expenses WHERE group_id = $1) AS expenses,
            (SELECT count(*)::int FROM public.settlements WHERE group_id = $1) AS settlements,
            (SELECT count(*)::int FROM public.group_members WHERE group_id = $1) AS members`,
    [gid],
  );
  assert.deepEqual(left.rows[0], { groups: 0, expenses: 0, settlements: 0, members: 0 });
});

test('admins can delete a group only once everyone is settled', async () => {
  const alex = await h.login('alex-del@example.com', 'Alex');
  const g = ok(await h.call('POST', '/groups', { token: alex.token, body: { name: 'Temp', members: [{ name: 'Eli' }] } }), 201);
  ok(
    await h.call('POST', `/groups/${g.group.id}/expenses`, {
      token: alex.token,
      body: { description: 'x', splitType: 'equal', totalAmount: 50, memberIds: g.members.map((m) => m.id) },
    }),
    201,
  );
  assert.equal((await h.call('DELETE', `/groups/${g.group.id}`, { token: alex.token })).status, 409);
  const { expenses } = ok(await h.call('GET', `/groups/${g.group.id}/expenses`, { token: alex.token }));
  assert.equal((await h.call('DELETE', `/expenses/${expenses[0].id}`, { token: alex.token })).status, 204);
  assert.equal((await h.call('DELETE', `/groups/${g.group.id}`, { token: alex.token })).status, 204);
});
