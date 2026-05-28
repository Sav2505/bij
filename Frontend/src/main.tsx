import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import { store } from './redux/store';
import { router } from './router/router';
import theme from './theme/theme';
import rtlCache from './theme/rtlCache';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <CacheProvider value={rtlCache}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <RouterProvider router={router} />
        </ThemeProvider>
      </CacheProvider>
    </Provider>
  </StrictMode>,
);
