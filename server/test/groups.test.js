// End-to-end story of a barkada using Gastosaurus, through the real API:
// create a group with guests → split bills three ways → a guest signs up and
// claims her spot → settle up → leave. Tests in this file run in order and
// share state.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setupHarness } from './helpers/harness.js';

const h = setupHarness();
const s = {}; // shared state across steps

const ok = (res, status = 200) => {
  assert.equal(res.status, status, JSON.stringify(res.body));
  return res.body;
};
const netOf = (balances, memberId) => balances.members.find((m) => m.id === memberId).net;

test('Alex creates a group with two friends added by name (one with an email)', async () => {
  s.alex = await h.login('alex@example.com', 'Alex');
  const body = ok(
    await h.call('POST', '/groups', {
      token: s.alex.token,
      body: {
        name: 'Boracay Trip',
        category: 'Travel & Trips',
        iconId: 'set1_3_2',
        iconBg: '#FFF1E6',
        iconColor: '#E06D28',
        members: [{ name: 'Bea', email: 'Bea@Example.com' }, { name: 'Miguel' }],
      },
    }),
    201,
  );

  s.groupId = body.group.id;
  assert.equal(body.group.name, 'Boracay Trip');
  assert.equal(body.group.myRole, 'admin');
  assert.equal(body.group.membersCount, 3);
  assert.equal(body.group.statusType, 'settled');

  const [alex, bea, miguel] = body.members;
  assert.deepEqual(
    body.members.map((m) => [m.name, m.role, m.isGuest, m.isCurrentUser]),
    [
      ['Alex', 'admin', false, true],
      ['Bea', 'member', true, false],
      ['Miguel', 'member', true, false],
    ],
  );
  s.m = { alex: alex.id, bea: bea.id, miguel: miguel.id };

  assert.equal(body.pendingInvites.length, 1);
  assert.equal(body.pendingInvites[0].email, 'bea@example.com'); // stored lowercase
  assert.equal(body.pendingInvites[0].memberId, bea.id); // will claim the guest spot
});

test('outsiders cannot see or touch the group', async () => {
  s.carlo = await h.login('carlo@example.com', 'Carlo');
  assert.equal((await h.call('GET', `/groups/${s.groupId}`, { token: s.carlo.token })).status, 404);
  assert.equal((await h.call('GET', `/groups/${s.groupId}/balances`, { token: s.carlo.token })).status, 404);
  assert.equal(
    (await h.call('POST', `/groups/${s.groupId}/expenses`, {
      token: s.carlo.token,
      body: { description: 'x', splitType: 'equal', totalAmount: 1, memberIds: [s.m.alex] },
    })).status,
    404,
  );
  assert.deepEqual(ok(await h.call('GET', '/groups', { token: s.carlo.token })).groups, []);
  assert.equal((await h.call('GET', '/groups/not-a-uuid', { token: s.alex.token })).status, 404);
  assert.equal((await h.call('GET', '/groups')).status, 401);
});

test('equal split: ₱100 three ways is 33.34 + 33.33 + 33.33', async () => {
  const { expense } = ok(
    await h.call('POST', `/groups/${s.groupId}/expenses`, {
      token: s.alex.token,
      body: {
        description: 'Tricycle + snacks',
        splitType: 'equal',
        totalAmount: 100,
        memberIds: [s.m.alex, s.m.bea, s.m.miguel],
        spentOn: '2026-10-01',
      },
    }),
    201,
  );
  assert.equal(expense.paidBy.memberId, s.m.alex); // defaults to the caller
  assert.equal(expense.splitLabel, 'Split Equally');
  assert.deepEqual(
    Object.fromEntries(expense.shares.map((x) => [x.name, x.amount])),
    { Alex: 33.34, Bea: 33.33, Miguel: 33.33 },
  );
  s.equalExpenseId = expense.id;
});

