# Game Recharge Store

A modern web application for game recharges and digital content, built with React, Vite, and Tailwind CSS.

## Features

- Modern React with Vite for fast development
- Responsive design with Tailwind CSS
- Clean and intuitive user interface
- Easy navigation between pages
- Contact form for user inquiries

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd game-recharge-store
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

To create a production build:

```bash
npm run build
```

The build output will be in the `dist` directory.

## Deployment to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy the project:
```bash
vercel
```

For production deployment:
```bash
vercel --prod
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_API_URL=your_api_url
```

## Project Structure

```
src/
  ├── components/     # Reusable components
  ├── pages/         # Page components
  ├── App.jsx        # Main application component
  └── main.jsx       # Application entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.