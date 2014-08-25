angular.module('angular-carousel')

.directive('rnCarouselAutoSlide', ['$timeout', function($timeout) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {

        var delay = Math.round(parseFloat(attrs.rnCarouselAutoSlide) * 1000),
            timer =  false, slidesCount = element.children().length;


        var stopAutoPlay = function () {
            if (angular.isDefined(timer)) {
                $timeout.cancel(timer);
            }
            timer = undefined;
        };

        var increment = function () {
            if (scope.carouselExposedIndex < slidesCount - 1) {
                scope.carouselExposedIndex =  scope.carouselExposedIndex + 1;
            } else {
                scope.carouselExposedIndex = 0;
            }
        };

        var restartTimer =function (){
            stopAutoPlay();
            timer = $timeout(function(){
                increment()
            }, delay);
        };

        scope.$on('rnCarousel:CollectionUpdated', function($parentscope, newSlidesCount){
            slidesCount = newSlidesCount;
        });

        if(!scope.carouselExposedIndex){
            scope.carouselExposedIndex = 0;
        }

        scope.$watch('carouselIndex', function(){
           restartTimer();
        });

        restartTimer();
        if (attrs.rnCarouselPauseOnHover && attrs.rnCarouselPauseOnHover != 'false'){
            element.on('mouseenter', stopAutoPlay);
            element.on('mouseleave', restartTimer);
        }

        scope.$on('$destroy', function(){
            stopAutoPlay();
            element.off('mouseenter', stopAutoPlay);
            element.off('mouseleave', restartTimer);
        });


    }
  };
}]);