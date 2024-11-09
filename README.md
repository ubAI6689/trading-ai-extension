# AI Trading Assistant Chrome Extension

A Chrome extension that provides real-time market analysis and trading insights with a collapsible side panel interface.

![Trading Panel Screenshot](docs/screenshot.png)

## Features

- 📊 Real-time price monitoring
- 📈 Market sentiment analysis
- 📉 Volume tracking
- ⚡ Quick market metrics
- 🔔 Real-time alerts for significant price movements
- 📱 Collapsible side panel interface
- ⚙️ Customizable settings

## Installation

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/ubAI6689/trading-ai-extension.git
cd trading-ai-extension
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

### Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select the `dist` folder from your project directory

## Development

### Project Structure
```
trading-ai-extension/
├── src/
│   ├── components/
│   │   └── TradingPanel.tsx    # Main trading panel component
│   ├── styles/
│   │   └── globals.css         # Global styles including Tailwind
│   ├── background.ts           # Extension background script
│   └── content.tsx             # Content script for injection
├── public/
│   ├── icons/                  # Extension icons
│   ├── popup.html              # Extension popup
│   └── manifest.json           # Extension manifest
└── dist/                       # Built extension files
```

### Available Scripts

- `npm run build` - Build the extension
- `npm run watch` - Watch for changes and rebuild
- `npm run clean` - Clean the build directory
- `npm run dev` - Clean, build, and watch for changes

### Technologies Used

- React 18
- TypeScript
- Tailwind CSS
- Webpack
- Chrome Extension APIs
- Lucide React Icons

## Configuration

### Manifest Settings

The extension requires the following permissions:
- `activeTab` - For accessing the current tab
- `storage` - For saving user preferences
- `<all_urls>` - For injecting the panel on any website

### Development Notes

- The extension uses Shadow DOM to prevent style conflicts with host pages
- Tailwind classes are included via CDN to ensure consistent styling
- The panel is injected after the page loads to ensure proper rendering

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Building for Production

To create a production build:

```bash
# Clean the dist folder
npm run clean

# Create production build
NODE_ENV=production npm run build
```

The production build will be created in the `dist` folder, ready for distribution.

## Future Improvements

- [ ] Add real market data integration
- [ ] Implement websocket connections for live updates
- [ ] Add more technical indicators
- [ ] Improve alert system with notifications
- [ ] Add chart visualization
- [ ] Implement user authentication
- [ ] Add more customization options

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.

## Acknowledgments

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/)
- [Lucide Icons](https://lucide.dev/)

---

Made with ❤️ by ABU