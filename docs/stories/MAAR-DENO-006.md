# MAAR-DENO-006: Setup GitHub Actions for JSR Publishing

## User Story

As a maintainer, I want a GitHub Actions workflow that publishes to JSR on tag releases so that
publishing is automated and doesn't require local JSR tokens.

## Acceptance Criteria

- [ ] Create `.github/workflows/publish.yml` for JSR publishing
- [ ] Configure workflow to trigger on version tags (`v*.*.*`)
- [ ] Setup trusted publishing with JSR (GitHub OIDC, no token needed)
- [ ] Add workflow status badge to README
- [ ] Document release process in CONTRIBUTING.md (or README)
- [ ] Verify `deno publish --dry-run` passes in CI

## GitHub Actions Workflow

### .github/workflows/publish.yml

```yaml
name: Publish to JSR

on:
  push:
    tags:
      - "v*.*.*"

jobs:
  publish:
    runs-on: ubuntu-latest

    permissions:
      contents: read
      id-token: write # Required for trusted publishing with JSR

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Deno
        uses: denoland/setup-deno@v1
        with:
          deno-version: v2.x

      - name: Check formatting
        run: deno fmt --check

      - name: Run linter
        run: deno lint

      - name: Type check
        run: deno check maar.ts

      - name: Run tests
        run: deno test --allow-read --allow-write

      - name: Dry run publish
        run: deno publish --dry-run

      - name: Publish to JSR
        run: deno publish
        # Uses trusted publishing - no JSR_TOKEN needed!
        # The JSR registry trusts GitHub's OIDC token
```

## JSR Trusted Publishing Setup

### Step 1: Create JSR Package

1. Go to https://jsr.io/new
2. Create package under your scope (e.g., `@username/maar`)
3. Select "GitHub Actions" as publishing method
4. Connect your GitHub repository

### Step 2: Configure GitHub Repository

1. Go to repository Settings → Actions → General
2. Ensure "Workflow permissions" allows read and write (for OIDC)
3. No secrets needed! Trusted publishing uses OIDC.

## Release Process Documentation

### README.md Section

```markdown
## Releasing

To publish a new version to JSR:

1. Update version in `deno.json` and `jsr.json`
2. Commit: `git commit -am "Bump version to v1.0.1"`
3. Tag: `git tag v1.0.1`
4. Push: `git push && git push --tags`

GitHub Actions will automatically:

- Run tests and checks
- Publish to JSR on successful tag push
```

## Workflow Features

| Check      | Purpose                        |
| ---------- | ------------------------------ |
| Format     | Ensures consistent code style  |
| Lint       | Catches common issues          |
| Type check | Validates TypeScript           |
| Tests      | Ensures functionality works    |
| Dry run    | Validates publish will succeed |
| Publish    | Publishes to JSR               |

## Definition of Done

- [ ] `.github/workflows/publish.yml` created and committed
- [ ] Workflow triggers correctly on tag push
- [ ] All checks (format, lint, type, test) run in CI
- [ ] JSR package configured for trusted publishing
- [ ] Release process documented in README
- [ ] Badge added to README showing publish status

## Effort Estimate

1 story point
