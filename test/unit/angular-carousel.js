/*global browserTrigger, beforeEach, afterEach, describe, it, inject, expect, module, angular, $*/

describe('carousel', function () {
  'use strict';

  var scope, $compile, $sandbox;

  beforeEach(
    module('angular-carousel')
  );

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
        // check watcher present even if index is not a bindable attribute
        var elm = compileTpl({useIndex: 5});
        elm.scope().carouselIndex = 9;
        scope.$digest();
        validCSStransform(elm);
    });
    it('index out of range should set the carousel to last slide', function () {
        var elm = compileTpl({useIndex: 100});
        expect(elm.scope().carouselIndex).toBe(scope.items.length - 1);
        expect(elm.find('li').length).toBe(scope.items.length);
        expect(elm.find('li:last')[0].id).toBe('slide-' + (scope.items.length - 1));
    });
    it('negative index should set the carousel to first slide', function () {
        var elm = compileTpl({useIndex: -100});
        expect(elm.scope().carouselIndex).toBe(0);
        expect(elm.find('li').length).toBe(scope.items.length);
        expect(elm.find('li')[0].id).toBe('slide-0');
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
        expect(elm.find('li').length).toBe(elm.scope().carouselBufferSize);
        expect(elm.find('li')[0].id).toBe('slide-0');
    });
    it('should position the buffered slides correctly with a out of range index', function () {
        var elm = compileTpl({useBuffer: true, useIndex: '100'});
        expect(elm.scope().carouselIndex).toBe(scope.items.length - 1);
        var firstId = scope.items.length - elm.scope().carouselBufferSize;
        expect(elm.find('li').length).toBe(elm.scope().carouselBufferSize);
        expect(elm.find('li')[0].id).toBe('slide-' + firstId);
        expect(elm.find('li:last')[0].id).toBe('slide-' + (firstId + elm.scope().carouselBufferSize - 1));
    });
    it('should position the buffered slides correctly with a negative index', function () {
        var elm = compileTpl({useBuffer: true, useIndex: '-100'});
        expect(elm.scope().carouselIndex).toBe(0);
        expect(elm.find('li').length).toBe(elm.scope().carouselBufferSize);
        expect(elm.find('li')[0].id).toBe('slide-0');
        expect(elm.find('li:last')[0].id).toBe('slide-' + (elm.scope().carouselBufferSize - 1));
    });
  });

  function fakeMove(elm, distance) {
    // trigger a carousel swipe movement
    var startX = 10,
        startY = 10,
        endX = distance + startX;

    browserTrigger(elm, 'touchstart', [], startX, startY);
    browserTrigger(elm, 'touchmove', [], endX, startY);
    browserTrigger(elm, 'touchmove', [], endX, startY);
    browserTrigger(elm, 'touchend', [], endX, startY);
  }

  describe('swipe behaviour', function () {
    it('should not show prev slide if swipe backwards at index 0', function() {
        // yes, backwards swipe means positive pixels count :)
        var elm = compileTpl();
        fakeMove(elm, 30);
        expect(elm.scope().carouselIndex).toBe(0);
    });
    it('should not show next slide if swipe forward at last slide', function() {
        var elm = compileTpl();
        elm.scope().carouselIndex = scope.items.length - 1;
        fakeMove(elm, -30);
        expect(elm.scope().carouselIndex).toBe(scope.items.length - 1);
    });
    it('should move slide backward if backwards swipe at index > 0', function() {
        var elm = compileTpl({useIndex: 1});
        fakeMove(elm, 30);
        expect(elm.scope().carouselIndex).toBe(0);
    });
    it('should move to next slide on swipe forward', function() {
        var elm = compileTpl();
        fakeMove(elm, -30);
        expect(elm.scope().carouselIndex).toBe(1);
    });
    it('should not move to next slide on too little swipe forward', function() {
        var elm = compileTpl();
        var minSwipe = elm.outerWidth() * 0.1;
        fakeMove(elm, -minSwipe);
        expect(elm.scope().carouselIndex).toBe(0);
    });
    it('should not move to prev slide on too little swipe backward', function() {
        var elm = compileTpl({useIndex: 1});
        var minSwipe = elm.outerWidth() * 0.1;
        fakeMove(elm, minSwipe);
        expect(elm.scope().carouselIndex).toBe(1);
    });
    it('should follow multiple moves', function() {
        var elm = compileTpl();
        fakeMove(elm, -30);
        fakeMove(elm, -200);
        fakeMove(elm, -300);
        expect(elm.scope().carouselIndex).toBe(3);
        fakeMove(elm, 1000);
        fakeMove(elm, 100);
        expect(elm.scope().carouselIndex).toBe(1);
        fakeMove(elm, 100);
        fakeMove(elm, 100);
        fakeMove(elm, 100);
        expect(elm.scope().carouselIndex).toBe(0);
    });
  });

  describe('swipe buffered behaviour', function () {
    it('should follow multiple moves and buffer accordingly', function() {
        var elm = compileTpl({useBuffer: true});
        fakeMove(elm, -30);
        fakeMove(elm, -200);
        fakeMove(elm, -300);
        expect(elm.find('li').length).toBe(elm.scope().carouselBufferSize);
        expect(elm.find('li')[0].id).toBe('slide-2');
        expect(elm.scope().carouselIndex).toBe(3);
        fakeMove(elm, 1000);
        fakeMove(elm, 100);
        expect(elm.find('li').length).toBe(elm.scope().carouselBufferSize);
        expect(elm.find('li')[0].id).toBe('slide-0');
        expect(elm.scope().carouselIndex).toBe(1);
        fakeMove(elm, 100);
        fakeMove(elm, 100);
        fakeMove(elm, 100);
        expect(elm.find('li').length).toBe(elm.scope().carouselBufferSize);
        expect(elm.find('li')[0].id).toBe('slide-0');
        expect(elm.scope().carouselIndex).toBe(0);
    });
  });


});
