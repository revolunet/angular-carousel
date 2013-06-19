/**
* CollectionManager.js
* - manage a collection of items
* - rearrange items if buffered or cycle
* - the service is just a wrapper around a non-angular collection manager
**/
angular.module('angular-carousel')

.service('CollectionManager', [function() {

    function CollectionManager(options) {
        var initial = {
            bufferSize: 0,
            bufferStart: 0,
            cycle: false,
            index: 0,
            items: [],
            cards: [],
            updated: null,
            debug: false
        },
            me = this,
            i;

        if(options) for(i in options) initial[i] = options[i];
        for(i in initial) me[i] = initial[i];

        angular.extend(me, initial, options);

        this.log('init', options, me, 'pouet');

        this.init();

    }

    CollectionManager.prototype.log = function() {
        if (this.debug) {
            console.log.apply(console, arguments);
            console.log('CollectionManager:', this);
        }
    };
    CollectionManager.prototype.goToIndex = function(index, delayedUpdate) {
        this.log('gotoIndex start', index, delayedUpdate);
        if (this.length()===0) {
            this.log('empty, skip');
            return;
        }
        var cycled = false;
        if (this.cycle) {
            if (index===0) {
                // unshift
                this.log('cycleAtBeginning', index, this.index);
                this.cycleAtBeginning();
                index = 1;
                cycled = true;
            } else if (index === this.getLastIndex()) {
                // push
                this.log('cycleAtEnd', index, this.index);
                this.cycleAtEnd();
                index -= 1;
                cycled = true;
            }
        }
        this.index = Math.max(0, Math.min(index, this.getLastIndex()));

        if (!delayedUpdate) {
            this.adjustBuffer();
        }
        if (!cycled) this.updated = new Date();

        this.log('gotoIndex start', this.index, cycled);
    };

    CollectionManager.prototype.next = function() {
        // go to next item
        if (this.cycle) {
            this.goToIndex((this.index + 1) % this.length());
        } else {
            this.goToIndex(Math.min(this.index + 1, this.getLastIndex()));
        }
    };
    CollectionManager.prototype.prev = function() {
        // go to prev item
        if (this.cycle) {
            this.goToIndex((this.index - 1 + this.length()) % this.length());
        } else {
            var prevIndex = (this.length()>0)?(Math.max(0, (this.index - 1) % this.length())):0;
            this.goToIndex(prevIndex);
        }
    };
    CollectionManager.prototype.setBufferSize = function(length) {
        this.log('setBufferSize', length);
        this.bufferSize = length;
        this.adjustBuffer();
    };
    CollectionManager.prototype.isBuffered = function() {
        return (this.bufferSize > 0);
    };
    CollectionManager.prototype.getRelativeIndex = function() {
        return Math.max(0, Math.min(this.getLastIndex(), this.index - this.bufferStart));
    };
    CollectionManager.prototype.adjustBuffer = function() {
        // adjust buffer start position
        var maxBufferStart = this.getLastIndex() + 1 - this.bufferSize;
        this.bufferStart = Math.max(0, Math.min(maxBufferStart, this.index - 1));
        this.cards = this.items.slice(this.bufferStart, this.bufferStart + this.bufferSize);
        this.log('adjustBuffer', this.bufferStart, this.cards);
    };
    CollectionManager.prototype.length = function() {
        return this.items.length;
    };
    CollectionManager.prototype.getLastIndex = function() {
        return Math.max(0, this.length() - 1);
    };
    CollectionManager.prototype.init = function() {
        this.log('init');
        this.setBufferSize(this.bufferSize || this.length());
        this.goToIndex(this.index);
    };
    CollectionManager.prototype.setItems = function(items, reset) {
        this.log('setItems', items);
        if (reset) this.index=0;
        this.items = items;
        this.init();
    };
    CollectionManager.prototype.cycleAtEnd = function() {
        // extract first item and put it at end
        this.push(this.items.shift());
    };
    CollectionManager.prototype.push = function(slide) {
        // insert item(s) at end
        this.items.push(slide);
    };
    CollectionManager.prototype.unshift = function(slide) {
        // insert item(s) at beginning
        this.items.unshift(slide);
    };
    CollectionManager.prototype.cycleAtBeginning = function() {
        // extract last item and put it at beginning
        this.unshift(this.items.pop());
    };
    return {
        create: function(options) {
            return new CollectionManager(options);
        }
    };
}]);
