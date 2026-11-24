/// <reference types="vite/client" />
interface ImportMetaEnv {
  /** Public, free-tier Gemini key for the GitHub Pages build only. Never a billed key. */
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_GEMINI_MODEL?: string;
}
