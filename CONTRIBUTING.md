# Contributing

Thanks for helping build AI Outcomes Suite. This project is designed for practical, visible contributions.

## Development

```bash
npm install
npm run build
npm run demo:all
```

## Good Contribution Areas

- SAT tutor: add skills, diagnostics, sample questions, mastery rules, and study plans.
- Compliance OS: add exports, event schemas, retention policies, and report templates.
- Legal agent: add document patterns, deadline parsing, safer disclaimers, and example letters.
- Shared: add provider interfaces, test helpers, and fixtures.

## Pull Request Checklist

- Keep changes scoped to one product or shared utility.
- Add or update examples when behavior changes.
- Run `npm run build` and `npm run demo:all`.
- Do not commit secrets, private documents, or real user data.
- For compliance and legal features, avoid claiming final legal compliance or legal advice.

## Maintainer Style

Prefer small, readable PRs. Explain the user problem first, then the implementation. The repo should stay friendly to beginners without becoming toy code.
