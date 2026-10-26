import { createCssVariablesTheme } from 'shiki';

export const SHIKI_THEME_NAME = 'css-variables';

export const shikiCssTheme = createCssVariablesTheme({
  name: SHIKI_THEME_NAME,
  variablePrefix: '--shiki-',
  fontStyle: true,
});
