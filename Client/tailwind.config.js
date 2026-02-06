/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
      colors: {
        primary: '#0055FF', // The bright blue button color
        sidebar: '#FFFFFF',
        background: '#F3F5F7', // Light grey background
        textMain: '#1A202C',
        textSub: '#718096',
        navy: '#0A192F', // The dark sidebar color from the right
      }
    },
	},
};