import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './fonts.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import './index.css';
import App from './App';
import { detectInitialLanguage, loadDictionary } from './context/LanguageContext';

// Load only the dictionary for the visitor's language before the first render.
const lang = detectInitialLanguage();
document.documentElement.lang = lang;
loadDictionary(lang).then(content => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App initialLang={lang} initialContent={content} />
    </StrictMode>,
  );
});
