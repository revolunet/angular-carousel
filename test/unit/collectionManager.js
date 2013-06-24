/*global angular, console, describe, it, expect, beforeEach, inject */

//--- SPECS -------------------------
describe("CollectionManager", function() {
    var collec1 = null,
        collec2 = null;
    var sampleCollectionOptions = {
        items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        index: 1
    };
    beforeEach(module('angular-carousel'));

    var CollectionManagerService;
    beforeEach(inject(function(CollectionManager) {
        CollectionManagerService = CollectionManager;
    }));

    describe("basic", function() {
        beforeEach(function() {
            collec1 = CollectionManagerService.create();
            collec2 = CollectionManagerService.create(sampleCollectionOptions);
        });
        it("initialise an empty list", function() {
          expect(collec1.items).toEqual([]);
          expect(collec2.items).toEqual(sampleCollectionOptions.items);
        });
        it("initialise index correctly", function() {
          expect(collec1.index).toBe(0);
          expect(collec2.index).toBe(sampleCollectionOptions.index);
        });
        describe('next()/prev()', function() {
            it("does not change index if has no items", function() {
              collec1.next();
              expect(collec1.index).toBe(0);
              collec1.prev();
              expect(collec1.index).toBe(0);
            });
            it("update index if has items", function() {
              collec2.next();
              expect(collec2.index).toBe(sampleCollectionOptions.index + 1);
              collec2.prev();
              expect(collec2.index).toBe(sampleCollectionOptions.index);
            });
            it("stops at first item", function() {
              collec2.prev();
              collec2.prev();
              collec2.prev();
              collec2.prev();
              collec2.prev();
              collec2.prev();
              expect(collec2.index).toBe(0);
            });
            it("stops at last item", function() {
              for (var i=0;i<collec2.items.length;i++) {
                collec2.next();
              }
              collec2.next();
              collec2.next();
              collec2.next();
              collec2.next();
              collec2.next();
              expect(collec2.index).toBe(collec2.items.length - 1);
            });
        });
        describe('goToSlide()', function() {
            it("valid index should update index", function() {
              collec2.goToIndex(sampleCollectionOptions.items.length - 2);
              expect(collec2.index).toBe(sampleCollectionOptions.items.length - 2);
            });
            it("higher index should be capped to last item", function() {
              collec2.goToIndex(sampleCollectionOptions.items.length + 10);
              expect(collec2.index).toBe(sampleCollectionOptions.items.length - 1);
            });
            it("lower index should be capped to first item", function() {
              collec2.goToIndex(-10);
              expect(collec2.index).toBe(0);
            });
        });
    });
    describe("cycle", function() {
        var cycleCollectionOptions = angular.extend({}, sampleCollectionOptions, {
            cycle: true,
            index: 0
        });
        var collec = null;
        beforeEach(function() {
            collec = CollectionManagerService.create(angular.copy(cycleCollectionOptions));
        });
        it("first card should be last item initially", function() {
            expect(collec.cards[0]).toEqual(10);
        });
        it("initial index must be 0 and position 1", function() {
            expect(collec.index).toEqual(0);
            expect(collec.position).toEqual(1);
        });
        it("prev() on first item should go to last item", function() {
            expect(collec.position).toBe(1);
            expect(collec.cards[0]).toEqual(10);
            collec.prev();
            expect(collec.cards[0]).toEqual(9);
            collec.prev();
            expect(collec.cards[0]).toEqual(8);
        });
        it("last card should be first item when we move to last slide", function() {
            collec.goTo(collec.items.length - 1);
            expect(collec.cards[collec.cards.length - 1]).toEqual(10);
            collec.next();
            expect(collec.cards[collec.cards.length - 1]).toEqual(1);
        });
        it("next() on last item should go to first item", function() {
            collec.goTo(collec.items.length - 1);
            expect(collec.cards[0]).toEqual(1);
            expect(collec.position).toEqual(8);
            expect(collec.index).toEqual(8);
            collec.next();
            expect(collec.cards[0]).toEqual(2);
            expect(collec.index).toEqual(9);
            expect(collec.position).toEqual(8);
        });
    });
    describe("buffer", function() {
        var bufferCollectionOptions = angular.extend({}, sampleCollectionOptions, {
            bufferSize: 3,
            buffered: true,
            index: 0
        });
        var bufferCollectionOptions2 = angular.extend({}, bufferCollectionOptions, {
            index: 2
        });
        var collec1 = null,
            collec2 = null;
        beforeEach(function() {
            collec1 = CollectionManagerService.create(bufferCollectionOptions);
            collec2 = CollectionManagerService.create(bufferCollectionOptions2);
        });
        it("bufferStart should be correctly initialised", function() {
            expect(collec1.index).toBe(0);
            expect(collec1.bufferStart).toBe(0);
            expect(collec2.index).toBe(2);
            expect(collec2.bufferStart).toBe(1);
        });
        it("bufferStart should follow index", function() {
            collec1.goToIndex(2);
            expect(collec1.bufferStart).toBe(1);
            collec1.next();
            expect(collec1.bufferStart).toBe(2);
        });
        it("bufferStart should never be bigger than index", function() {
            expect(collec1.bufferStart).toBe(0);
            collec1.prev();
            expect(collec1.bufferStart).toBe(0);
            collec1.next();
            expect(collec1.bufferStart).toBe(0);
            collec1.next();
            expect(collec1.bufferStart).toBe(1);
            collec1.goToIndex(4);
            expect(collec1.bufferStart).toBe(3);
        });
        it("bufferStart on last item should not reduce bufferSize", function() {
            collec1.goToIndex(collec1.items.length - 1);
            expect(collec1.bufferStart).toBe(collec1.items.length - 3);
        });
        it("buffer contents length should always be bufferSize", function() {
            expect(collec1.cards.length).toBe(3);
            collec1.goToIndex(collec1.items.length - 1);
            expect(collec1.cards.length).toBe(3);
        });
    });
    describe("buffer+cycle", function() {
        var bufferCycleCollectionOptions = angular.extend({}, sampleCollectionOptions, {
            bufferSize: 3,
            buffered: true,
            cycle: true,
            index: 0
        });
        var bufferCycleCollectionOptions2 = angular.extend({}, angular.copy(bufferCycleCollectionOptions), {
            index: 4
        });
        var collec1 = null,
            collec2 = null;
        beforeEach(function() {
            collec1 = CollectionManagerService.create(bufferCycleCollectionOptions);
            collec2 = CollectionManagerService.create(bufferCycleCollectionOptions2);
        });
        it("should init buffer and index correctly", function() {
            expect(collec1.cards.length).toBe(3);
            expect(collec1.index).toBe(0);
            expect(collec1.position).toBe(1);
            expect(collec1.cards).toEqual([10, 1, 2]);
            expect(collec2.cards.length).toBe(3);
            expect(collec2.index).toBe(4);
            expect(collec2.cards).toEqual([4, 5, 6]);
        });
        it("buffer should follow index correctly", function() {
            collec2.next();
            expect(collec2.index).toBe(5);
            expect(collec2.cards).toEqual([5, 6, 7]);
            collec2.goToIndex(0);
            expect(collec2.cards).toEqual([10, 1, 2]);
            collec2.goToIndex(collec2.items.length - 1);
            expect(collec2.cards).toEqual([9, 10, 1]);
            collec2.next();
            expect(collec2.cards).toEqual([10, 1, 2]);
            collec2.prev();
            expect(collec2.cards).toEqual([9, 10, 1]);
            collec2.prev();
            collec2.prev();
            collec2.prev();
            expect(collec2.cards).toEqual([6, 7, 8]);
            collec2.prev();
            collec2.prev();
            collec2.prev();
            collec2.prev();
            expect(collec2.cards).toEqual([2, 3, 4]);
            collec2.prev();
            expect(collec2.cards).toEqual([1, 2, 3]);
            collec2.prev();
            collec2.prev();
            expect(collec2.cards).toEqual([9, 10, 1]);
            collec2.next();
            collec2.next();
            expect(collec2.cards).toEqual([1, 2, 3]);
            collec2.next();
            expect(collec2.cards).toEqual([2, 3, 4]);
        });
    });
});
