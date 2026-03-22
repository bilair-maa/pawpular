import { createGlobalStyle } from 'styled-components';

// Global CSS reset — sets fonts, box-sizing, and the page background
export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    background: ${({ theme }) => theme.colors.backgroundGradient};
    background-attachment: fixed;
    color: ${({ theme }) => theme.colors.text};
    font-family: Nunito, ui-rounded, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    overflow-x: hidden;
  }

  h1,
  h2,
  h3,
  h4 {
    font-family: Fredoka, Nunito, ui-rounded, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-weight: 600;
    line-height: 1.05;
  }

  button {
    font-family: inherit;
  }

  img {
    max-width: 100%;
    display: block;
  }

  ::selection {
    background-color: ${({ theme }) => theme.colors.primarySoft};
  }
`;
