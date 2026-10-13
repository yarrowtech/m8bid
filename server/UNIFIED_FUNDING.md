# MateBid unified funding account

Regular accounts use `role: user`; administrators use `role: admin`. Raise Funds
and Contribute Funds are dashboard activities, accessible with the same login.
Registration and login no longer ask users to choose an account role.

## Routes and compatibility

- `/dashboard`: combined account overview, notifications, saved campaigns, and campaign updates.
- `/raiser/*`: existing Raise Funds workspace.
- `/contributor/*`: existing Contribute Funds workspace and contribution history.
- `/account`: shared personal profile; KYC and bank details are shared between workspaces.
- `/account/security`: password change.
- `/api/contributions`: create, confirm, list, and download contribution receipts.
- `/api/admin/contributions`: administrator contribution history, refunds, and refund reconciliation.
- `/api/account`: overview, saved campaigns, notifications, campaign updates, payouts, and security.
- `/api/raiser` and `/api/contributor`: compatible activity APIs.

Existing `/api/investments`, `/api/investor`, and `/api/fundraiser` routes remain as
compatibility aliases. Historical collection names, document IDs, and financial
references remain intact. `models/Contribution.js` uses the existing contributions
stored in the `investments` collection. Legacy response keys remain available
alongside `contribution`, `contributionId`, and `contributions`.

The `access.investor` and `access.fundraiser` fields store legacy verification data;
they no longer restrict access to a dashboard. Responses also expose contributor
and raiser aliases for existing components. Shared identity and bank verification
are synchronized. Campaign-specific company verification remains separate.

## Financial behavior

New funding campaigns use contribution funding and require administrative approval.
Campaigns with confirmed funding remain viewable after their deadline. Identity
verification is required before starting a contribution; campaign owner identity
verification is required before approval. Ownership checks protect campaign creation,
management, updates, and payout requests.

Payment confirmation verifies the HMAC signature, gateway order, capture status,
currency, and amount. Confirmation, campaign funding, account totals, notifications,
and the transaction ledger commit together in a MongoDB transaction. This requires
a replica set or sharded cluster. The configured database supports transactions.

A conditional payout claim prevents duplicate transfers. Payouts require a verified
bank account and a configured gateway linked account. Uncertain transfers require
reconciliation; they are not automatically sent again. Payout and platform fee
records remain distinct from contribution amounts. No financial-return calculations
are used by the account or campaign pages.

Administrators can refund confirmed contributions before payout. A conditional claim
prevents refunds racing with payouts. Processed refunds reverse funding totals and
record a separate refund ledger entry in a database transaction. Pending refunds
can be reconciled using their gateway reference; uncertain requests are never
automatically retried. Payments already transferred require gateway reconciliation
and transfer reversal before refunding. Gateway refund calls follow the
[official Razorpay SDK](https://github.com/razorpay/razorpay-node/blob/master/documents/refund.md).

Admin account removal disables access while preserving campaigns and financial
history. Campaign deletion is blocked when contribution records exist. The admin
portal shows transactions from the existing ledger and both activities for a user.

## Migration

From the `server` directory:

```powershell
node scripts/migrate-unified-users.js
node scripts/migrate-unified-users.js --apply
node scripts/verify-unified-migration.js
```

The first command is a dry run. Applying the migration backs up user records to
the ignored `.migration-backups` directory, enables both activities, normalizes
roles, shares existing verification data, and rebuilds new profile totals from
existing records. It does not delete or rewrite historical payment collections.
The current five accounts were migrated and their IDs and password hashes verified.

## Validation

```powershell
node --test tests/authmiddleware.test.js tests/unifiedFunding.test.js tests/websiteAnalytics.test.js
```

Tests cover registration without role selection, one token creating campaigns and
starting contributions, ownership, identity verification, payment matching, and
concurrent confirmation. The gateway and persistence are mocked in funding unit
tests; they do not issue real payments or transfers. Database migration verification
uses read-only checks against the configured database.

Restart the API after deployment and sign in again to refresh cached user data.