test('itemized split: items ÷ who had them, 10% service charge spread proportionally', async () => {
  // Miguel paid. Wagyu ₱300 for all three, Sake ₱120 for Bea + Miguel, service charge ₱42.
  const { expense } = ok(
    await h.call('POST', `/groups/${s.groupId}/expenses`, {
      token: s.alex.token,
      body: {
        description: 'Dinner at D\'Mall',
        splitType: 'itemized',
        paidBy: s.m.miguel,
        spentOn: '2026-10-02',
        items: [
          { name: 'Wagyu', price: 300, memberIds: [s.m.alex, s.m.bea, s.m.miguel] },
          { name: 'Sake', price: 120, memberIds: [s.m.bea, s.m.miguel] },
        ],
        charges: [{ name: 'Service charge 10%', amount: 42 }],
        totalAmount: 462,
      },
    }),
    201,
  );
  assert.equal(expense.totalAmount, 462);
  assert.equal(expense.items.length, 2);
  assert.deepEqual(expense.charges.map((c) => [c.name, c.amount]), [['Service charge 10%', 42]]);
  // Alex: 100 + 10% = 110. Bea & Miguel: 100 + 60 = 160, + 10% = 176.
  assert.deepEqual(
    Object.fromEntries(expense.shares.map((x) => [x.name, x.amount])),
    { Alex: 110, Bea: 176, Miguel: 176 },
  );
  s.itemizedExpenseId = expense.id;
});

test('split errors come back as friendly field messages', async () => {
  const post = (body) => h.call('POST', `/groups/${s.groupId}/expenses`, { token: s.alex.token, body });

  const short = await post({
    description: 'Gas',
    splitType: 'custom',
    totalAmount: 1000,
    shares: [
      { memberId: s.m.alex, amount: 600 },
      { memberId: s.m.bea, amount: 350 },
    ],
  });
  assert.equal(short.status, 400);
  assert.match(short.body.error.message, /₱50\.00 short/);

  const nobody = await post({
    description: 'Rice',
    splitType: 'itemized',
    items: [{ name: 'Extra rice', price: 50, memberIds: [] }],
  });
  assert.equal(nobody.status, 400);
  assert.ok(nobody.body.error.fields['items.0.memberIds']);

  const wrongTotal = await post({
    description: 'Rice',
    splitType: 'itemized',
    items: [{ name: 'Extra rice', price: 50, memberIds: [s.m.alex] }],
    totalAmount: 60,
  });
  assert.equal(wrongTotal.status, 400);
  assert.ok(wrongTotal.body.error.fields.totalAmount);

  const decimals = await post({ description: 'x', splitType: 'equal', totalAmount: 10.005, memberIds: [s.m.alex] });
  assert.equal(decimals.status, 400);

  const badType = await post({ description: 'x', splitType: 'vibes', totalAmount: 10, memberIds: [s.m.alex] });
  assert.equal(badType.status, 400);

  // Someone from another group can't be slipped into a split
  const other = ok(await h.call('POST', '/groups', { token: s.carlo.token, body: { name: 'Carlo solo' } }), 201);
  const stranger = await post({
    description: 'x',
    splitType: 'equal',
    totalAmount: 10,
    memberIds: [s.m.alex, other.members[0].id],
  });
  assert.equal(stranger.status, 400);
});

test('balances add up to zero and Settle Up suggests the fewest payments', async () => {
  const b = ok(await h.call('GET', `/groups/${s.groupId}/balances`, { token: s.alex.token }));
  // Alex paid 100, owes 33.34 + 110 → −43.34
  // Bea paid 0, owes 33.33 + 176 → −209.33
  // Miguel paid 462, owes 33.33 + 176 → +252.67
  assert.equal(netOf(b, s.m.alex), -43.34);
  assert.equal(netOf(b, s.m.bea), -209.33);
  assert.equal(netOf(b, s.m.miguel), 252.67);
  assert.equal(b.me.statusType, 'owe');
  assert.equal(b.isSettled, false);
  assert.deepEqual(
    b.suggestedSettlements.map((p) => [p.from.name, p.to.name, p.amount]),
    [
      ['Bea', 'Miguel', 209.33],
      ['Alex', 'Miguel', 43.34],
    ],
  );
});

test('Bea signs up, sees her invite, and claims her guest spot (keeping its history)', async () => {
  s.bea = await h.login('bea@example.com', 'Bea Santos');
  const { invites } = ok(await h.call('GET', '/invites', { token: s.bea.token }));
  assert.equal(invites.length, 1);
  assert.equal(invites[0].group.name, 'Boracay Trip');
  assert.equal(invites[0].invitedBy.name, 'Alex');

  // Carlo can't accept someone else's invite
  assert.equal((await h.call('POST', `/invites/${invites[0].id}/accept`, { token: s.carlo.token })).status, 404);

  const { group } = ok(await h.call('POST', `/invites/${invites[0].id}/accept`, { token: s.bea.token }));
  assert.equal(group.id, s.groupId);
  assert.equal(group.myMemberId, s.m.bea); // same member row as the guest "Bea"
  assert.equal(group.balance, -209.33); // her share of the bills came with it
  assert.equal(group.statusType, 'owe');

  const detail = ok(await h.call('GET', `/groups/${s.groupId}`, { token: s.bea.token }));
  const beaRow = detail.members.find((m) => m.id === s.m.bea);
  assert.equal(beaRow.isGuest, false);
  assert.equal(beaRow.name, 'Bea Santos'); // now shows her profile name
  assert.equal(beaRow.email, 'bea@example.com');
  assert.equal(detail.pendingInvites.length, 0);

  // Accepting twice is a conflict
  assert.equal((await h.call('POST', `/invites/${invites[0].id}/accept`, { token: s.bea.token })).status, 409);
});

