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
            buffered: false,
            cycle: false,
            cycleOffset: 0,            // offset
            index: 0,                  // index relative to the original collection
            position: 0,               // position relative to the current elements
            items: [],                 // total collection
            cards: [],                 // bufered DOM collection
            updated: null,             // triggers DOM change
            debug: false
        };

        var i;
        if(options) for(i in options) initial[i] = options[i];
        for(i in initial) this[i] = initial[i];

        angular.extend(this, initial, options);

        this.init();

    }

    CollectionManager.prototype.log = function() {
        if (this.debug) {
            console.log.apply(console, arguments);
           // console.log('CollectionManager:', this);
        }
    };
    CollectionManager.prototype.getPositionFromIndex = function(index) {
        return (index + this.cycleOffset) % this.length();
    };

    CollectionManager.prototype.goToIndex = function(index, delayedUpdate) {
        // cap index
        index = Math.max(0, Math.min(index, this.getLastIndex()));
        if (this.updated && index===this.index) {
            this.log('skip position change(same)');
            return false;
        }
        var position = this.getPositionFromIndex(index);
        return this.goTo(position, delayedUpdate);
    };

    CollectionManager.prototype.goTo = function(position, delayedUpdate) {
        this.log('goto start', position, delayedUpdate);

        if (this.length()===0) {
            this.log('empty, skip gotoIndex');
            return;
        }
        // cap position
        position = Math.max(0, Math.min(position, this.getLastIndex()));
        var cycled = false;
        if (this.cycle) {
            if (position===0) {
                // unshift
                this.log('cycleAtBeginning', position);
                this.cycleAtBeginning();
                position = 1;
                this.cycleOffset++;
                cycled = true;
            } else if (position === this.getLastIndex()) {
                // push
                this.log('cycleAtEnd', position);
                this.cycleAtEnd();
                position--;
                this.cycleOffset--;
                cycled = true;
            }
            this.cycleOffset %= this.length();
        }

        this.position = Math.max(0, Math.min(position, this.getLastIndex()));

        var realIndex = (this.position - this.cycleOffset + this.length()) % this.length();
        this.index = Math.max(0, Math.min(realIndex, this.getLastIndex()));

        if (!delayedUpdate) {
            this.adjustBuffer();
        }
        if (!cycled) this.updated = new Date();

    };

    CollectionManager.prototype.next = function() {
        // go to next item
        if (this.cycle) {
            this.goTo((this.position + 1) % this.length());
        } else {
            this.goTo(Math.min(this.position + 1, this.getLastIndex()));
        }
    };
    CollectionManager.prototype.prev = function() {
        // go to prev item
        if (this.cycle) {
            this.goTo((this.position - 1 + this.length()) % this.length());
        } else {
            var prevIndex = (this.length()>0)?(Math.max(0, (this.position - 1) % this.length())):0;
            this.goTo(prevIndex);
        }
    };
    CollectionManager.prototype.setBufferSize = function(length) {
        this.log('setBufferSize', length);
        this.bufferSize = length;
        this.adjustBuffer();
    };
    CollectionManager.prototype.isBuffered = function() {
        return this.buffered;
    };
    CollectionManager.prototype.getRelativeIndex = function() {
        var relativeIndex = Math.max(0, Math.min(this.getLastIndex(), this.position - this.bufferStart));
        return relativeIndex;
    };
    CollectionManager.prototype.adjustBuffer = function() {
        // adjust buffer start position
        var maxBufferStart = (this.getLastIndex() + 1 - this.bufferSize) % this.length();
        this.log('maxBufferStart', maxBufferStart);
        this.bufferStart = Math.max(0, Math.min(maxBufferStart, this.position - 1));
        this.cards = this.items.slice(this.bufferStart, this.bufferStart + this.bufferSize);
        this.log('adjustBuffer from', this.bufferStart, 'to', this.bufferStart + this.bufferSize);
    };
    CollectionManager.prototype.length = function() {
        return this.items.length;
    };
    CollectionManager.prototype.getLastIndex = function() {
        var lastIndex = Math.max(0, this.length() - 1);
        return lastIndex;
    };
    CollectionManager.prototype.init = function() {
        //this.log('init', this);
        this.setBufferSize(this.isBuffered()?this.bufferSize:this.length());
        if (this.length() > 0) this.goToIndex(this.index);
    };
    CollectionManager.prototype.setItems = function(items, reset) {
        this.log('setItems', items, reset);
        if (reset) {
            this.index=0;
            this.position=0;
        }
        this.items = items || [];  // prevent internal errors when items is undefined
        this.init();
    };
    CollectionManager.prototype.cycleAtEnd = function() {
        // extract first item and put it at end
        this.push(this.items.shift());
    };
    CollectionManager.prototype.push = function(slide, updateIndex) {
        // insert item(s) at end
        this.log('push item(s)', slide, updateIndex);
        // if (this.items.indexOf(slide)>-1) {
        //     this.log('item already present, skip it');
        //     return;
        // }
        this.items.push(slide);
        if (updateIndex) {
            // no need to change index when appending items
            this.adjustBuffer();
            this.updated = new Date();
        }
        if (!this.buffered) {
            this.bufferSize++;
        }
    };
    CollectionManager.prototype.unshift = function(slide, updateIndex) {
        // insert item(s) at beginning
        this.log('unshift item(s)', slide, updateIndex);
        // if (this.items.indexOf(slide)>-1) {
        //     this.log('item already present, skip it');
        //     return;
        // }
        this.items.unshift(slide);
        if (!this.buffered) {
            this.bufferSize++;
        }
        if (updateIndex) {
            this.position++;
            this.adjustBuffer();
            this.updated = new Date();
        }
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
