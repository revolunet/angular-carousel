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
      useIndex: false,
      useIndicator: false,
      useBuffer: false
    };
    if (overrideOptions) angular.extend(options, overrideOptions);
    var sampleData = {
      scope: {
        items: [],
        localIndex: 5
      }
    };
    for (var i=0; i<25; i++) {
      sampleData.scope.items.push({
        text: 'slide #' + i,
        id: i
      });
    }
    var tpl = '<ul rn-carousel ';
    if (options.useIndicator) tpl += ' rn-carousel-indicator ';
    if (options.useBuffer) tpl += ' rn-carousel-buffered ';
    if (options.useIndex) tpl += ' rn-carousel-index="' + options.useIndex + '" ';
    tpl += '><li class="test" style="width:200px" ng-repeat="item in items" id="slide-{{ item.id }}">{{ item.text }}</li></ul>';

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

  describe('directive', function () {
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
  });

  describe('directive with a data-bound index defined', function () {
    it('the index attribute should be used to position the first visible slide', function () {
        var elm = compileTpl({useIndex: 'localIndex'});
        validCSStransform(elm);
    });
    it('index change should update the carousel position', function () {
        var elm = compileTpl({useIndex: 'localIndex'});
        scope.localIndex = 5;
        scope.$digest();
        validCSStransform(elm);
    });
    it('carousel index should be bound to local index', function () {
        var elm = compileTpl({useIndex: 'localIndex'});
        scope.localIndex = 5;
        scope.$digest();
        expect(elm.scope().carouselIndex).toBe(scope.localIndex);
    });
  });

  describe('directive with a numeric index defined', function () {
    it('the index attribute should be used to position the first visible slide', function () {
        var elm = compileTpl({useIndex: 5});
        validCSStransform(elm);
    });
    it('index change should update the carousel position', function () {
        // check watcher present event if not a bindable attribute
        var elm = compileTpl({useIndex: 5});
        elm.scope().carouselIndex = 9;
        scope.$digest();
        validCSStransform(elm);
    });
  });

  describe('directive with no index defined', function () {
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
  });

  describe('indicator directive', function () {
    it('should add an indicator div', function () {
        var elm = compileTpl({useIndicator: true});
        expect(elm.parent().find('.rn-carousel-indicator').length).toBe(1);
    });
    it('should add enough indicators', function () {
        var elm = compileTpl({useIndicator: true});
        expect(elm.parent().find('.rn-carousel-indicator span').length).toBe(scope.items.length);
    });
    it('should have an active indicator based on the carousel index', function () {
        var elm = compileTpl({useIndicator: true});
        expect(elm.parent().find('.rn-carousel-indicator span:nth-of-type(' + (elm.scope().carouselIndex + 1) + ')').hasClass('active')).toBe(true);
    });
    it('should update the active indicator when local index changes', function () {
        var elm = compileTpl({useIndicator: true, useIndex: 'localIndex'});
        scope.localIndex = 2;
        scope.$digest();
        expect(elm.parent().find('.rn-carousel-indicator span:nth-of-type(' + (scope.localIndex + 1) + ')').hasClass('active')).toBe(true);
    });
  });

  describe('buffered carousel', function () {
    it('should minimize the DOM', function () {
        var elm = compileTpl({useBuffer: true});
        expect(elm.find('li').length).toBe(elm.scope().carouselBufferSize);
    });
    it('should position the buffered slides correctly', function () {
        var elm = compileTpl({useBuffer: true, useIndex: 'localIndex'});
        scope.localIndex = 5;
        scope.$digest();
        expect(elm.find('li')[0].id).toBe('slide-' + (scope.localIndex - 1));
    });
    it('should position the buffered slides correctly even if index is zero', function () {
        var elm = compileTpl({useBuffer: true, useIndex: '0'});
        expect(elm.find('li')[0].id).toBe('slide-0');
    });
  });

});