test('Bea pays for something too; expense list shows each person\'s own share', async () => {
  ok(
    await h.call('POST', `/groups/${s.groupId}/expenses`, {
      token: s.bea.token,
      body: {
        description: 'Halo-halo',
        splitType: 'equal',
        totalAmount: 90,
        memberIds: [s.m.alex, s.m.bea],
        spentOn: '2026-10-03',
      },
    }),
    201,
  );
  const { expenses } = ok(await h.call('GET', `/groups/${s.groupId}/expenses`, { token: s.alex.token }));
  assert.deepEqual(
    expenses.map((e) => [e.description, e.totalAmount, e.paidBy.name, e.myShare]),
    [
      ['Halo-halo', 90, 'Bea Santos', 45],
      ['Dinner at D\'Mall', 462, 'Miguel', 110],
      ['Tricycle + snacks', 100, 'Alex', 33.34],
    ],
  );
});

test('only the adder, the payer or an admin can edit or delete an expense', async () => {
  // Bea (member) did not add or pay for the tricycle expense
  const res = await h.call('DELETE', `/expenses/${s.equalExpenseId}`, { token: s.bea.token });
  assert.equal(res.status, 403);
  // Bea also can't rename the group
  assert.equal((await h.call('PATCH', `/groups/${s.groupId}`, { token: s.bea.token, body: { name: 'Mine' } })).status, 403);
  // Carlo can't even see it
  assert.equal((await h.call('GET', `/expenses/${s.equalExpenseId}`, { token: s.carlo.token })).status, 404);
});

test('editing an expense re-splits it and balances follow automatically', async () => {
  // Fix a typo in the description only
  const renamed = ok(
    await h.call('PATCH', `/expenses/${s.equalExpenseId}`, { token: s.alex.token, body: { description: 'Tricycle & snacks' } }),
  );
  assert.equal(renamed.expense.description, 'Tricycle & snacks');
  assert.equal(renamed.expense.totalAmount, 100);

  // Actually it was ₱120 and Miguel wasn't there → 60 / 60
  const resplit = ok(
    await h.call('PATCH', `/expenses/${s.equalExpenseId}`, {
      token: s.alex.token,
      body: { description: 'Tricycle & snacks', splitType: 'equal', totalAmount: 120, memberIds: [s.m.alex, s.m.bea] },
    }),
  );
  assert.deepEqual(resplit.expense.shares.map((x) => x.amount), [60, 60]);

  const b = ok(await h.call('GET', `/groups/${s.groupId}/balances`, { token: s.alex.token }));
  // Alex: paid 120 − (60 + 110 + 45) = −95; Bea: paid 90 − (60 + 176 + 45) = −191; Miguel: 462 − 176 = 286
  assert.equal(netOf(b, s.m.alex), -95);
  assert.equal(netOf(b, s.m.bea), -191);
  assert.equal(netOf(b, s.m.miguel), 286);
});

test('dashboard summary: net balance, you owe, monthly spending vs budget', async () => {
  ok(await h.call('PATCH', '/me', { token: s.alex.token, body: { monthlyBudget: 1000 } }));
  const { summary } = ok(await h.call('GET', '/me/summary?month=2026-10', { token: s.alex.token }));
  assert.deepEqual(
    {
      netBalance: summary.netBalance,
      youOwe: summary.youOwe,
      youAreOwed: summary.youAreOwed,
      oweGroupCount: summary.oweGroupCount,
      personalSpending: summary.personalSpending,
      budgetRemaining: summary.budgetRemaining,
    },
    { netBalance: -95, youOwe: 95, youAreOwed: 0, oweGroupCount: 1, personalSpending: 215, budgetRemaining: 785 },
  );
  const sept = ok(await h.call('GET', '/me/summary?month=2026-09', { token: s.alex.token }));
  assert.equal(sept.summary.personalSpending, 0);
  assert.equal((await h.call('GET', '/me/summary?month=October', { token: s.alex.token })).status, 400);
});

