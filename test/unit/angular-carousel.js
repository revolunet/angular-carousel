/*global beforeEach, afterEach, describe, it, inject, expect, module, angular, $*/

describe('carousel', function () {
  'use strict';

  var scope, $compile, $sandbox;

  beforeEach(module('angular-carousel'));

  beforeEach(inject(function ($rootScope, _$compile_) {
      scope = $rootScope;
      $compile = _$compile_;
      $sandbox = $('<div id="sandbox"></div>').appendTo($('body'));
  }));

  afterEach(function() {
    $sandbox.remove();
    scope.$destroy();
  });

 function compileTpl() {
    var sampleData = {
      scope: {
        items: [
          {text: '1st slide'},
          {text: '2nd slide'},
          {text: '3rd slide'}
        ]
      },
      template: '<ul carousel><li ng-repeat="item in items">{{ item.text }}</li></ul>'
    };
    angular.extend(scope, sampleData.scope);
    var $element = $(sampleData.template).appendTo($sandbox);
    $element = $compile($element)(scope);
    scope.$digest();
    return $element;
  }

  describe('check directive compilation', function () {
    it('should add a wrapper div around the ul/li', function () {
        var elm = compileTpl();
        expect(elm.parent().hasClass('carousel-container')).toBe(true);
    });
    it('should add a class to the ul', function () {
        var elm = compileTpl();
        expect(elm.hasClass('carousel-slides')).toBe(true);
    });
    it('should add announcer attribute to each slide', function () {
        var elm = compileTpl();
        expect(elm.find('li[slide-announcer=true]').length).toBe(3);
    });
    it('should add announcer attribute to each slide dynamically', function () {
        var elm = compileTpl();
        scope.items.push({text:'4th slide'});
        scope.$digest();
        expect(elm.find('li[slide-announcer=true]').length).toBe(4);
    });
    it('generated container outerWidth should match the ul outerWidth', function () {
        var elm = compileTpl();
        scope.$digest();
        expect(elm.parent().outerWidth()).toBe(elm.outerWidth());
    });
  });
});
