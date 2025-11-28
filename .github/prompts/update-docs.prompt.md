# Update Documentation

Update CHANGELOG.md and README.md after version upgrade.

## Prerequisites

Check version changed in the appropriate package.json:

**For root package:**

```bash
git --no-pager diff HEAD~1 HEAD -- package.json | grep version
```

**For packages/test:**

```bash
git --no-pager diff HEAD~1 HEAD -- packages/test/package.json | grep version
```

If no version change: STOP.

## Steps

1. **Use #codebase** to understand recent changes

2. **Determine which package changed:**
   - Root package (`@bemedev/app-solid`) → Update root CHANGELOG.md &
     README.md
   - Test package (`@bemedev/app-solid-test`) → Update
     packages/test/CHANGELOG.md & packages/test/README.md

3. **Update CHANGELOG.md** (top of appropriate file):

```markdown
<details>
<summary>

## **[VERSION] - YYYY/MM/DD** => _HH:MM_

</summary>

- Change description 1
- Change description 2
- Update dependencies
- <u>Test coverage **_100%_**</u>

</details>

<br/>
```

Order: Breaking changes → Features → Fixes → Docs → Refactor → Dependencies

4. **Update README.md** only if:
   - New features need documentation
   - API changes
   - New examples needed

5. **Package-specific guidelines:**

   **Root package (@bemedev/app-solid):**
   - Focus on Interpreter API, state management, SolidJS integration
   - Include usage examples with `createInterpreter`
   - Document `uiThread`, `provideOptions`, state matching methods

   **Test package (@bemedev/app-solid-test):**
   - Focus on testing utilities and helpers
   - Document `createTests` API and test methods
   - Include examples of testing interpreters with Vitest
   - Show `testBy`, `createFakeWaiter`, and assertion helpers
   - Explain how to test state transitions, context changes, UI thread

**STOP HERE - DO NOT COMMIT**

User will commit manually.

## Format

- Date: DD/MM/YYYY (European format)
- Time: HH:MM (24h format)
- English commit messages
- French allowed in CHANGELOG details
- Actions: Add, Fix, Remove, Update, Enhance, Refactor

## Commit Message Format (for reference only)

```
docs: update documentation for version X.Y.Z

Update CHANGELOG.md with version X.Y.Z changes

@chlbri:bri_lvi@icloud.com
```
