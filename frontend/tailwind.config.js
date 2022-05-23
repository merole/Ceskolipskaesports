module.exports = {
  content: ["./views/**/*.ejs", "./node_modules/flowbite/**/*.js"],
  theme: {
    extend: {
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
        'bebasNeue': ['Bebas Neue', 'cursive'],
      }
    },
  },
  plugins: [        
    require('flowbite/plugin'),
    require('autoprefixer'),
],
};
