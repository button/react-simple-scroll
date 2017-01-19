// eslint-disable-next-line import/no-unresolved
import React from 'react';
import { mount } from 'enzyme';
import expect from 'expect.js';
import sinon from 'sinon';
import isEqual from 'lodash.isequal';

import SimpleScroll from '../src/SimpleScroll';

describe('<SimpleScroll />', () => {
  before(function() {
    this._scrollTo = global.window.scrollTo;
    this._history = global.window.history;
  });

  after(function() {
    global.window.scrollTo = this._scrollTo;
    global.window.history = this._history;
  });

  beforeEach(function() {
    global.window.scrollTo = sinon.spy();

    this.route1 = { path: '/', scrollFrame: true };
    this.route2 = { path: 'foo', scrollFrame: true };
    this.route3 = { path: 'bar' };
    this.params = { step: 1 };

    this.isEqual = (a, b) => a === b;

    this.routerProps = {
      routes: [this.route1, this.route2, this.route3],
      location: { search: '' },
      params: this.params
    };

    this.wrapper = mount(
      <SimpleScroll isEqual={this.isEqual} routerProps={this.routerProps}>
        <div />
      </SimpleScroll>
    );
  });

  it('resets the window position if we leave a scrollFrame', function() {
    this.wrapper.setProps({
      routerProps: {
        routes: [this.route1],
        location: { search: '' },
        params: this.params
      }
    });

    expect(global.window.scrollTo.args[0]).to.eql([0, 0]);
  });

  it('wont reset the position if we do not change frame', function() {
    this.wrapper.setProps({
      routerProps: {
        routes: [this.route1, this.route2, { path: 'qux' }],
        location: { search: '' },
        params: this.params
      }
    });

    expect(global.window.scrollTo.callCount).to.be(0);
  });

  it('resets the window position if the same route is activated', function() {
    this.wrapper.setProps({
      routerProps: {
        routes: [this.route1, this.route2, this.route3],
        location: { search: '' },
        params: this.params
      }
    });

    expect(global.window.scrollTo.args[0]).to.eql([0, 0]);
  });

  it('wont reset the window position if the same route is activated and a different search is provided', function() {
    this.wrapper.setProps({
      routerProps: {
        routes: [this.route1, this.route2, this.route3],
        location: { search: '?param=new' },
        params: this.params
      }
    });

    expect(global.window.scrollTo.callCount).to.be(0);
  });

  it('resets the window position if neither route had a scrollFrame', function() {
    const route1 = { path: '/' };
    const route2 = { path: 'foo' };

    const wrapper = mount(
      <SimpleScroll
        isEqual={this.isEqual}
        routerProps={{
          routes: [route1, route2],
          location: { search: '' },
          params: this.params
        }}>
        <div />
      </SimpleScroll>
    );

    wrapper.setProps({
      routerProps: {
        routes: [route1],
        location: { search: '' },
        params: this.params
      }
    });

    expect(global.window.scrollTo.args[0]).to.eql([0, 0]);
  });

  it('doesnt reset the window position if the same route was activated but with different params', function() {
    this.wrapper.setProps({
      routerProps: {
        routes: [this.route1, this.route2, this.route3],
        location: { search: '' },
        params: { step: 2 }
      }
    });

    expect(global.window.scrollTo.callCount).to.be(0);
  });

  it('uses a trivial #isEqual implementation by default', function() {
    this.wrapper.setProps({
      routerProps: {
        routes: [this.route1, this.route2, this.route3],
        location: { search: '' },
        params: { step: 1 }
      }
    });

    expect(global.window.scrollTo.callCount).to.be(0);

    this.wrapper.setProps({
      isEqual,
      routerProps: {
        routes: [this.route1, this.route2, this.route3],
        location: { search: '' },
        params: { step: 1 }
      }
    });

    expect(global.window.scrollTo.callCount).to.be(1);
  });

  describe('enableBrowserScrollRestoration', () => {
    it('sets scrollRestoration by default', () => {
      expect(global.window.history.scrollRestoration).to.be('manual');
    });

    it('does not set scrollRestoration if the prop is true', function() {
      global.window.history.scrollRestoration = 'auto';
      expect(global.window.history.scrollRestoration).to.be('auto');

      mount(
        <SimpleScroll
          isEqual={this.isEqual}
          routerProps={this.routerProps}
          enableBrowserScrollRestoration>
          <div />
        </SimpleScroll>
      );

      expect(global.window.history.scrollRestoration).to.be('auto');
    });

    it('does not set scrollRestoration if the brower history doesnt support it', function() {
      delete global.window.history.scrollRestoration;

      mount(
        <SimpleScroll
          isEqual={this.isEqual}
          routerProps={this.routerProps} >
          <div />
        </SimpleScroll>
      );

      expect(global.window.history.scrollRestoration).to.be(undefined);
    });
  });
});
