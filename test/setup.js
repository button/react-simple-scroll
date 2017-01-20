import { jsdom } from 'jsdom';

const markup = '<html><body></body></html>';

global.document = jsdom(markup, { url: 'http://localhost' });
global.window = document.defaultView;
global.navigator = { userAgent: 'node.js' };

beforeEach(() => {
  global.window.history.scrollRestoration = 'auto';
});
