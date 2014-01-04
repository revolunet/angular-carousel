(function() {
    "use strict";

    angular.module('angular-carousel')

    .filter('carouselSlice', function() {
        return function(collection, start, size) {
            return collection.slice(start, start + size);
        };
    });

})();
