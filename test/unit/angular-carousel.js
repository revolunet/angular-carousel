/*global beforeEach, afterEach, describe, it, inject, expect, module, spyOn, fullcalendar, angular, $*/

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
      template: '<ul carousel ><li ng-repeat="item in items">{{ item.text }}</li></ul>'
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
    it('should add announcer attribute to each slide 2', function () {
        var elm = compileTpl();
        expect(elm.find('li[slide-announcer=true]').length).toBe(3);
    });
  });

  // function compileDirective(template) {
  //   template = template ? templates[template] : templates['default'];
  //   angular.extend(scope, template.scope);
  //   var $element = $(template.element).appendTo($sandbox);
  //   $element = $compile($element)(scope);
  //   scope.$digest(); // evaluate $evalAsync queue used by $q
  //   $timeout.flush();
  //   return $element;
  // }

  // describe('default template', function() {

  //   var elm, select, menu;
  //   beforeEach(function() {
  //     elm = compileDirective();
  //     select = elm.next('.bootstrap-select');
  //     menu = select.find('ul[role=menu]');
  //   });

  //   it('initialises bootstrap select on the element', function () {
  //     expect(select.length).toBe(1);
  //   });

  //   it('adds every item to the bootstrap select menu', function () {
  //     expect(menu.children().length).toBe(scope.items.length);
  //   });

  //   it('updates the bootstrap select menu when items are changed', function () {
  //     scope.items.push({id: '4', name: 'qux'});
  //     scope.$digest();
  //     expect(menu.children().length).toBe(scope.items.length);
  //   });

  //   it('selects the correct item by default', function () {
  //     expect(menu.find('.selected').text()).toBe('bar');
  //   });

  //   it('updates the scope when a new item is selected', function () {
  //     menu.find('li a').first().click();
  //     expect(scope.selectedItem).toBe('1');
  //   });

  //   it('updates bootstrap select when the model changes', function () {
  //     scope.selectedItem = '3';
  //     scope.$digest();
  //     expect(menu.find('.selected').text()).toBe('baz');
  //   });

  //   it('does not add ng-scope class to bootstrap select element', function () {
  //     expect(select.hasClass('ng-scope')).toBe(false);
  //   });

    // it('adds new classes from original element when the model changes', function () {
    //   elm.addClass('dummy');
    //   scope.model.item = 1;
    //   scope.$digest();
    //   expect(select.hasClass('dummy')).toBe(true);
    // });

    // it('syncs classes removed from original element when the model changes', function () {
    //   element.addClass('dummy');
    //   scope.model.item = 1;
    //   scope.$digest();
    //   element.removeClass('dummy');
    //   scope.model.item = 2;
    //   scope.$digest();
    //   expect(select.hasClass('dummy')).toBe(false);
    // });

 // });

});
