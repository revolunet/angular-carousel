/**
 * Angular Carousel - Mobile friendly touch carousel for AngularJS
 * @version v0.2.5 - 2014-10-12
 * @link http://revolunet.github.com/angular-carousel
 * @author Julien Bouquillon <julien@revolunet.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
/*global angular */

/*
Angular touch carousel with CSS GPU accel and slide buffering
http://github.com/revolunet/angular-carousel

*/

angular.module('angular-carousel', [
    'ngTouch'
]);

angular.module('angular-carousel')

.directive('rnCarouselAutoSlide', ['$timeout', function($timeout) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
        var delay = Math.round(parseFloat(attrs.rnCarouselAutoSlide) * 1000),
            timer = increment = false, slidesCount = element.children().length;

        if(!scope.carouselExposedIndex){
            scope.carouselExposedIndex = 0;
        }
        stopAutoplay = function () {
            if (angular.isDefined(timer)) {
                $timeout.cancel(timer);
            }
            timer = undefined;
        };

        increment = function () {
            if (scope.carouselExposedIndex < slidesCount - 1) {
                scope.carouselExposedIndex =  scope.carouselExposedIndex + 1;
            } else {
                scope.carouselExposedIndex = 0;
            }
        };

        restartTimer = function (){
            stopAutoplay();
            timer = $timeout(increment, delay);
        };

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
angular.module('angular-carousel')

.directive('rnCarouselControls', [function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      items: '=',
      index: '='
    },
    link: function(scope, element, attrs) {
      scope.prev = function() {
        if (scope.index > 0) scope.index--;
      };
      scope.next = function() {
        if (scope.index < scope.items.length-1) scope.index++;
      };
    },
    templateUrl: 'carousel-controls.html'
  };
}]);

angular.module('angular-carousel').run(['$templateCache', function($templateCache) {
  $templateCache.put('carousel-controls.html',
    '<div class="rn-carousel-controls">\n' +
    '  <span class="rn-carousel-control rn-carousel-control-prev" ng-click="prev()" ng-if="index > 0"></span>\n' +
    '  <span class="rn-carousel-control rn-carousel-control-next" ng-click="next()" ng-if="index < items.length - 1"></span>\n' +
    '</div>'
  );
}]);
angular.module('angular-carousel')

.directive('rnCarouselIndicators', [function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      items: '=',
      index: '='
    },
    templateUrl: 'carousel-indicators.html'
  };
}]);

angular.module('angular-carousel').run(['$templateCache', function($templateCache) {
  $templateCache.put('carousel-indicators.html',
      '<div class="rn-carousel-indicator">\n' +
      ' <span ng-repeat="item in items" ng-click="$parent.index=$index" ng-class="{active: $index==$parent.index}"></span>\n' +
      '</div>'
  );
}]);



/*

TODO :

 - non repeat-based
 - iOS8
 - loop
 - autoslide


*/

