# Contributing to Loopora

Thank you for considering contributing to Loopora. This is a private project, but contributions are welcome for bug fixes, security improvements, and documentation.

## Code of Conduct

Be respectful, constructive, and professional. Harassment or disrespectful behavior will not be tolerated.

## How to Contribute

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes
4. Run the verification suite:

```bash
npm run typecheck
npm run lint
npm run build
```

5. Commit with a descriptive message:

```
feat: add new feature
fix: resolve issue with X
docs: update API documentation
chore: update dependencies
```

6. Push and open a Pull Request

## Development Setup

See [README.md](./README.md) for installation and setup instructions.

## Pull Request Guidelines

- Keep PRs focused on a single concern
- Include tests where applicable
- Update documentation for any API or behavior changes
- Ensure all checks pass before requesting review
- Link any related issues
