/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.ejs", "./Public/**/*.js"],
  theme: {
    extend: {
      fontFamily : {
        sans : ['poppins', 'sans', 'sarif']
      },
      screens: {
        '2md': '900px',
        // => @media (min-width: 640px) { ... }
        'md-to-2md': { 'min': '768px', 'max': '900px' }, // Between md and 2md
      }
    },
  },
  plugins: [],
}