(function() {
    "use strict";

    angular.module('angular-carousel')

    .service('DeviceCapabilities', function() {

        // detect supported CSS property
        function detectTransformProperty() {
            var transformProperty = 'transform';
            ['webkit', 'moz', 'o', 'ms'].every(function (prefix) {
                var e = '-' + prefix + '-transform';
                if (typeof document.body.style[e] !== 'undefined') {
                    transformProperty = e;
                    return false;
                }
                return true;
            });
            return transformProperty;
        }

        //Detect support of translate3d
        function detect3dSupport() {
            var el = document.createElement('p'),
            has3d,
            transforms = {
                'webkitTransform':'-webkit-transform',
                'msTransform':'-ms-transform',
                'transform':'transform'
            };
            // Add it to the body to get the computed style
            document.body.insertBefore(el, null);
            for(var t in transforms){
                if( el.style[t] !== undefined ){
                    el.style[t] = 'translate3d(1px,1px,1px)';
                    has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
                }
            }
            document.body.removeChild(el);
            return (has3d !== undefined && has3d.length > 0 && has3d !== "none");
        }

        return {
            has3d: detect3dSupport(),
            transformProperty: detectTransformProperty()
        };

    })

    .service('computeCarouselSlideStyle', function(DeviceCapabilities) {
      return function(slideIndex, offset, transitionType) {
        var style,
            absoluteLeft = (slideIndex * 100) + (offset),
            distance = ((100 - Math.abs(absoluteLeft)) / 100);

        if (transitionType == 'slide') {
          style = {
            'left': absoluteLeft + '%'
          };
        } else if (transitionType == 'fadeAndSlide') {
          var opacity = 0;
          if (Math.abs(absoluteLeft) < 100) {
              opacity = distance;
          }
          style = {
            'left': absoluteLeft + '%',
            'opacity': opacity
          };
        } else if (transitionType == 'hexagon') {
          var transformFrom = 100,
              degrees = 0,
              maxDegrees = 60 * (distance - 1);
        
          transformFrom = offset < (slideIndex * -100)?100:0;
          degrees = offset < (slideIndex * -100)?maxDegrees:-maxDegrees;
          style = {
            'left': absoluteLeft + '%',
            'transform-origin': transformFrom + '% 50%'
          };
          style[DeviceCapabilities.transformProperty] = 'rotateY(' + degrees + 'deg)';
          return style;
        }
        return style;
      };
    })
 
    .service('createStyleString', function() {
        return function(object) {
            var styles = [];
            angular.forEach(object, function(value, key) {
                styles.push(key + ':' + value);
            });
            return styles.join(';');
        };
    })

 

    .directive('rnCarousel', ['$swipe', '$window', '$document', '$parse', '$compile', '$timeout', 'computeCarouselSlideStyle', 'createStyleString', function($swipe, $window, $document, $parse, $compile, $timeout, computeCarouselSlideStyle, createStyleString) {
        // internal ids to allow multiple instances
        var carouselId = 0,
            // in container % how much we need to drag to trigger the slide change
            moveTreshold = 0.05,
            // in absolute pixels, at which distance the slide stick to the edge on release
            rubberTreshold = 3;

        var requestAnimationFrame = $window.requestAnimationFrame || $window.webkitRequestAnimationFrame || $window.mozRequestAnimationFrame;

        return {
            restrict: 'A',
            scope: true,
            compile: function(tElement, tAttributes) {
                // use the compile phase to customize the DOM
                var firstChildAttributes = tElement[0].querySelector('li').attributes,
                    isRepeatBased = false,
                    isBuffered = false,
                    repeatItem,
                    repeatCollection;

                // add CSS classes
                // try to find an ngRepeat expression
                // at this point, the attributes are not yet normalized so we need to try various syntax
                ['ng-repeat', 'data-ng-repeat', 'ng:repeat', 'x-ng-repeat'].every(function(attr) {
                    var repeatAttribute = firstChildAttributes[attr];
                    if (angular.isDefined(repeatAttribute)) {
                        // ngRepeat regexp extracted from angular 1.2.7 src
                        var exprMatch = repeatAttribute.value.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?\s*$/),
                            trackProperty = exprMatch[3];

                        repeatItem = exprMatch[1];
                        repeatCollection = exprMatch[2];

                        if (repeatItem) {
                            if (angular.isDefined(tAttributes['rnCarouselBuffered'])) {
                                // update the current ngRepeat expression and add a slice operator if buffered
                                isBuffered = true;
                                repeatAttribute.value = repeatItem + ' in ' + repeatCollection + '|carouselSlice:carouselBufferIndex:carouselBufferSize';
                                if (trackProperty) {
                                    repeatAttribute.value += ' track by ' + trackProperty;
                                }
                            }
                            isRepeatBased = true;
                            return false;
                        }
                    }
                    return true;
                });

                return function(scope, iElement, iAttributes, containerCtrl) {

                    carouselId++;

                    var defaultOptions = {
                        transitionType: iAttributes.rnCarouselTransition || 'slide',
                        transitionEasing: 'easeTo',
                        transitionDuration: 300,
                        isSequential: true,
                        bufferSize: 5
                    };

                    // TODO
                    var options = angular.extend({}, defaultOptions);

                    var pressed,
                        startX,
                        isIndexBound = false,
                        offset = 0,
                        destination,
                        swipeMoved = false,
                        //animOnIndexChange = true,
                        currentSlides,
                        elWidth = null,
                        elX = null,
                        animateTransitions = true,
                        intialState = true,
                        animating;
                        /* do touchend trigger next slide automatically */
                        //sequential = false;

                    iElement.addClass('rn-carousel');

                    $swipe.bind(iElement, {
                        start: swipeStart,
                        move: swipeMove,
                        end: swipeEnd,
                        cancel: function(event) {
                          swipeEnd({}, event);
                        }
                    });

                    function documentMouseUpEvent(event) {
                        // in case we click outside the carousel, trigger a fake swipeEnd
                        swipeMoved = true;
                        swipeEnd({
                            x: event.clientX,
                            y: event.clientY
                        }, event);
                    }

                    function updateSlidesPosition(offset) {
                        // manually apply transformation to carousel childrens
                        // todo : optim : apply only to visible items
                        var style, x;
                        angular.forEach(iElement[0].querySelectorAll('li'), function(child, index) {
                            x = scope.carouselBufferIndex * 100 + offset;
                            style = createStyleString(computeCarouselSlideStyle(index, x, options.transitionType));
                            child.setAttribute('style', style);
                        });
                    }

                 function goToSlide(index, slideOptions) {
                    // move a to the given slide index
                    if (index===undefined) {
                        index = scope.carouselIndex;
                    }
                    slideOptions = slideOptions || {};
                    if (slideOptions.animate===false) {
                        animating = false;
                        offset = index * -100;
                        //updateSlidesPosition(offset);
                        scope.carouselIndex = index;
                        updateSlidesPosition(offset);
                        return;
                    }

                    animating = true;
                    var tweenable = new Tweenable();
                    tweenable.tween({
                      from:     {
                        'x': offset
                      },
                      to: {
                        'x': index * -100
                      },
                      duration: options.transitionDuration,
                      easing: options.transitionEasing,
                      step : function (state) {
                        updateSlidesPosition(state.x);
                      },
                      finish: function() {
                        scope.$apply(function() {
                            animating = false;
                            scope.carouselIndex = index;
                            offset = index * -100;
                            updateBufferIndex();
                        });
                      }
                    });
                  }

                    function getContainerWidth() {
                        return iElement[0].getBoundingClientRect().width;
                    }

                    function updateContainerWidth() {
                        elWidth = getContainerWidth();
                    }

                    function swipeStart(coords, event) {
                        // console.log('swipeStart', coords, event);
                        $document.bind('mouseup', documentMouseUpEvent);
                        updateContainerWidth();
                        elX = iElement[0].querySelector('li').getBoundingClientRect().left;
                        pressed = true;
                        startX = coords.x;
                        return false;
                    }

                    function swipeMove(coords, event) {
                        //console.log('swipeMove', coords, event);
                        var x, delta;
                        if (pressed) {
                            x = coords.x;
                            delta = startX - x;
                            if (delta > 2 || delta < -2) {
                                swipeMoved = true;
                                var moveOffset = offset + (-delta * 100 / elWidth);
                                updateSlidesPosition(moveOffset);
                            }
                        }
                        return false;
                    }

                    var init = true;
                    scope.carouselIndex = 0;

                    if (iAttributes.rnCarouselIndex) {
                        var updateParentIndex = function(value) {
                            indexModel.assign(scope.$parent, value);
                        };
                        var indexModel = $parse(iAttributes.rnCarouselIndex);
                        if (angular.isFunction(indexModel.assign)) {
                            /* check if this property is assignable then watch it */
                            scope.$watch('carouselIndex', function(newValue) {
                                if (!animating) {
                                    updateParentIndex(newValue);
                                }
                                
                            });
                            scope.$parent.$watch(indexModel, function(newValue, oldValue) {

                                if (newValue!==undefined && newValue!==null) {
                                    if (currentSlides && newValue >= currentSlides.length) {
                                        newValue = currentSlides.length - 1;
                                        updateParentIndex(newValue);
                                    } else if (currentSlides && newValue < 0) {
                                        newValue = 0;
                                        updateParentIndex(newValue);
                                    }
                                    if (!animating) {
                                        goToSlide(newValue, {
                                            animate: !init
                                        });
                                    }
                                    init = false;
                                }
                            });
                            isIndexBound = true;
                        } else if (!isNaN(iAttributes.rnCarouselIndex)) {
                          /* if user just set an initial number, set it */
                          goToSlide(parseInt(iAttributes.rnCarouselIndex, 10), {animate: false});
                        }
                    }

                    scope.$watchCollection(repeatCollection, function(newValue, oldValue) {
                        //console.log('repeatCollection', arguments);
                        currentSlides = newValue;
                        goToSlide(scope.carouselIndex);
                    });

                    function swipeEnd(coords, event, forceAnimation) {
                      //  console.log('swipeEnd', 'scope.carouselIndex', scope.carouselIndex);
                        // Prevent clicks on buttons inside slider to trigger "swipeEnd" event on touchend/mouseup
                        if(event && !swipeMoved) {
                            return;
                        }

                        $document.unbind('mouseup', documentMouseUpEvent);
                        pressed = false;
                        swipeMoved = false;
                        destination = startX - coords.x;

                        offset += (-destination * 100 / elWidth);

                        if (options.isSequential) {
                            var minMove = moveTreshold * elWidth,
                                 absMove = -destination,
                                 slidesMove = -Math[absMove>=0?'ceil':'floor'](absMove / elWidth),
                                 shouldMove = Math.abs(absMove) > minMove;

                            if (currentSlides && (slidesMove + scope.carouselIndex) >= currentSlides.length ) {
                                slidesMove = currentSlides.length - 1 - scope.carouselIndex;
                            }
                            if ((slidesMove + scope.carouselIndex) < 0) {
                                slidesMove = -scope.carouselIndex;
                            }
                            var moveOffset = shouldMove?slidesMove:0;

                            destination = (scope.carouselIndex + moveOffset);

                            goToSlide(destination);
                        } else {
                            scope.$apply(function() {
                                scope.carouselIndex = parseInt(-offset / 100, 10);
                                updateBufferIndex();
                            });
                            
                        }

                    }

                    scope.$on('$destroy', function() {
                         $document.unbind('mouseup', documentMouseUpEvent);
                    });

                    scope.carouselBufferIndex = 0;
                    scope.carouselBufferSize = options.bufferSize;

                    function updateBufferIndex() {
                        // update and cap te buffer index
                        var bufferIndex = 0;
                        var bufferEdgeSize = (scope.carouselBufferSize - 1) / 2;
                        if (isBuffered) {
                            if (scope.carouselIndex <= bufferEdgeSize) {
                                // first buffer part
                                bufferIndex = 0;
                            } else if (currentSlides && currentSlides.length < scope.carouselBufferSize) {
                                // smaller than buffer
                                bufferIndex = 0;
                            } else if (currentSlides && scope.carouselIndex > currentSlides.length - scope.carouselBufferSize) {
                                // last buffer part
                                bufferIndex = currentSlides.length - scope.carouselBufferSize;
                            } else {
                                console.log('compute buffer');
                                // compute buffer start
                                bufferIndex = scope.carouselIndex - bufferEdgeSize;
                            }
                            scope.carouselBufferIndex = bufferIndex;
                            $timeout(function() {
                                updateSlidesPosition(offset);
                            }, 0);
                        }
                    }

                    function onOrientationChange() {
                        updateContainerWidth();
                        goToSlide();
                    }

                    // handle orientation change
                    var winEl = angular.element($window);
                    winEl.bind('orientationchange', onOrientationChange);
                    winEl.bind('resize', onOrientationChange);

                    scope.$on('$destroy', function() {
                        $document.unbind('mouseup', documentMouseUpEvent);
                        winEl.unbind('orientationchange', onOrientationChange);
                        winEl.unbind('resize', onOrientationChange);
                    });
                };
            }
        };
    }]);
})();



(function() {
    "use strict";

    angular.module('angular-carousel')

    .filter('carouselSlice', function() {
        return function(collection, start, size) {
            if (angular.isArray(collection)) {
                return collection.slice(start, start + size);
            } else if (angular.isObject(collection)) {
                // dont try to slice collections :)
                return collection;
            }
        };
    });

})();
