module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  safelist: [
    {
      pattern: /^(w-|h-|bg-|text-|border-|rounded-|shadow-|p-|m-|flex|grid|col-)/
    }
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  }
};