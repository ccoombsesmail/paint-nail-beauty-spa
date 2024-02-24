import type { Config } from 'tailwindcss';

export default {
  mode: 'jit',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './app/components/**/*.{js,ts,jsx,tsx,mdx}',
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    // './node_modules/@tremor/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {}
} satisfies Config;
