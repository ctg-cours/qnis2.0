const { createRoot } = ReactDOM;
import App from './App.js';

const container = document.getElementById('root');

if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} else {
    console.error("L'élément racine 'root' est introuvable dans le DOM.");
}
