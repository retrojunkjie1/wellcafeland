# Admin / God's Eye Access

God's Eye (Overseer Console) is available only to users with Firebase custom claim:

```
admin: true
```

## Access Paths

- **Profile → God's Eye — Overseer Console** (hidden entry visible only to admins)
- **Direct URL:** `/admin/overseer`
- **Command Console:** type "godseye" or "overseer"

## Security

- Hidden from non-admin users
- Guarded by `RequireAdmin` component
- Claims validated at runtime via `getIdTokenResult()`
- Custom claims checked directly (not role strings)

## Implementation

- `useAdminGate()` hook checks `token.claims?.admin === true`
- `RequireAdmin` component validates claims before rendering
- Profile page shows God's Eye entry only when `isAdmin === true`
- Command Console includes admin commands only for authenticated admins

## Granting Admin Access

Run the admin grant script:

```bash
npm run grant:admin
```

This sets:
- Firebase custom claim: `admin: true`
- Firestore role: `admin`
- Additional claims: `superadmin: true`, `godEye: true`

**Note:** User must sign out and sign back in for custom claims to take effect in the client app.

