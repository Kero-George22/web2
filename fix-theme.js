const fs = require('fs');
let css = fs.readFileSync('client/src/index.css', 'utf8');

const newThemes = `
  [data-theme='pink'] {
    --color-bg: 253 232 232;       /* #fde8e8 */
    --color-surface: 255 255 255;  /* #ffffff */
    --color-card: 255 241 242;     /* #fff1f2 */
    --color-border: 254 205 211;   /* #fecdd3 */
    --color-accent: 251 113 133;   /* #fb7185 */
    --color-gold: 245 158 11;      /* #f59e0b */
    --color-muted: 159 18 57;      /* #9f1239 (dark pink) */
    --color-text: 136 19 55;       /* #881337 */
  }

  [data-theme='burgundy'] {
    --color-bg: 40 10 18;          /* #280a12 */
    --color-surface: 65 17 30;     /* #41111e */
    --color-card: 80 20 37;        /* #501425 */
    --color-border: 111 26 50;     /* #6f1a32 */
    --color-accent: 225 29 72;     /* #e11d48 */
    --color-gold: 245 158 11;      /* #f59e0b */
    --color-muted: 253 164 175;    /* #fda4af */
    --color-text: 255 228 230;     /* #ffe4e6 */
  }

  [data-theme='netflix'] {
    --color-bg: 20 20 20;          /* #141414 */
    --color-surface: 35 35 35;     /* #232323 */
    --color-card: 45 45 45;        /* #2d2d2d */
    --color-border: 65 65 65;      /* #414141 */
    --color-accent: 229 9 20;      /* #e50914 */
    --color-gold: 245 200 66;      /* #f5c842 */
    --color-muted: 153 153 153;    /* #999999 */
    --color-text: 255 255 255;     /* #ffffff */
  }
`;

if (!css.includes("[data-theme='netflix']")) {
  css = css.replace(/\[data-theme='ocean'\]\s*\{[\s\S]*?\}\n/, match => match + newThemes);
  fs.writeFileSync('client/src/index.css', css, 'utf8');
}
