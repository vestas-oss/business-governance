/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,js,ts,tsx}"],
    safelist: [
      "line-clamp-2",
      "truncate",
      "text-xs",
      "text-sm",
      "text-base",
      "text-lg"
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }