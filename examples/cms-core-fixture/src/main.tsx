import '@parker2808/cms-core/theme.css';
import './override.css';
import './layout.css';

import { createRoot } from 'react-dom/client';

import { App } from './App';

createRoot(document.getElementById('root')!).render(<App />);
