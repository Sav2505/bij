import rtlPlugin from 'stylis-plugin-rtl';
import createCache from '@emotion/cache';

const rtlCache = createCache({
  key: 'muirtl',
  stylisPlugins: [rtlPlugin],
});

export default rtlCache;
