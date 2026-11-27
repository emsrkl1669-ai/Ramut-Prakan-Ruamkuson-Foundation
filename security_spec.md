# Firestore Security Specification (Phase 0)

## 1. Data Invariants
1. Publicly readable collections (`activities`, `annualEvents`, `donationsPublic`) must contain zero PII (no phone numbers, emails, or home addresses).
2. PII collections (`emergencyReports`, `volunteerApplications`, `cprRegistrations`, `acupunctureBookings`, `contactMessages`) must only be read/listed by the document owner (`resource.data.userId == request.auth.uid`) or verified admins.
3. Internal document records (`internalDocs`) must only be accessible to verified foundation admins.
4. Every create and update must pass strict `isValid[Entity](incoming())` checks, enforce `userId == request.auth.uid` on creation, verify `request.auth.token.email_verified == true`, and enforce `request.time` server timestamps.
5. Terminal state transitions (e.g., `status == 'เสร็จสิ้น'` or `'ยกเลิก'`) are locked against non-admin modifications.

## 2. Dirty Dozen Attack Payloads (Expected: PERMISSION_DENIED)
1. Shadow Field Injection on `donationsPublic`: `{ donorDisplayName: "Attacker", amount: 100, ..., isVerified: true }` -> Blocked by `hasOnly(...)`.
2. Unverified Email Spoof on `internalDocs`: `{ email: "emsrkl1669@gmail.com", email_verified: false }` -> Blocked by `isVerified()`.
3. Identity Spoofing on `emergencyReports`: `{ userId: "victim_uid", ... }` -> Blocked by `data.userId == request.auth.uid`.
4. Resource Poisoning ID > 128 chars on `activities/{150_char_id}` -> Blocked by `isValidId(id)`.
5. Value Poisoning on `donationsPublic`: `{ amount: -5000 }` or `{ amount: "100" }` -> Blocked by `data.amount is number && data.amount > 0 && data.amount <= 10000000`.
6. Timestamp Tampering on `annualEvents`: `{ createdAt: "2020-01-01T00:00:00Z" }` -> Blocked by `incoming().createdAt == request.time`.
7. PII Scraping `list` on `emergencyReports` by unauthenticated or non-owner user -> Blocked by `resource.data.userId == request.auth.uid`.
8. PII `get` on `acupunctureBookings/{otherUserIdDoc}` by non-owner -> Blocked by `existing().userId == request.auth.uid`.
9. Self-Assigned Admin Privilege Escalation on `admins/{myUid}` -> Blocked by `isBootstrapAdmin()`.
10. Terminal State Bypass on `emergencyReports` (`status == 'เสร็จสิ้น'` updated by non-admin) -> Blocked by terminal state lock.
11. Immortal Field Mutation on `annualEvents` (`createdAt` or `userId` modified during update) -> Blocked by `affectedKeys().hasOnly(...)` & immutability check.
12. Oversized Payload Injection (`pdfDataUrl` > 350,000 chars) -> Blocked by `.size() <= 350000`.