test('payments: to an account they wait for confirmation; to a guest they count at once', async () => {
  // Alex sends Bea ₱10 by GCash → pending until Bea confirms
  const sent = ok(
    await h.call('POST', `/groups/${s.groupId}/settlements`, {
      token: s.alex.token,
      body: { toMemberId: s.m.bea, amount: 10, method: 'gcash' },
    }),
    201,
  );
  assert.equal(sent.settlement.status, 'pending');
  let b = ok(await h.call('GET', `/groups/${s.groupId}/balances`, { token: s.alex.token }));
  assert.equal(netOf(b, s.m.alex), -95); // not counted yet

  const bSettle = ok(await h.call('GET', '/me/settle-up', { token: s.bea.token }));
  assert.equal(bSettle.awaitingMyConfirmation.length, 1);

  // The payer can't confirm their own payment
  assert.equal(
    (await h.call('PATCH', `/settlements/${sent.settlement.id}`, { token: s.carlo.token, body: { status: 'completed' } }))
      .status,
    404,
  );
  const confirmed = ok(
    await h.call('PATCH', `/settlements/${sent.settlement.id}`, { token: s.bea.token, body: { status: 'completed' } }),
  );
  assert.equal(confirmed.settlement.status, 'completed');
  b = ok(await h.call('GET', `/groups/${s.groupId}/balances`, { token: s.alex.token }));
  assert.equal(netOf(b, s.m.alex), -85);
  assert.equal(netOf(b, s.m.bea), -201);

  // Bea can't leave while she owes money
  const leave = await h.call('DELETE', `/groups/${s.groupId}/members/me`, { token: s.bea.token });
  assert.equal(leave.status, 409);
  assert.match(leave.body.error.message, /owes ₱201\.00/);

  // My settle-up view, across groups
  const mine = ok(await h.call('GET', '/me/settle-up', { token: s.alex.token }));
  assert.deepEqual(mine.toPay.map((p) => [p.group.name, p.to.name, p.amount]), [['Boracay Trip', 'Miguel', 85]]);
  assert.equal(mine.recent.length, 1);

  // Everyone pays Miguel (a guest → completed immediately)
  for (const [who, amount] of [
    [s.alex, 85],
    [s.bea, 201],
  ]) {
    const paid = ok(
      await h.call('POST', `/groups/${s.groupId}/settlements`, {
        token: who.token,
        body: { toMemberId: s.m.miguel, amount, method: 'cash' },
      }),
      201,
    );
    assert.equal(paid.settlement.status, 'completed');
  }

  b = ok(await h.call('GET', `/groups/${s.groupId}/balances`, { token: s.alex.token }));
  assert.equal(b.isSettled, true);
  assert.deepEqual(b.suggestedSettlements, []);
});

test('a member who has settled can leave; the group disappears from their list', async () => {
  // Before leaving, Bea's share of the bills counts as her spending and she has notifications about the group
  const { expenses: before } = ok(await h.call('GET', `/groups/${s.groupId}/expenses`, { token: s.bea.token }));
  const month = String(before[0].spentOn).slice(0, 7);
  const spentBefore = ok(await h.call('GET', `/me/summary?month=${month}`, { token: s.bea.token })).summary;
  assert.ok(spentBefore.personalSpending > 0);
  const inboxBefore = ok(await h.call('GET', '/notifications', { token: s.bea.token })).notifications;
  assert.ok(inboxBefore.some((n) => n.groupId === s.groupId));

  assert.equal((await h.call('DELETE', `/groups/${s.groupId}/members/me`, { token: s.bea.token })).status, 204);
  assert.deepEqual(ok(await h.call('GET', '/groups', { token: s.bea.token })).groups, []);
  assert.equal((await h.call('GET', `/groups/${s.groupId}`, { token: s.bea.token })).status, 404);

  // ...and afterwards the group is gone from her side entirely
  const spentAfter = ok(await h.call('GET', `/me/summary?month=${month}`, { token: s.bea.token })).summary;
  assert.equal(spentAfter.personalSpending, 0);
  assert.deepEqual(spentAfter.spendingByCategory, []);
  assert.equal(spentAfter.groupCount, 0);
  const inboxAfter = ok(await h.call('GET', '/notifications', { token: s.bea.token })).notifications;
  assert.ok(inboxAfter.every((n) => n.groupId !== s.groupId));

  // The group itself is still there for Alex
  assert.equal(ok(await h.call('GET', `/groups/${s.groupId}`, { token: s.alex.token })).group.id, s.groupId);

  // Her past expenses still show her name
  const { expenses } = ok(await h.call('GET', `/groups/${s.groupId}/expenses`, { token: s.alex.token }));
  assert.equal(expenses[0].paidBy.name, 'Bea Santos');
});

