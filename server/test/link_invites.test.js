import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setupHarness } from './helpers/harness.js';

const h = setupHarness();

const ok = (res, status = 200) => {
  assert.equal(res.status, status, JSON.stringify(res.body));
  return res.body;
};

test('join by link: the share code adds you once; admins can reset it; bad codes are refused', async () => {
  const alex = await h.login('alex-link@example.com', 'Alex');
  const { group } = ok(await h.call('POST', '/groups', { token: alex.token, body: { name: 'Link Party' } }), 201);
  assert.match(group.inviteCode, /^[0-9a-f]{10}$/);

  const dana = await h.login('dana@example.com', 'Dana');
  const joined = ok(await h.call('POST', '/invites/join', { token: dana.token, body: { code: group.inviteCode } }));
  assert.equal(joined.group.id, group.id);
  assert.equal(joined.group.membersCount, 2);

  // Joining twice changes nothing
  ok(await h.call('POST', '/invites/join', { token: dana.token, body: { code: group.inviteCode.toUpperCase() } }));
  assert.equal(ok(await h.call('GET', `/groups/${group.id}`, { token: dana.token })).members.length, 2);

  // Only admins can reset; the old code then stops working
  assert.equal((await h.call('POST', `/groups/${group.id}/invite-code`, { token: dana.token })).status, 403);
  const reset = ok(await h.call('POST', `/groups/${group.id}/invite-code`, { token: alex.token }));
  assert.notEqual(reset.group.inviteCode, group.inviteCode);
  const eli = await h.login('eli@example.com', 'Eli');
  assert.equal((await h.call('POST', '/invites/join', { token: eli.token, body: { code: group.inviteCode } })).status, 404);
  assert.equal((await h.call('POST', '/invites/join', { token: eli.token, body: { code: 'nope!' } })).status, 400);
});

test('join by link: an invited guest is claimed, not duplicated (Dane signs up as "Daney")', async () => {
  const alex = await h.login('alex-dane@example.com', 'Alex');
  const { group, members } = ok(
    await h.call('POST', '/groups', {
      token: alex.token,
      body: { name: 'Thesis', members: [{ name: 'Dane', email: 'dane@example.com' }] },
    }),
    201,
  );
  const dane = members.find((m) => m.name === 'Dane');

  ok(
    await h.call('POST', `/groups/${group.id}/expenses`, {
      token: alex.token,
      body: {
        description: 'Printing',
        splitType: 'equal',
        totalAmount: 100,
        paidBy: dane.id,
        memberIds: members.map((m) => m.id),
      },
    }),
    201,
  );

  const daney = await h.login('dane@example.com', 'Daney');
  const joined = ok(await h.call('POST', '/invites/join', { token: daney.token, body: { code: group.inviteCode } }));
  assert.equal(joined.group.myMemberId, dane.id);
  assert.equal(joined.group.membersCount, 2);

  const detail = ok(await h.call('GET', `/groups/${group.id}`, { token: alex.token }));
  assert.equal(detail.members.length, 2);
  const claimed = detail.members.find((m) => m.id === dane.id);
  assert.equal(claimed.isGuest, false);
  assert.equal(claimed.name, 'Daney');
  assert.equal(claimed.email, 'dane@example.com');
  assert.equal(detail.pendingInvites.length, 0);
});
