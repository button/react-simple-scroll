# react-simple-scroll [![Build Status](https://travis-ci.org/button/react-simple-scroll.svg?branch=master)](https://travis-ci.com/button/react-simple-scroll)

`react-simple-scroll` is a declarative API for managing the scroll position
of a React application that uses [react-router](https://github.com/ReactTraining/react-router).
Its goal is nothing more than to bring the scroll-behavior of full-page
refreshes to an SPA (setting the scroll position to `(0, 0)` when a new "page" is
navigated to).

Sometimes, even when the URL path has changed, we don't want the screen position
to reset.  This might be the case in an onboarding flow when navigating from
`onboarding/step/1` to `onboarding/step/2`.  Navigating from `onboarding/step/2`
to `/` however should reset the scroll position.

If your app has `N` routes, you'd ostensibly have to declare how `N^2`
transitions should be handled.  `react-simple-scroll` instead allows you to
annotate your `react-router` route hierarchy with the "boundaries" of a page and
handles all possible transitions for you.

###### npm

```bash
npm install --save react-simple-scroll
```

###### yarn

```bash
yarn add react-simple-scroll
```

## Dependencies

`react-simple-scroll` has no explicit dependencies, but will need you to provide
three things:

* React
* `react-router`
* An implementation of `isEqual`.  `isEqual` should accept two objects and
  return `true` if their contents are deeply equal and `false` otherwise.
  Lodash, underscore, et. al. ship with such a method.  It wasn't included in
  this package assuming most users would already have an implementation
  hanging around.

We support any browser supported by both [react](https://github.com/facebook/react) and [react-router](https://github.com/ReactTraining/react-router).

## Quick Start

To install `react-simple-scroll`, add it as a middleware to `<Router />`:

```jsx
import { Router, applyRouterMiddleware } from 'react-router';
import { scrollMiddleware } from 'react-simple-scroll';
import isEqual from 'lodash.isequal';

const render = applyRouterMiddleware(
  scrollMiddleware({ isEqual })
);

<Router render={render}>
  {routes}
</Router>
```

Next, annotate your `react-router` route hierarchy with the `scrollFrame` prop.
A `scrollFrame` declares a "frame" within which we consider the page to have
not transitioned.  Any route's frame is found by starting with itself and
looking up the tree for the closest route which has the `srollFrame` property
set to `true`. If the app transitions from route `A` to route `B` and they have
the same scroll frame, the scroll position is not touched.  If they're
different, the scroll position is reset to `(0, 0)`.

```jsx
const routes = (
  <Route path="/">

    <Route path="foo" component={FooView} scrollFrame>
      <IndexRoute component={FooContainer} />
      <Route path="bar" component={BarContainer} />
      <Route path="baz" component={BazContainer} />
    </Route>

    <Route path="bloop" component={BloopView} scrollFrame>
      <IndexRoute component={BloopIndexContainer} />
      <Route scrollFrame>
        <Route path="bleep" component={BleepContainer} />
        <Route path="bleep/blap" component={BleepBlapContainer} />
        <Route path="bleep/blorp" component={BleepBlorpContainer} />
      </Route>
    </Route>

  </Route>
);
```

| **From**      | **To**              | **Reset?** |
|---------------|---------------------|------------|
| `/foo/bar`    | `/foo/baz`          | no         |
|`/foo`         | `/foo/bar`          | no         |
|`/foo`         | `/`                 | yes        |
|`/bloop/bleep` | `/bloop/bleep/blap` | no         |
|`/bloop`       | `/bloop/bleep`      | yes        |
|`/foo`         | `/bloop`            | yes        |

#### Algorithm

The algorithm for reseting the window position based on the current active
route and the previous active route in a transition is as follows:

* If my previous route and my current route have different `scrollFrame` routes
  (the nearest `scrollFrame` annotated route looking up my ancestor list), reset
  the window position
* If neither my previous route nor current route define a `scrollFrame`, reset
  the window position
* If the same route was clicked twice in a row and the query and search didn't
  change, reset the window position
* else do nothing

## API Reference

`react-simple-scroll` exports a component and a router middleware factory:

```jsx
import SimpleScroll, { scrollMiddleware } from 'react-simple-scroll'
```

#### `scrollMiddleware(props)`

`scrollMiddleware` is a function that accepts props to bind to the underlying
`<SimpleScroll />` component and returns an appropriate middleware for
`react-router`.

```jsx
import { scrollMiddleware } from 'react-simple-scroll';
import isEqual from 'lodash.isequal'


const middleware = scrollMiddleware({ isEqual });
```

#### `<SimpleScroll />`

This component will likely never be used directly by the user.  It emits no DOM
and is designed to sit between the `<Router />` and `<RouterContext />`
components of your heirarchy.


##### props

| **Name**                          | **Type** | **Required?** | **Description**                       |
|-----------------------------------|----------|---------------|---------------------------------------|
| routerProps                       | object   | true          | Supplied by react-router              |
| isEqual                           | func     | true          | Returns true if two objects are equal |
| enableBrowserScrollRestoration    | bool     | false         | Default `false`, see [Scroll Restoration](#scroll-restoration)             |
| children                          | node     | false         | Supplied by react-router              |

## Scroll Restoration

Many history implementations for react-router will fall back to the
[History API]() provided by most modern browsers.  The History API has a feature
wherin scroll positions are recorded when pushing and restored when popping
pages.  This has the unwanted side-effect of hijacking the scrolling we're
trying to manually set here.  By default, `react-simple-scroll` will make an
effort to disable this feature.  If however you'd rather leave it enabled,
simply pass the `enableBrowserScrollRestoration` to `scrollMiddleware`:

```jsx
const middleware = scrollMiddleware({
  isEqual,
  enableBrowserScrollRestoration: true
});
```

## License

MIT

## Contributing

If you're interested in contributing to `react-simple-scroll`, a good place to
start is by opening up an
[Issue](https://github.com/button/react-simple-scroll/issues) and describing the
change you'd like to see, be it a bug, feature request, or otherwise.  This
gives everyone a chance to review the proposal from a high-level before any
development effort is invested.

#### Lifecycle of a Change

* Open an [Issue](https://github.com/button/react-simple-scroll/issues) describing the change
* Fork `react-simple-scroll`
* Create a new branch for your changes: `git checkout -b <user>/update-bloop`
* Implement and add tests as necessary
* Make sure all tests pass: `npm test`
* Open a PR on Github against your branch: `<user>/update-bloop`
* Address any PR feedback
* We'll merge and cut a release!
