// eslint-disable-next-line import/no-unresolved
import React, { PropTypes, Component } from 'react';

class SimpleScroll extends Component {

  constructor(props) {
    super(props);

    const manageScroll = (
      !props.enableBrowserScrollRestoration
      && 'scrollRestoration' in window.history
    );

    if (manageScroll) {
      window.history.scrollRestoration = 'manual';
    }
  }

  componentDidUpdate(prevProps) {
    const { routerProps, isEqual } = this.props;
    const { routerProps: prevRouterProps } = prevProps;

    const prevFrame = SimpleScroll.findLastFrame(prevRouterProps.routes);
    const frame = SimpleScroll.findLastFrame(routerProps.routes);

    const switchedScrollFrames = frame !== prevFrame || frame === null;

    if (switchedScrollFrames) {
      SimpleScroll.reset();
      return;
    }

    const prevRoute = prevRouterProps.routes.slice(-1)[0];
    const route = routerProps.routes.slice(-1)[0];

    const clickedSameRoute = route === prevRoute;
    const searchChanged = (
      prevRouterProps.location.search !== routerProps.location.search
    );
    const paramsChanged = !isEqual(prevRouterProps.params, routerProps.params);

    if (clickedSameRoute && !searchChanged && !paramsChanged) {
      SimpleScroll.reset();
    }
  }

  render() {
    return this.props.children;
  }

}

SimpleScroll.propTypes = {
  routerProps: PropTypes.shape({
    routes: PropTypes.arrayOf(PropTypes.object).isRequired,
    location: PropTypes.shape({
      search: PropTypes.string.isRequired
    }).isRequired
  }).isRequired,
  isEqual: PropTypes.func.isRequired,
  enableBrowserScrollRestoration: PropTypes.bool,
  children: PropTypes.node
};

SimpleScroll.defaultProps = {
  enableBrowserScrollRestoration: false
};

SimpleScroll.findLastFrame = (routes) => (
  routes.reduceRight(
    (acc, r) => acc || (r.scrollFrame ? r : null),
    null
  )
);

SimpleScroll.reset = () => window.scrollTo(0, 0);

export default SimpleScroll;

export const scrollMiddleware = (simpleScrollProps) => ({
  renderRouterContext: (child, routerProps) => (
    <SimpleScroll routerProps={routerProps} {...simpleScrollProps}>
      {child}
    </SimpleScroll>
  )
});
