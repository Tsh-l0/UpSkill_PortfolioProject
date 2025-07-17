import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeStores } from './store';

// Initialize stores before rendering
const startApp = async () => {
  try {
    const { success, cleanup } = await initializeStores();
    
    if (success) {
      console.log('Stores initialized successfully');
    }

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);

    // Store cleanup function for potential future use
    window.storeCleanup = cleanup;
  } catch (error) {
    console.error('Failed to initialize app:', error);
    
    // Render app anyway with fallback
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
  }
};

startApp();