angular.module('angular-carousel')

.directive('rnCarouselAutoSlide', ['$timeout', function($timeout) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {

        var delay = Math.round(parseFloat(attrs.rnCarouselAutoSlide) * 1000),
            timer =  false, slidesCount = element.children().length;
        notrepeat = true;

        scope.$on('rnCarousel:CollectionUpdated', function($parentscope, newSlidesCount){
            slidesCount = newSlidesCount;
            notrepeat = false
        });

        if(!scope.carouselExposedIndex){
            scope.carouselExposedIndex = 0;
        }

        function stopAutoplay() {
            if (angular.isDefined(timer)) {
                $timeout.cancel(timer);
            }
            timer = undefined;
        }

        function increment() {
            if (scope.carouselExposedIndex < slidesCount - 1) {
                scope.carouselExposedIndex =  scope.carouselExposedIndex + 1;
            } else {
                scope.carouselExposedIndex = 0;
            }
        }

        function restartTimer(){
            stopAutoplay();
            timer = $timeout(function(){
                increment()
            }, delay);
        }

        scope.$watch('carouselIndex', function(){
           restartTimer();
        });

        restartTimer();
        if (attrs.rnCarouselPauseOnHover && attrs.rnCarouselPauseOnHover != 'false'){
            element.on('mouseenter', stopAutoplay);
            element.on('mouseleave', restartTimer);
        }

        scope.$on('$destroy', function(){
            stopAutoplay();
            element.off('mouseenter', stopAutoplay);
            element.off('mouseleave', restartTimer);
        });


    }
  };
}]);