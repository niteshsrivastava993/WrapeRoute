# Security Spec: WrapRoute AI (EcoSync)

## 1. Data Invariants
- A `WrapperScan` must point to an existing `userId`.
- `ecoCoins` can only be incremented during a `WrapperScan` verification (simulated by backend/agent).
- `fillLevel` of a `SmartBin` cannot exceed `capacity`.
- `imageHash` must be unique (pHash) to prevent duplicate EPR fraud.

## 2. The Dirty Dozen (Malicious Payloads)
1. **Identity Spoofing**: Creating a `WrapperScan` with `userId` of another user.
2. **Privilege Escalation**: User updating their own profile to set `role: "admin"`.
3. **Wallet Injection**: User updating their own profile to increment `ecoCoins`.
4. **Duplicate EPR**: Submitting a scan with an `imageHash` that already exists.
5. **IoT Poisoning**: Public user updating a `SmartBin` fillLevel to trigger fake pickups.
6. **Brand Scraping**: Consumer user trying to read sensitive EPR achieved data of a brand they don't manage.
7. **Phantom Scan**: Creating a scan with a fake `createdAt` (not server time).
8. **Invalid ID**: Using a 1MB string as a `binId` to crash/exploit readers.
9. **State Skip**: Manually settings a scan status to `verified` during creation.
10. **Admin Lockdown**: Deleting the `admins` collection (if it existed) or trying to delete other users.
11. **Shadow Field**: Adding `isVerified: true` to a user profile update.
12. **Negative Coins**: Setting `ecoCoins` to `-9999`.

## 3. Test Runner (Draft Rules logic)
The rules will include `isValidUser()`, `isValidScan()`, etc., and check `affectedKeys()`.
