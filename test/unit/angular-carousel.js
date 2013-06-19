/*global browserTrigger, beforeEach, afterEach, describe, it, inject, expect, module, angular, $*/

describe('carousel', function () {
  'use strict';

  var scope, $compile, $sandbox;

  $('body').append("<link href='http://127.0.0.1:9876/src/angular-carousel.css' rel='stylesheet' type='text/css'>");
  $('body').append("<style>ul,li {padding:0;margin:0;width:200px !important} .rn-carousel-animate {-webkit-transition: -webkit-transform 0s ease-out; -moz-transition: -moz-transform 0s ease-out; transition: transform 0s ease-out;}</style>");
  //console.log(document.location);
  beforeEach(
    module('angular-carousel')
  );

  beforeEach(inject(function ($rootScope, _$compile_) {
      scope = $rootScope;
      $compile = _$compile_;
      $('body').css({
        padding: 0,
        margin:0
      });
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
      useBuffer: false,
      nbItems: 25
    };
    if (overrideOptions) angular.extend(options, overrideOptions);
    var sampleData = {
      scope: {
        items: [],
        localIndex: 5
      }
    };
    for (var i=0; i<options.nbItems; i++) {
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
    var expectedPosition = (elm.outerWidth() * elm.scope().totalIndex * -1),
        expectedMatrix = 'matrix(1, 0, 0, 1, ' + expectedPosition + ', 0)',
        curMatrix = elm.css('-webkit-transform');
    if (!curMatrix) curMatrix = elm.css('transform');
    expect(curMatrix).toBe(expectedMatrix);
  }

  // describe('directive', function () {
  //   it('should add a wrapper div around the ul/li', function () {
  //       var elm = compileTpl();
  //       expect(elm.parent().hasClass('rn-carousel-container')).toBe(true);
  //   });
  //   it('should add a class to the ul', function () {
  //       var elm = compileTpl();
  //       expect(elm.hasClass('rn-carousel-slides')).toBe(true);
  //   });
  //   it('should have enough slides', function () {
  //       var elm = compileTpl();
  //       expect(elm.find('li').length).toBe(scope.items.length);
  //   });
  //   it('generated container outerWidth should match the ul outerWidth', function () {
  //       var elm = compileTpl();
  //       expect(elm.parent().outerWidth()).toBe(elm.outerWidth());
  //   });
  // });

  // describe('directive with a data-bound index defined', function () {
  //   it('the index attribute should be used to position the first visible slide', function () {
  //       var elm = compileTpl({useIndex: 'localIndex'});
  //       //waits(500);
  //       //runs(function () {
  //           validCSStransform(elm);
  //       //});
  //   });
  //   it('index change should update the carousel position', function () {
  //       var elm = compileTpl({useIndex: 'localIndex'});
  //       scope.localIndex = 5;
  //       scope.$digest();
  //      // waits(500);
  //      // runs(function () {
  //           validCSStransform(elm);
  //      // });
  //   });
  //   it('carousel index should be bound to local index', function () {
  //       var elm = compileTpl({useIndex: 'localIndex'});
  //       scope.localIndex = 5;
  //       scope.$digest();
  //       expect(elm.scope().totalIndex).toBe(scope.localIndex);
  //   });
  // });

  // describe('directive with a numeric index defined', function () {
  //   it('the index attribute should be used to position the first visible slide', function () {
  //       var elm = compileTpl({useIndex: 5});
  //       //waits(500);
  //       //runs(function () {
  //           validCSStransform(elm);
  //     //  });
  //   });
  //   it('index change should update the carousel position', function () {
  //       // check watcher present even if index is not a bindable attribute
  //       var elm = compileTpl({useIndex: 5});
  //       elm.scope().totalIndex = 9;
  //       scope.$digest();
  //     //  waits(500);
  //       //runs(function () {
  //           validCSStransform(elm);
  //      // });
  //   });
  //   it('index out of range should set the carousel to last slide', function () {
  //       var elm = compileTpl({useIndex: 100});
  //       expect(elm.scope().totalIndex).toBe(scope.items.length - 1);
  //       expect(elm.find('li').length).toBe(scope.items.length);
  //       expect(elm.find('li:last')[0].id).toBe('slide-' + (scope.items.length - 1));
  //   });
  //   it('negative index should set the carousel to first slide', function () {
  //       var elm = compileTpl({useIndex: -100});
  //       expect(elm.scope().totalIndex).toBe(0);
  //       expect(elm.find('li').length).toBe(scope.items.length);
  //       expect(elm.find('li')[0].id).toBe('slide-0');
  //   });
  // });

  // describe('directive with no index defined', function () {
  //   it('should add a wrapper div around the ul/li', function () {
  //       var elm = compileTpl({useIndex:false});
  //       expect(elm.parent().hasClass('rn-carousel-container')).toBe(true);
  //   });
  //   it('should add a class to the ul', function () {
  //       var elm = compileTpl({useIndex:false});
  //       expect(elm.hasClass('rn-carousel-slides')).toBe(true);
  //   });
  //   it('should have enough slides', function () {
  //       var elm = compileTpl({useIndex:false});
  //       expect(elm.find('li').length).toBe(scope.items.length);
  //   });
  //   it('generated container outerWidth should match the ul outerWidth', function () {
  //       var elm = compileTpl({useIndex:false});
  //       expect(elm.parent().outerWidth()).toBe(elm.outerWidth());
  //   });
  //   it('the index attribute should be used to position the first visible slide', function () {
  //       var elm = compileTpl({useIndex:false});
  //       validCSStransform(elm);
  //   });
  // });

  // describe('indicator directive', function () {
  //   it('should add an indicator div', function () {
  //       var elm = compileTpl({useIndicator: true});
  //       expect(elm.parent().find('.rn-carousel-indicator').length).toBe(1);
  //   });
  //   it('should add enough indicators', function () {
  //       var elm = compileTpl({useIndicator: true});
  //       expect(elm.parent().find('.rn-carousel-indicator span').length).toBe(scope.items.length);
  //   });
  //   it('should have an active indicator based on the carousel index', function () {
  //       var elm = compileTpl({useIndicator: true});
  //       expect(elm.parent().find('.rn-carousel-indicator span:nth-of-type(' + (elm.scope().totalIndex + 1) + ')').hasClass('active')).toBe(true);
  //   });
  //   it('should update the active indicator when local index changes', function () {
  //       var elm = compileTpl({useIndicator: true, useIndex: 'localIndex'});
  //       scope.localIndex = 2;
  //       scope.$digest();
  //       expect(elm.parent().find('.rn-carousel-indicator span:nth-of-type(' + (scope.localIndex + 1) + ')').hasClass('active')).toBe(true);
  //   });
  // });

  // describe('buffered carousel', function () {
  //   it('should minimize the DOM', function () {
  //       var elm = compileTpl({useBuffer: true});
  //       expect(elm.find('li').length).toBe(elm.scope().carouselBufferSize);
  //   });
  //   it('should position the buffered slides correctly', function () {
  //       var elm = compileTpl({useBuffer: true, useIndex: 'localIndex'});
  //       scope.localIndex = 5;
  //       scope.$digest();
  //       expect(elm.find('li')[0].id).toBe('slide-' + (scope.localIndex - 1));
  //   });
  //   it('should position the buffered slides correctly even if index is zero', function () {
  //       var elm = compileTpl({useBuffer: true, useIndex: '0'});
  //       expect(elm.find('li').length).toBe(elm.scope().carouselBufferSize);
  //       expect(elm.find('li')[0].id).toBe('slide-0');
  //   });
  //   it('should position the buffered slides correctly with a out of range index', function () {
  //       var elm = compileTpl({useBuffer: true, useIndex: '100'});
  //       expect(elm.scope().totalIndex).toBe(scope.items.length - 1);
  //       var firstId = scope.items.length - elm.scope().carouselBufferSize;
  //       expect(elm.find('li').length).toBe(elm.scope().carouselBufferSize);
  //       expect(elm.find('li')[0].id).toBe('slide-' + firstId);
  //       expect(elm.find('li:last')[0].id).toBe('slide-' + (firstId + elm.scope().carouselBufferSize - 1));
  //   });
  //   it('should position the buffered slides correctly with a negative index', function () {
  //       var elm = compileTpl({useBuffer: true, useIndex: '-100'});
  //       expect(elm.scope().totalIndex).toBe(0);
  //       expect(elm.find('li').length).toBe(elm.scope().carouselBufferSize);
  //       expect(elm.find('li')[0].id).toBe('slide-0');
  //       expect(elm.find('li:last')[0].id).toBe('slide-' + (elm.scope().carouselBufferSize - 1));
  //   });
  // });

  // describe('activeIndex property on standard carousel', function () {
  //   it('should be at 0 on start', function () {
  //       var elm = compileTpl();
  //       expect(elm.scope().activeIndex).toBe(0);
  //   });
  //   it('should be set at initial position', function () {
  //       var elm = compileTpl({useIndex: 'localIndex'});
  //       expect(elm.scope().activeIndex).toBe(scope.localIndex);
  //   });
  //   it('should follow carousel position', function () {
  //       var elm = compileTpl({useIndex: 'localIndex'});
  //       scope.localIndex = scope.items.length - 1;
  //       scope.$digest();
  //       expect(elm.scope().activeIndex).toBe(scope.items.length - 1);
  //   });
  // });

  // describe('activeIndex property on buffered carousel', function () {
  //   it('should be at 0 on start', function () {
  //       var elm = compileTpl({useBuffer: true});
  //       expect(elm.scope().activeIndex).toBe(0);
  //   });
  //   it('should be set correctly at initial position', function () {
  //       var elm = compileTpl({useBuffer: true, useIndex: 'localIndex'});
  //       expect(elm.scope().activeIndex).toBe(elm.scope().totalIndex - elm.scope().carouselBufferStart);
  //   });
  //   it('should be last item of buffer if carousel last slide', function () {
  //       var elm = compileTpl({useBuffer: true, useIndex: 'localIndex'});
  //       scope.localIndex = scope.items.length - 1;
  //       scope.$digest();
  //       expect(elm.scope().activeIndex).toBe(elm.scope().carouselBufferSize - 1);
  //   });
  //   it('should be last item of buffer if carousel last slide', function () {
  //       var elm = compileTpl({useBuffer: true, useIndex: 'localIndex'});
  //       scope.localIndex = 100;
  //       scope.$digest();
  //       expect(elm.scope().activeIndex).toBe(elm.scope().carouselBufferSize - 1);
  //   });
  //   it('should display first slide when reset local index to 0', function () {
  //       var elm = compileTpl({useBuffer: true, useIndex: 'localIndex'});
  //       scope.localIndex = 5;
  //       scope.$digest();
  //       scope.localIndex = 0;
  //       scope.$digest();
  //       expect(elm.position().left).toBe(0);
  //       expect(elm.css('left')).toBe('auto');
  //   });
  // });

  // describe('collection update', function () {
  //    it('standard carousel should display first slide when we reset the collection', function () {
  //       var elm = compileTpl({useIndex: 'localIndex'});
  //       scope.localIndex = 5;
  //       scope.$digest();
  //       scope.items = [{id:1}, {id:2}];
  //       scope.$digest();
  //       expect(elm.position().left).toBe(0);
  //       expect(elm.css('left')).toBe('auto');
  //       expect(elm.scope().activeIndex).toBe(0);
  //   });
  //   it('buffered carousel should display first slide when we reset the collection', function () {
  //       var elm = compileTpl({useBuffer: true, useIndex: 'localIndex'});
  //       scope.localIndex = 5;
  //       scope.$digest();
  //       scope.items = [{id:1}, {id:2}];
  //       scope.$digest();
  //       expect(elm.position().left).toBe(0);
  //       expect(elm.css('left')).toBe('auto');
  //       expect(elm.scope().activeIndex).toBe(0);
  //   });
  // });

  // function fakeMove(elm, distance) {
  //   // trigger a carousel swipe movement
  //   var startX = 10,
  //       startY = 10,
  //       endX = distance + startX;

  //   browserTrigger(elm, 'touchstart', [], startX, startY);
  //   browserTrigger(elm, 'touchmove', [], endX, startY);
  //   browserTrigger(elm, 'touchmove', [], endX, startY);
  //   browserTrigger(elm, 'touchend', [], endX, startY);
  // }

  // describe('swipe behaviour', function () {
  //   var minMove;
  //   beforeEach(function() {
  //       minMove = 31;
  //   });
  //   it('should not show prev slide if swipe backwards at index 0', function() {
  //       // yes, backwards swipe means positive pixels count :)
  //       var elm = compileTpl();
  //       fakeMove(elm, minMove);
  //       expect(elm.scope().totalIndex).toBe(0);
  //   });
  //   it('should not show next slide if swipe forward at last slide', function() {
  //       var elm = compileTpl();
  //       elm.scope().totalIndex = scope.items.length - 1;
  //       fakeMove(elm, -minMove);
  //       expect(elm.scope().totalIndex).toBe(scope.items.length - 1);
  //   });
  //   it('should move slide backward if backwards swipe at index > 0', function() {
  //       var elm = compileTpl({useIndex: 1});
  //       fakeMove(elm, minMove);
  //       expect(elm.scope().totalIndex).toBe(0);
  //   });
  //   it('should move to next slide on swipe forward', function() {
  //       var elm = compileTpl();
  //       fakeMove(elm, -minMove);
  //       expect(elm.scope().totalIndex).toBe(1);
  //   });
  //   it('should not move to next slide on too little swipe forward', function() {
  //       var elm = compileTpl();
  //       fakeMove(elm, -12);
  //       expect(elm.scope().totalIndex).toBe(0);
  //   });
  //   it('should not move to prev slide on too little swipe backward', function() {
  //       var elm = compileTpl({useIndex: 1});
  //       fakeMove(elm, 12);
  //       expect(elm.scope().totalIndex).toBe(1);
  //   });
  //   it('should follow multiple moves', function() {
  //       var elm = compileTpl();
  //       var minMove = -(elm.outerWidth() * 0.1 + 1);
  //       fakeMove(elm, minMove);
  //       fakeMove(elm, minMove);
  //       fakeMove(elm, minMove);
  //       expect(elm.scope().totalIndex).toBe(3);
  //       fakeMove(elm, -minMove);
  //       fakeMove(elm, -minMove);
  //       expect(elm.scope().totalIndex).toBe(1);
  //       fakeMove(elm, -minMove);
  //       fakeMove(elm, -minMove);
  //       fakeMove(elm, -minMove);
  //       expect(elm.scope().totalIndex).toBe(0);
  //   });
  // });

  // describe('swipe buffered behaviour', function () {
  //   it('should follow multiple moves and buffer accordingly', function() {
  //       var elm = compileTpl({useBuffer: true});
  //       var minMove = -(elm.outerWidth() * 0.1 + 1);
  //       fakeMove(elm, minMove);
  //       fakeMove(elm, minMove);
  //       fakeMove(elm, minMove);
  //       expect(elm.find('li').length).toBe(elm.scope().carouselBufferSize);
  //       expect(elm.find('li')[0].id).toBe('slide-2');
  //       expect(elm.scope().totalIndex).toBe(3);
  //       fakeMove(elm, -minMove);
  //       fakeMove(elm, -minMove);
  //       expect(elm.find('li').length).toBe(elm.scope().carouselBufferSize);
  //       expect(elm.find('li')[0].id).toBe('slide-0');
  //       expect(elm.scope().totalIndex).toBe(1);
  //       fakeMove(elm, -minMove);
  //       fakeMove(elm, -minMove);
  //       fakeMove(elm, -minMove);
  //       expect(elm.find('li').length).toBe(elm.scope().carouselBufferSize);
  //       expect(elm.find('li')[0].id).toBe('slide-0');
  //       expect(elm.scope().totalIndex).toBe(0);
  //   });
  // });

  // describe('swipe buffered + index behaviour', function () {
  //   it('should initialise buffer start correctly when index is set', function() {
  //       var elm = compileTpl({useBuffer: true, useIndex: "localIndex", nbItems: 5});
  //       scope.localIndex = 2;
  //       scope.$digest();
  //       expect(elm.scope().carouselBufferStart).toBe(1);
  //   });
  //   it('should initialise buffer start correctly when index is set at 0', function() {
  //       var elm = compileTpl({useBuffer: true, useIndex: "localIndex", nbItems: 5});
  //       scope.localIndex = 0;
  //       scope.$digest();
  //       expect(elm.scope().carouselBufferStart).toBe(0);
  //   });
    // it('should initialise buffer start correctly when index is set at last item', function() {
    //     var nbItems = 5;
    //     var elm = compileTpl({useBuffer: true, useIndex: "localIndex", nbItems: 5});
    //     scope.localIndex = nbItems-1;
    //     scope.$digest();
    //     console.log(elm.scope().activeIndex);
    //     waits(10);
    //     runs(function() {
    //         expect(elm.scope().carouselBufferStart).toBe(nbItems - elm.scope().carouselBufferSize);
    //     });
    // });
    // it('buffer position should update when local index changes', function() {
    //     var elm = compileTpl({useBuffer: true, useIndex: "localIndex", nbItems: 5});
    //     scope.localIndex = 2;
    //     scope.$digest();
    //     expect(elm.scope().carouselBufferStart).toBe(1);
    //     scope.localIndex = 3;
    //     scope.$digest();
    //     waits(100);
    //     runs(function() {
    //         expect(elm.scope().carouselBufferStart).toBe(1);
    //         scope.localIndex = 0;
    //         scope.$digest();
    //         expect(elm.scope().carouselBufferStart).toBe(0);
    //     });
    // });
  //});


});
