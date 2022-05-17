module.exports = {
  content: ["./views/**/*.ejs", "./node_modules/flowbite/**/*.js"],
  theme: {
    extend: { },
  },
  plugins: [        
    require('flowbite/plugin'),
    require('autoprefixer'),
],
};
