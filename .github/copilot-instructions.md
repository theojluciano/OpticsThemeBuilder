# GitHub Copilot Instructions for OpticsThemeBuilder

## General Guidelines

### Code Style & Practices
- Follow the existing code style and patterns in the repository
- Use TypeScript for type safety where applicable
- Prefer functional components and hooks in React/Svelte
- Keep code DRY (Don't Repeat Yourself)
- Write clear, self-documenting code with meaningful variable names

### Documentation
- **DO NOT create summary markdown files** (e.g., `SUMMARY.md`, `FIX_SUMMARY.md`, `CHANGES.md`) unless explicitly requested by the user
- Update existing documentation when making significant changes
- Add inline code comments for complex logic
- Document public APIs and exported functions

### Optics Design System
- Always use official Optics design tokens from `optics-tokens.css`
- Reference tokens using `var(--op-token-name)` format
- Button heights: small=2.8rem (28px), medium=3.6rem (36px), large=4rem (40px)
- Root font size is set to 62.5% (1rem = 10px) for Optics compatibility
- Use Optics MCP server tools when available to verify token names and values

### File Organization
- Keep components in `src/lib/components/` (for Svelte) or appropriate directories
- Styles go in `src/styles/` with descriptive names
- Shared utilities in `src/lib/` subdirectories
- Test files adjacent to source files or in `tests/` directory

### Git & Version Control
- Make atomic commits with clear, descriptive messages
- Don't commit generated files (dist/, node_modules/)
- Update .gitignore when adding new build artifacts

### Testing
- Run tests before suggesting changes are complete
- Add tests for new features
- Update tests when modifying existing functionality

### Build & Development
- Always run `npm run build` to verify changes compile successfully
- Check for TypeScript/linting errors before completing tasks
- Test in development mode (`npm run dev`) when UI changes are made

## Project-Specific Notes

### Color System
- Primary color tokens use HSL format with light-dark() for theme switching
- Neutral colors use 4% saturation (desaturated from primary hue)
- Alert colors (danger, warning) have full scales with "on" text colors
- All color scales go from plus-max to minus-max with 9 stops each

### Component Development
- Button components must use official Optics sizing tokens
- Always include hover, focus, and disabled states
- Support all Optics variants (primary, danger, warning, etc.)
- Mobile responsive: buttons scale to large on screens ≤768px

### Token Management
- New tokens should follow Optics naming conventions: `--op-[category]-[name]`
- Document token purpose and expected values
- Generate scales programmatically when possible using CSS calc() or light-dark()

## What NOT to Do

❌ Don't create unsolicited summary/changelog files  
❌ Don't hardcode color values - always use tokens  
❌ Don't use pixel values for sizing - use rem with Optics scale  
❌ Don't modify node_modules or generated files  
❌ Don't commit without running build/tests first  
❌ Don't break existing functionality without discussion

## Questions?

When in doubt:
1. Check existing patterns in the codebase
2. Refer to OPTICS_FORMAT.md for design system details
3. Ask the user for clarification rather than making assumptions
4. Use the Optics MCP server to verify design system compliance