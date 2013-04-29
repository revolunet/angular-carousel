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

 function compileTpl(overrideOptions) {
    var options = {
      showIndicator: false,
      index: 1,
      useIndex: true,
      useIndicator: true
    };
    if (overrideOptions) angular.extend(options, overrideOptions);
    var showIndicator = !!options.showIndicator;
    var sampleData = {
      scope: {
        items: [
          {text: '1st slide'},
          {text: '2nd slide'},
          {text: '3rd slide'}
        ],
        index: options.index
      }
    };
    var tpl = '<ul data-rn-carousel ';
    if (options.useIndicator) tpl += ' data-rn-carousel-indicator="' + showIndicator + '" ';
    if (options.useIndex) tpl += ' data-rn-carousel-index="index" ';
    tpl += '><li class="test" style="width:200px" ng-repeat="item in items">{{ item.text }}</li></ul>';

    angular.extend(scope, sampleData.scope);
    var $element = $(tpl).appendTo($sandbox);
    $element = $compile($element)(scope);
    scope.$digest();
    return $element;
  }

  function validCSStransform(elm) {
    var expectedPosition = (elm.outerWidth() * elm.scope().carouselIndex * -1),
        expectedMatrix = 'matrix(1, 0, 0, 1, ' + expectedPosition + ', 0)',
        curMatrix = elm.css('-webkit-transform');
    if (!curMatrix) curMatrix = elm.css('transform');
    expect(curMatrix).toBe(expectedMatrix);
  }

  describe('check carousel directive with an index defined', function () {
    it('should add a wrapper div around the ul/li', function () {
        var elm = compileTpl();
        expect(elm.parent().hasClass('rn-carousel-container')).toBe(true);
    });
    it('should add a class to the ul', function () {
        var elm = compileTpl();
        expect(elm.hasClass('rn-carousel-slides')).toBe(true);
    });
    it('should have enough slides', function () {
        var elm = compileTpl();
        expect(elm.find('li').length).toBe(scope.items.length);
    });
    it('generated container outerWidth should match the ul outerWidth', function () {
        var elm = compileTpl();
        expect(elm.parent().outerWidth()).toBe(elm.outerWidth());
    });
    it('the index attribute should be used to position the first visible slide', function () {
        var elm = compileTpl();
        validCSStransform(elm);
    });
    it('index change should update the carousel position', function () {
        var elm = compileTpl();
        scope.index = 2;
        scope.$digest();
        validCSStransform(elm);
    });
  });

  describe('check carousel directive with no index defined', function () {
    it('should add a wrapper div around the ul/li', function () {
        var elm = compileTpl({useIndex:false});
        expect(elm.parent().hasClass('rn-carousel-container')).toBe(true);
    });
    it('should add a class to the ul', function () {
        var elm = compileTpl({useIndex:false});
        expect(elm.hasClass('rn-carousel-slides')).toBe(true);
    });
    it('should have enough slides', function () {
        var elm = compileTpl({useIndex:false});
        expect(elm.find('li').length).toBe(scope.items.length);
    });
    it('generated container outerWidth should match the ul outerWidth', function () {
        var elm = compileTpl({useIndex:false});
        expect(elm.parent().outerWidth()).toBe(elm.outerWidth());
    });
    it('the index attribute should be used to position the first visible slide', function () {
        var elm = compileTpl({useIndex:false});
        validCSStransform(elm);
    });
    it('index change should update the carousel position', function () {
        var elm = compileTpl({useIndex:false});
        scope.index = 2;
        scope.$digest();
        validCSStransform(elm);
    });
  });

  describe('check carousel indicator directive', function () {
    it('should add an indicator div', function () {
        var elm = compileTpl({showIndicator: true});
        expect(elm.parent().find('.rn-carousel-indicator').length).toBe(1);
    });
    it('should add enough indicators', function () {
        var elm = compileTpl({showIndicator: true});
        expect(elm.parent().find('.rn-carousel-indicator span').length).toBe(scope.items.length);
    });
    it('should have an active indicator based on the current index', function () {
        var elm = compileTpl({showIndicator: true});
        expect(elm.parent().find('.rn-carousel-indicator span:nth-of-type(' + (scope.index + 1) + ')').hasClass('active')).toBe(true);
    });
    it('should update the active indicator when index changes', function () {
        var elm = compileTpl({showIndicator: true});
        scope.index = 2;
        scope.$digest();
        expect(elm.parent().find('.rn-carousel-indicator span:nth-of-type(' + (scope.index + 1) + ')').hasClass('active')).toBe(true);
    });
  });
});
