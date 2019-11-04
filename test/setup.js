import { jsdom } from 'jsdom';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

const markup = '<html><body></body></html>';

global.document = jsdom(markup, { url: 'http://localhost' });
global.window = document.defaultView;
global.navigator = { userAgent: 'node.js' };

beforeEach(() => {
  global.window.history.scrollRestoration = 'auto';
});
