# Scientific Calculator (HTML/CSS/JS)

This repository contains a modern, responsive scientific calculator built with plain HTML, CSS and JavaScript.

Features added in this version:
- History panel (persistent via localStorage) — tap entries to reuse expressions
- Memory buttons: M+, M-, MR, MC
- Parentheses highlighting by depth to help matching
- Keyboard shortcut cheat sheet (open with `?` or the ? button)
- Mobile-friendly layout and larger touch targets
- Responsive layout that moves history into a sidebar on wide screens and stacked on small screens

How to use
1. Put `index.html`, `styles.css`, and `script.js` in the same folder (already present in this commit).
2. Open `index.html` in a modern browser.
3. Use the on-screen buttons or keyboard. Press Enter for equals, Backspace to delete, Escape to clear. Press `?` to open shortcuts help.

Notes & security
- Evaluation uses a limited injected environment via the Function constructor. It's intended for client-side use only. Do not evaluate untrusted user input on a server using this code.

Want me to open a pull request or adjust styling/features (dark theme, history export/import, math.js integration)? Reply with the branch name you'd like me to use.