test('guests, invites and member management', async () => {
  // Anyone in the group can add a guest; duplicate names are refused
  const { member: jamie } = ok(
    await h.call('POST', `/groups/${s.groupId}/members`, { token: s.alex.token, body: { name: 'Jamie' } }),
    201,
  );
  assert.equal(jamie.isGuest, true);
  assert.equal(
    (await h.call('POST', `/groups/${s.groupId}/members`, { token: s.alex.token, body: { name: 'jamie' } })).status,
    409,
  );

  // Inviting someone already in the group → 409; invite then cancel
  const dupe = await h.call('POST', `/groups/${s.groupId}/invites`, { token: s.alex.token, body: { email: 'ALEX@example.com' } });
  assert.equal(dupe.status, 409);
  const { invite } = ok(
    await h.call('POST', `/groups/${s.groupId}/invites`, { token: s.alex.token, body: { email: 'jamie@example.com', memberId: jamie.id } }),
    201,
  );
  assert.equal(
    (await h.call('POST', `/groups/${s.groupId}/invites`, { token: s.alex.token, body: { email: 'jamie@example.com' } })).status,
    409,
  );
  assert.equal((await h.call('DELETE', `/invites/${invite.id}`, { token: s.alex.token })).status, 204);

  // Admin removes a settled guest
  assert.equal((await h.call('DELETE', `/groups/${s.groupId}/members/${jamie.id}`, { token: s.alex.token })).status, 204);

  // Guests can't be made admin
  const promote = await h.call('PATCH', `/groups/${s.groupId}/members/${s.m.miguel}`, {
    token: s.alex.token,
    body: { role: 'admin' },
  });
  assert.equal(promote.status, 400);
  // ...but can be renamed
  const renamed = ok(
    await h.call('PATCH', `/groups/${s.groupId}/members/${s.m.miguel}`, { token: s.alex.token, body: { name: 'Migs' } }),
  );
  assert.equal(renamed.member.name, 'Migs');
});


test('database safety nets: shares must equal the total, and RLS hides other groups', async () => {
  // Writing shares that don't add up is rejected at COMMIT
  const client = await h.pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE public.expense_shares SET amount = amount + 1 WHERE expense_id = $1 AND member_id = $2', [
      s.itemizedExpenseId,
      s.m.alex,
    ]);
    await assert.rejects(client.query('COMMIT'), /add up to/);
  } finally {
    client.release();
  }

  // Through the Supabase REST API (role "authenticated"), Carlo sees only his own groups
  const rls = await h.pool.connect();
  try {
    await rls.query('BEGIN');
    // Supabase grants these to "authenticated" by default; the local stub doesn't.
    await rls.query('GRANT USAGE ON SCHEMA public, auth TO authenticated');
    await rls.query('GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated');
    await rls.query(`SELECT set_config('request.jwt.claim.sub', $1, true)`, [s.carlo.id]);
    await rls.query('SET LOCAL ROLE authenticated');
    const groups = (await rls.query('SELECT name FROM public.groups ORDER BY name')).rows.map((r) => r.name);
    assert.deepEqual(groups, ['Carlo solo', 'Office Coffee']);
    const expenses = await rls.query('SELECT count(*)::int AS n FROM public.expenses');
    assert.equal(expenses.rows[0].n, 0); // none of Boracay's bills
    const balances = await rls.query('SELECT DISTINCT group_id FROM public.group_balances');
    assert.ok(balances.rows.every((r) => r.group_id !== s.groupId));
    await rls.query('ROLLBACK');
  } finally {
    rls.release();
  }
});


test('summary breaks monthly spending down by group category', async () => {
  const { summary } = ok(await h.call('GET', '/me/summary?month=2026-10', { token: s.alex.token }));
  const total = summary.spendingByCategory.reduce((a, c) => a + Math.round(c.amount * 100), 0);
  assert.equal(total, Math.round(summary.personalSpending * 100));
  assert.deepEqual(summary.spendingByCategory.map((c) => c.category), ['Travel & Trips']);
});
