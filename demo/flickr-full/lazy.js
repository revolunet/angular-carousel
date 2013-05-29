angular.module('angular-lazy', []).
directive('lazyBackground', ['$document', '$parse', function($document, $parse) {
    return {
        restrict: 'A',
        link: function(scope, iElement, iAttrs) {
            function setLoading(elm) {
                elm.html('');
                elm.append(loader);
                elm.css({
                    'background-image': null
                });
            }
            var loader = angular.element('<div>...</div>');
            if (angular.isDefined(iAttrs.lazyLoader)) {
                loader = angular.element($document[0].querySelector(iAttrs.lazyLoader)).clone();
            }
            var bgModel = $parse(iAttrs.lazyBackground);
            scope.$watch(bgModel, function(newValue, oldValue) {
                setLoading(iElement);
                var src = bgModel(scope);
                var img = document.createElement('img');
                img.onload = function() {
                    loader.remove();
                    if (angular.isDefined(iAttrs.lazyClass)) {
                        iElement.addClass(iAttrs.lazyClass);
                    }
                    iElement.css({
                        'background-image': 'url(' + this.src + ')'
                    });
                };
                img.onerror= function() {
                    //console.log('error');
                };
                img.src = src;
            });
        }
    };
}]);
