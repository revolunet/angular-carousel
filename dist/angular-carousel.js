/**
 * Angular Carousel - Mobile friendly touch carousel for AngularJS
 * @version v1.0.1 - 2015-12-19
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
    'ngTouch',
    'angular-carousel.shifty'
]);

angular.module('angular-carousel')

.directive('rnCarouselAutoSlide', ['$interval', function($interval) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
        var stopAutoPlay = function() {
            if (scope.autoSlider) {
                $interval.cancel(scope.autoSlider);
                scope.autoSlider = null;
            }
        };
        var restartTimer = function() {
            scope.autoSlide();
        };

        scope.$watch('carouselIndex', restartTimer);

        if (attrs.hasOwnProperty('rnCarouselPauseOnHover') && attrs.rnCarouselPauseOnHover !== 'false'){
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

angular.module('angular-carousel')

.directive('rnCarouselIndicators', ['$parse', function($parse) {
  return {
    restrict: 'A',
    scope: {
      slides: '=',
      index: '=rnCarouselIndex'
    },
    templateUrl: 'carousel-indicators.html',
    link: function(scope, iElement, iAttributes) {
      var indexModel = $parse(iAttributes.rnCarouselIndex);
      scope.goToSlide = function(index) {
        indexModel.assign(scope.$parent.$parent, index);
      };
    }
  };
}]);

angular.module('angular-carousel').run(['$templateCache', function($templateCache) {
  $templateCache.put('carousel-indicators.html',
      '<div class="rn-carousel-indicator">\n' +
        '<span ng-repeat="slide in slides" ng-class="{active: $index==index}" ng-click="goToSlide($index)">●</span>' +
      '</div>'
  );
}]);

(function() {
    "use strict";

    angular.module('angular-carousel')

    .service('DeviceCapabilities', function() {

        // TODO: merge in a single function

        // detect supported CSS property
        function detectTransformProperty() {
            var transformProperty = 'transform',
                safariPropertyHack = 'webkitTransform';
            if (typeof document.body.style[transformProperty] !== 'undefined') {

                ['webkit', 'moz', 'o', 'ms'].every(function (prefix) {
                    var e = '-' + prefix + '-transform';
                    if (typeof document.body.style[e] !== 'undefined') {
                        transformProperty = e;
                        return false;
                    }
                    return true;
                });
            } else if (typeof document.body.style[safariPropertyHack] !== 'undefined') {
                transformProperty = '-webkit-transform';
            } else {
                transformProperty = undefined;
            }
            return transformProperty;
        }

        //Detect support of translate3d
        function detect3dSupport() {
            var el = document.createElement('p'),
                has3d,
                transforms = {
                    'webkitTransform': '-webkit-transform',
                    'msTransform': '-ms-transform',
                    'transform': 'transform'
                };
            // Add it to the body to get the computed style
            document.body.insertBefore(el, null);
            for (var t in transforms) {
                if (el.style[t] !== undefined) {
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

    .service('computeCarouselSlideStyle', ["DeviceCapabilities", function(DeviceCapabilities) {
        // compute transition transform properties for a given slide and global offset
        return function(slideIndex, offset, transitionType) {
            var style = {
                    display: 'inline-block'
                },
                opacity,
                absoluteLeft = (slideIndex * 100) + offset,
                slideTransformValue = DeviceCapabilities.has3d ? 'translate3d(' + absoluteLeft + '%, 0, 0)' : 'translate3d(' + absoluteLeft + '%, 0)',
                distance = ((100 - Math.abs(absoluteLeft)) / 100);

            if (!DeviceCapabilities.transformProperty) {
                // fallback to default slide if transformProperty is not available
                style['margin-left'] = absoluteLeft + '%';
            } else {
                if (transitionType == 'fadeAndSlide') {
                    style[DeviceCapabilities.transformProperty] = slideTransformValue;
                    opacity = 0;
                    if (Math.abs(absoluteLeft) < 100) {
                        opacity = 0.3 + distance * 0.7;
                    }
                    style.opacity = opacity;
                } else if (transitionType == 'hexagon') {
                    var transformFrom = 100,
                        degrees = 0,
                        maxDegrees = 60 * (distance - 1);

                    transformFrom = offset < (slideIndex * -100) ? 100 : 0;
                    degrees = offset < (slideIndex * -100) ? maxDegrees : -maxDegrees;
                    style[DeviceCapabilities.transformProperty] = slideTransformValue + ' ' + 'rotateY(' + degrees + 'deg)';
                    style[DeviceCapabilities.transformProperty + '-origin'] = transformFrom + '% 50%';
                } else if (transitionType == 'zoom') {
                    style[DeviceCapabilities.transformProperty] = slideTransformValue;
                    var scale = 1;
                    if (Math.abs(absoluteLeft) < 100) {
                        scale = 1 + ((1 - distance) * 2);
                    }
                    style[DeviceCapabilities.transformProperty] += ' scale(' + scale + ')';
                    style[DeviceCapabilities.transformProperty + '-origin'] = '50% 50%';
                    opacity = 0;
                    if (Math.abs(absoluteLeft) < 100) {
                        opacity = 0.3 + distance * 0.7;
                    }
                    style.opacity = opacity;
                } else {
                    style[DeviceCapabilities.transformProperty] = slideTransformValue;
                }
            }
            return style;
        };
    }])

    .service('createStyleString', function() {
        return function(object) {
            var styles = [];
            angular.forEach(object, function(value, key) {
                styles.push(key + ':' + value);
            });
            return styles.join(';');
        };
    })

    .directive('rnCarousel', ['$swipe', '$window', '$document', '$parse', '$compile', '$timeout', '$interval', 'computeCarouselSlideStyle', 'createStyleString', 'Tweenable',
        function($swipe, $window, $document, $parse, $compile, $timeout, $interval, computeCarouselSlideStyle, createStyleString, Tweenable) {
            // internal ids to allow multiple instances
            var carouselId = 0,
                // in absolute pixels, at which distance the slide stick to the edge on release
                rubberTreshold = 3;

            var requestAnimationFrame = $window.requestAnimationFrame || $window.webkitRequestAnimationFrame || $window.mozRequestAnimationFrame;

            function getItemIndex(collection, target, defaultIndex) {
                var result = defaultIndex;
                collection.every(function(item, index) {
                    if (angular.equals(item, target)) {
                        result = index;
                        return false;
                    }
                    return true;
                });
                return result;
            }

            return {
                restrict: 'A',
                scope: true,
                compile: function(tElement, tAttributes) {
                    // use the compile phase to customize the DOM
                    var firstChild = tElement[0].querySelector('li'),
                        firstChildAttributes = (firstChild) ? firstChild.attributes : [],
                        isRepeatBased = false,
                        isBuffered = false,
                        repeatItem,
                        repeatCollection;

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
                            transitionEasing: iAttributes.rnCarouselEasing || 'easeTo',
                            transitionDuration: parseInt(iAttributes.rnCarouselDuration, 10) || 300,
                            isSequential: true,
                            autoSlideDuration: 3,
                            bufferSize: 5,
                            /* in container % how much we need to drag to trigger the slide change */
                            moveTreshold: 0.1,
                            defaultIndex: 0
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
                            currentSlides = [],
                            elWidth = null,
                            elX = null,
                            animateTransitions = true,
                            intialState = true,
                            animating = false,
                            mouseUpBound = false,
                            locked = false;

                        //rn-swipe-disabled =true will only disable swipe events
                        if(iAttributes.rnSwipeDisabled !== "true") {
                            $swipe.bind(iElement, {
                                start: swipeStart,
                                move: swipeMove,
                                end: swipeEnd,
                                cancel: function(event) {
                                    swipeEnd({}, event);
                                }
                            });
                        }

                        function getSlidesDOM() {
                            return iElement[0].querySelectorAll('ul[rn-carousel] > li');
                        }

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
                            var x = scope.carouselBufferIndex * 100 + offset;
                            angular.forEach(getSlidesDOM(), function(child, index) {
                                child.style.cssText = createStyleString(computeCarouselSlideStyle(index, x, options.transitionType));
                            });
                        }

                        scope.nextSlide = function(slideOptions) {
                            var index = scope.carouselIndex + 1;
                            if (index > currentSlides.length - 1) {
                                index = 0;
                            }
                            if (!locked) {
                                goToSlide(index, slideOptions);
                            }
                        };

                        scope.prevSlide = function(slideOptions) {
                            var index = scope.carouselIndex - 1;
                            if (index < 0) {
                                index = currentSlides.length - 1;
                            }
                            if (!locked) {
                              goToSlide(index, slideOptions);
                            }
                        };

                        function goToSlide(index, slideOptions) {
                            //console.log('goToSlide', arguments);
                            // move a to the given slide index
                            if (index === undefined) {
                                index = scope.carouselIndex;
                            }

                            slideOptions = slideOptions || {};
                            if (slideOptions.animate === false || options.transitionType === 'none') {
                                locked = false;
                                offset = index * -100;
                                scope.carouselIndex = index;
                                updateBufferIndex();
                                return;
                            }

                            locked = true;
                            var tweenable = new Tweenable();
                            tweenable.tween({
                                from: {
                                    'x': offset
                                },
                                to: {
                                    'x': index * -100
                                },
                                duration: options.transitionDuration,
                                easing: options.transitionEasing,
                                step: function(state) {
                                    if (isFinite(state.x)) {
                                      updateSlidesPosition(state.x);
                                    }
                                },
                                finish: function() {
                                    scope.$apply(function() {
                                        scope.carouselIndex = index;
                                        offset = index * -100;
                                        updateBufferIndex();
                                        $timeout(function () {
                                          locked = false;
                                        }, 0, false);
                                    });
                                }
                            });
                        }

                        function getContainerWidth() {
                            var rect = iElement[0].getBoundingClientRect();
                            return rect.width ? rect.width : rect.right - rect.left;
                        }

                        function updateContainerWidth() {
                            elWidth = getContainerWidth();
                        }

                        function bindMouseUpEvent() {
                            if (!mouseUpBound) {
                              mouseUpBound = true;
                              $document.bind('mouseup', documentMouseUpEvent);
                            }
                        }

                        function unbindMouseUpEvent() {
                            if (mouseUpBound) {
                              mouseUpBound = false;
                              $document.unbind('mouseup', documentMouseUpEvent);
                            }
                        }

                        function swipeStart(coords, event) {
                            // console.log('swipeStart', coords, event);
                            if (locked || currentSlides.length <= 1) {
                                return;
                            }
                            updateContainerWidth();
                            elX = iElement[0].querySelector('li').getBoundingClientRect().left;
                            pressed = true;
                            startX = coords.x;
                            return false;
                        }

                        function swipeMove(coords, event) {
                            //console.log('swipeMove', coords, event);
                            var x, delta;
                            bindMouseUpEvent();
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

                        if (!isRepeatBased) {
                            // fake array when no ng-repeat
                            currentSlides = [];
                            angular.forEach(getSlidesDOM(), function(node, index) {
                                currentSlides.push({id: index});
                            });
                        }

                        if (iAttributes.rnCarouselControls!==undefined) {
                            // dont use a directive for this
                            var canloop = ((isRepeatBased ? scope.$eval(repeatCollection.replace('::', '')).length : currentSlides.length) > 1) ? angular.isDefined(tAttributes['rnCarouselControlsAllowLoop']) : false;
                            var nextSlideIndexCompareValue = isRepeatBased ? '(' + repeatCollection.replace('::', '') + ').length - 1' : currentSlides.length - 1;
                            var tpl = '<div class="rn-carousel-controls">\n' +
                                '  <span class="rn-carousel-control rn-carousel-control-prev" ng-click="prevSlide()" ng-if="carouselIndex > 0 || ' + canloop + '"></span>\n' +
                                '  <span class="rn-carousel-control rn-carousel-control-next" ng-click="nextSlide()" ng-if="carouselIndex < ' + nextSlideIndexCompareValue + ' || ' + canloop + '"></span>\n' +
                                '</div>';
                            iElement.parent().append($compile(angular.element(tpl))(scope));
                        }

                        if (iAttributes.rnCarouselAutoSlide!==undefined) {
                            var duration = parseInt(iAttributes.rnCarouselAutoSlide, 10) || options.autoSlideDuration;
                            scope.autoSlide = function() {
                                if (scope.autoSlider) {
                                    $interval.cancel(scope.autoSlider);
                                    scope.autoSlider = null;
                                }
                                scope.autoSlider = $interval(function() {
                                    if (!locked && !pressed) {
                                        if (iAttributes.rnCarouselRtl) {
                                            scope.prevSlide();
                                        } else {
                                            scope.nextSlide();
                                        }
                                    }
                                }, duration * 1000);
                            };
                        }

                        if (iAttributes.rnCarouselDefaultIndex) {
                            var defaultIndexModel = $parse(iAttributes.rnCarouselDefaultIndex);
                            options.defaultIndex = defaultIndexModel(scope.$parent) || 0;
                        }

                        if (iAttributes.rnCarouselIndex) {
                            var updateParentIndex = function(value) {
                                indexModel.assign(scope.$parent, value);
                            };
                            var indexModel = $parse(iAttributes.rnCarouselIndex);
                            if (angular.isFunction(indexModel.assign)) {
                                /* check if this property is assignable then watch it */
                                scope.$watch('carouselIndex', function(newValue) {
                                    updateParentIndex(newValue);
                                });
                                scope.$parent.$watch(indexModel, function(newValue, oldValue) {

                                    if (newValue !== undefined && newValue !== null) {
                                        if (currentSlides && currentSlides.length > 0 && newValue >= currentSlides.length) {
                                            newValue = currentSlides.length - 1;
                                            updateParentIndex(newValue);
                                        } else if (currentSlides && newValue < 0) {
                                            newValue = 0;
                                            updateParentIndex(newValue);
                                        }
                                        if (!locked) {
                                            goToSlide(newValue, {
                                                animate: !init
                                            });
                                        }
                                        init = false;
                                    }
                                });
                                isIndexBound = true;

                                if (options.defaultIndex) {
                                    goToSlide(options.defaultIndex, {
                                        animate: !init
                                    });
                                }
                            } else if (!isNaN(iAttributes.rnCarouselIndex)) {
                                /* if user just set an initial number, set it */
                                goToSlide(parseInt(iAttributes.rnCarouselIndex, 10), {
                                    animate: false
                                });
                            }
                        } else {
                            goToSlide(options.defaultIndex, {
                                animate: !init
                            });
                            init = false;
                        }

                        if (iAttributes.rnCarouselLocked) {
                            scope.$watch(iAttributes.rnCarouselLocked, function(newValue, oldValue) {
                                // only bind swipe when it's not switched off
                                if(newValue === true) {
                                    locked = true;
                                } else {
                                    locked = false;
                                }
                            });
                        }

                        if (isRepeatBased) {
                            // use rn-carousel-deep-watch to fight the Angular $watchCollection weakness : https://github.com/angular/angular.js/issues/2621
                            // optional because it have some performance impacts (deep watch)
                            var deepWatch = (iAttributes.rnCarouselDeepWatch!==undefined);

                            scope[deepWatch?'$watch':'$watchCollection'](repeatCollection, function(newValue, oldValue) {
                                //console.log('repeatCollection', currentSlides);
                                currentSlides = newValue;
                                // if deepWatch ON ,manually compare objects to guess the new position
                                if (deepWatch && angular.isArray(newValue)) {
                                    var activeElement = oldValue[scope.carouselIndex];
                                    var newIndex = getItemIndex(newValue, activeElement, scope.carouselIndex);
                                    goToSlide(newIndex, {animate: false});
                                } else {
                                    goToSlide(scope.carouselIndex, {animate: false});
                                }
                            }, true);
                        }

                        function swipeEnd(coords, event, forceAnimation) {
                            //  console.log('swipeEnd', 'scope.carouselIndex', scope.carouselIndex);
                            // Prevent clicks on buttons inside slider to trigger "swipeEnd" event on touchend/mouseup
                            // console.log(iAttributes.rnCarouselOnInfiniteScroll);
                            if (event && !swipeMoved) {
                                return;
                            }
                            unbindMouseUpEvent();
                            pressed = false;
                            swipeMoved = false;
                            destination = startX - coords.x;
                            if (destination===0) {
                                return;
                            }
                            if (locked) {
                                return;
                            }
                            offset += (-destination * 100 / elWidth);
                            if (options.isSequential) {
                                var minMove = options.moveTreshold * elWidth,
                                    absMove = -destination,
                                    slidesMove = -Math[absMove >= 0 ? 'ceil' : 'floor'](absMove / elWidth),
                                    shouldMove = Math.abs(absMove) > minMove;

                                if (currentSlides && (slidesMove + scope.carouselIndex) >= currentSlides.length) {
                                    slidesMove = currentSlides.length - 1 - scope.carouselIndex;
                                }
                                if ((slidesMove + scope.carouselIndex) < 0) {
                                    slidesMove = -scope.carouselIndex;
                                }
                                var moveOffset = shouldMove ? slidesMove : 0;

                                destination = (scope.carouselIndex + moveOffset);

                                goToSlide(destination);
                                if(iAttributes.rnCarouselOnInfiniteScrollRight!==undefined && slidesMove === 0 && scope.carouselIndex !== 0) {
                                    $parse(iAttributes.rnCarouselOnInfiniteScrollRight)(scope)
                                    goToSlide(0);
                                }
                                if(iAttributes.rnCarouselOnInfiniteScrollLeft!==undefined && slidesMove === 0 && scope.carouselIndex === 0 && moveOffset === 0) {
                                    $parse(iAttributes.rnCarouselOnInfiniteScrollLeft)(scope)
                                    goToSlide(currentSlides.length);
                                }

                            } else {
                                scope.$apply(function() {
                                    scope.carouselIndex = parseInt(-offset / 100, 10);
                                    updateBufferIndex();
                                });

                            }

                        }

                        scope.$on('$destroy', function() {
                            unbindMouseUpEvent();
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
                                    // compute buffer start
                                    bufferIndex = scope.carouselIndex - bufferEdgeSize;
                                }

                                scope.carouselBufferIndex = bufferIndex;
                                $timeout(function() {
                                    updateSlidesPosition(offset);
                                }, 0, false);
                            } else {
                                $timeout(function() {
                                    updateSlidesPosition(offset);
                                }, 0, false);
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
                            unbindMouseUpEvent();
                            winEl.unbind('orientationchange', onOrientationChange);
                            winEl.unbind('resize', onOrientationChange);
                        });
                    };
                }
            };
        }
    ]);
})();



angular.module('angular-carousel.shifty', [])

.factory('Tweenable', function() {

    /*! shifty - v1.3.4 - 2014-10-29 - http://jeremyckahn.github.io/shifty */
  ;(function (root) {

  /*!
   * Shifty Core
   * By Jeremy Kahn - jeremyckahn@gmail.com
   */

  var Tweenable = (function () {

    'use strict';

    // Aliases that get defined later in this function
    var formula;

    // CONSTANTS
    var DEFAULT_SCHEDULE_FUNCTION;
    var DEFAULT_EASING = 'linear';
    var DEFAULT_DURATION = 500;
    var UPDATE_TIME = 1000 / 60;

    var _now = Date.now
         ? Date.now
         : function () {return +new Date();};

    var now = typeof SHIFTY_DEBUG_NOW !== 'undefined' ? SHIFTY_DEBUG_NOW : _now;

    if (typeof window !== 'undefined') {
      // requestAnimationFrame() shim by Paul Irish (modified for Shifty)
      // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
      DEFAULT_SCHEDULE_FUNCTION = window.requestAnimationFrame
         || window.webkitRequestAnimationFrame
         || window.oRequestAnimationFrame
         || window.msRequestAnimationFrame
         || (window.mozCancelRequestAnimationFrame
         && window.mozRequestAnimationFrame)
         || setTimeout;
    } else {
      DEFAULT_SCHEDULE_FUNCTION = setTimeout;
    }

    function noop () {
      // NOOP!
    }

    /*!
     * Handy shortcut for doing a for-in loop. This is not a "normal" each
     * function, it is optimized for Shifty.  The iterator function only receives
     * the property name, not the value.
     * @param {Object} obj
     * @param {Function(string)} fn
     */
    function each (obj, fn) {
      var key;
      for (key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
          fn(key);
        }
      }
    }

    /*!
     * Perform a shallow copy of Object properties.
     * @param {Object} targetObject The object to copy into
     * @param {Object} srcObject The object to copy from
     * @return {Object} A reference to the augmented `targetObj` Object
     */
    function shallowCopy (targetObj, srcObj) {
      each(srcObj, function (prop) {
        targetObj[prop] = srcObj[prop];
      });

      return targetObj;
    }

    /*!
     * Copies each property from src onto target, but only if the property to
     * copy to target is undefined.
     * @param {Object} target Missing properties in this Object are filled in
     * @param {Object} src
     */
    function defaults (target, src) {
      each(src, function (prop) {
        if (typeof target[prop] === 'undefined') {
          target[prop] = src[prop];
        }
      });
    }

    /*!
     * Calculates the interpolated tween values of an Object for a given
     * timestamp.
     * @param {Number} forPosition The position to compute the state for.
     * @param {Object} currentState Current state properties.
     * @param {Object} originalState: The original state properties the Object is
     * tweening from.
     * @param {Object} targetState: The destination state properties the Object
     * is tweening to.
     * @param {number} duration: The length of the tween in milliseconds.
     * @param {number} timestamp: The UNIX epoch time at which the tween began.
     * @param {Object} easing: This Object's keys must correspond to the keys in
     * targetState.
     */
    function tweenProps (forPosition, currentState, originalState, targetState,
      duration, timestamp, easing) {
      var normalizedPosition = (forPosition - timestamp) / duration;

      var prop;
      for (prop in currentState) {
        if (currentState.hasOwnProperty(prop)) {
          currentState[prop] = tweenProp(originalState[prop],
            targetState[prop], formula[easing[prop]], normalizedPosition);
        }
      }

      return currentState;
    }

    /*!
     * Tweens a single property.
     * @param {number} start The value that the tween started from.
     * @param {number} end The value that the tween should end at.
     * @param {Function} easingFunc The easing curve to apply to the tween.
     * @param {number} position The normalized position (between 0.0 and 1.0) to
     * calculate the midpoint of 'start' and 'end' against.
     * @return {number} The tweened value.
     */
    function tweenProp (start, end, easingFunc, position) {
      return start + (end - start) * easingFunc(position);
    }

    /*!
     * Applies a filter to Tweenable instance.
     * @param {Tweenable} tweenable The `Tweenable` instance to call the filter
     * upon.
     * @param {String} filterName The name of the filter to apply.
     */
    function applyFilter (tweenable, filterName) {
      var filters = Tweenable.prototype.filter;
      var args = tweenable._filterArgs;

      each(filters, function (name) {
        if (typeof filters[name][filterName] !== 'undefined') {
          filters[name][filterName].apply(tweenable, args);
        }
      });
    }

    var timeoutHandler_endTime;
    var timeoutHandler_currentTime;
    var timeoutHandler_isEnded;
    var timeoutHandler_offset;
    /*!
     * Handles the update logic for one step of a tween.
     * @param {Tweenable} tweenable
     * @param {number} timestamp
     * @param {number} duration
     * @param {Object} currentState
     * @param {Object} originalState
     * @param {Object} targetState
     * @param {Object} easing
     * @param {Function(Object, *, number)} step
     * @param {Function(Function,number)}} schedule
     */
    function timeoutHandler (tweenable, timestamp, duration, currentState,
      originalState, targetState, easing, step, schedule) {
      timeoutHandler_endTime = timestamp + duration;
      timeoutHandler_currentTime = Math.min(now(), timeoutHandler_endTime);
      timeoutHandler_isEnded =
        timeoutHandler_currentTime >= timeoutHandler_endTime;

      timeoutHandler_offset = duration - (
          timeoutHandler_endTime - timeoutHandler_currentTime);

      if (tweenable.isPlaying() && !timeoutHandler_isEnded) {
        tweenable._scheduleId = schedule(tweenable._timeoutHandler, UPDATE_TIME);

        applyFilter(tweenable, 'beforeTween');
        tweenProps(timeoutHandler_currentTime, currentState, originalState,
          targetState, duration, timestamp, easing);
        applyFilter(tweenable, 'afterTween');

        step(currentState, tweenable._attachment, timeoutHandler_offset);
      } else if (timeoutHandler_isEnded) {
        step(targetState, tweenable._attachment, timeoutHandler_offset);
        tweenable.stop(true);
      }
    }


    /*!
     * Creates a usable easing Object from either a string or another easing
     * Object.  If `easing` is an Object, then this function clones it and fills
     * in the missing properties with "linear".
     * @param {Object} fromTweenParams
     * @param {Object|string} easing
     */
    function composeEasingObject (fromTweenParams, easing) {
      var composedEasing = {};

      if (typeof easing === 'string') {
        each(fromTweenParams, function (prop) {
          composedEasing[prop] = easing;
        });
      } else {
        each(fromTweenParams, function (prop) {
          if (!composedEasing[prop]) {
            composedEasing[prop] = easing[prop] || DEFAULT_EASING;
          }
        });
      }

      return composedEasing;
    }

    /**
     * Tweenable constructor.
     * @param {Object=} opt_initialState The values that the initial tween should start at if a "from" object is not provided to Tweenable#tween.
     * @param {Object=} opt_config See Tweenable.prototype.setConfig()
     * @constructor
     */
    function Tweenable (opt_initialState, opt_config) {
      this._currentState = opt_initialState || {};
      this._configured = false;
      this._scheduleFunction = DEFAULT_SCHEDULE_FUNCTION;

      // To prevent unnecessary calls to setConfig do not set default configuration here.
      // Only set default configuration immediately before tweening if none has been set.
      if (typeof opt_config !== 'undefined') {
        this.setConfig(opt_config);
      }
    }

    /**
     * Configure and start a tween.
     * @param {Object=} opt_config See Tweenable.prototype.setConfig()
     * @return {Tweenable}
     */
    Tweenable.prototype.tween = function (opt_config) {
      if (this._isTweening) {
        return this;
      }

      // Only set default config if no configuration has been set previously and none is provided now.
      if (opt_config !== undefined || !this._configured) {
        this.setConfig(opt_config);
      }

      this._timestamp = now();
      this._start(this.get(), this._attachment);
      return this.resume();
    };

    /**
     * Sets the tween configuration. `config` may have the following options:
     *
     * - __from__ (_Object=_): Starting position.  If omitted, the current state is used.
     * - __to__ (_Object=_): Ending position.
     * - __duration__ (_number=_): How many milliseconds to animate for.
     * - __start__ (_Function(Object)_): Function to execute when the tween begins.  Receives the state of the tween as the first parameter. Attachment is the second parameter.
     * - __step__ (_Function(Object, *, number)_): Function to execute on every tick.  Receives the state of the tween as the first parameter. Attachment is the second parameter, and the time elapsed since the start of the tween is the third parameter. This function is not called on the final step of the animation, but `finish` is.
     * - __finish__ (_Function(Object, *)_): Function to execute upon tween completion.  Receives the state of the tween as the first parameter. Attachment is the second parameter.
     * - __easing__ (_Object|string=_): Easing curve name(s) to use for the tween.
     * - __attachment__ (_Object|string|any=_): Value that is attached to this instance and passed on to the step/start/finish methods.
     * @param {Object} config
     * @return {Tweenable}
     */
    Tweenable.prototype.setConfig = function (config) {
      config = config || {};
      this._configured = true;

      // Attach something to this Tweenable instance (e.g.: a DOM element, an object, a string, etc.);
      this._attachment = config.attachment;

      // Init the internal state
      this._pausedAtTime = null;
      this._scheduleId = null;
      this._start = config.start || noop;
      this._step = config.step || noop;
      this._finish = config.finish || noop;
      this._duration = config.duration || DEFAULT_DURATION;
      this._currentState = config.from || this.get();
      this._originalState = this.get();
      this._targetState = config.to || this.get();

      // Aliases used below
      var currentState = this._currentState;
      var targetState = this._targetState;

      // Ensure that there is always something to tween to.
      defaults(targetState, currentState);

      this._easing = composeEasingObject(
        currentState, config.easing || DEFAULT_EASING);

      this._filterArgs =
        [currentState, this._originalState, targetState, this._easing];

      applyFilter(this, 'tweenCreated');
      return this;
    };

    /**
     * Gets the current state.
     * @return {Object}
     */
    Tweenable.prototype.get = function () {
      return shallowCopy({}, this._currentState);
    };

    /**
     * Sets the current state.
     * @param {Object} state
     */
    Tweenable.prototype.set = function (state) {
      this._currentState = state;
    };

    /**
     * Pauses a tween.  Paused tweens can be resumed from the point at which they were paused.  This is different than [`stop()`](#stop), as that method causes a tween to start over when it is resumed.
     * @return {Tweenable}
     */
    Tweenable.prototype.pause = function () {
      this._pausedAtTime = now();
      this._isPaused = true;
      return this;
    };

    /**
     * Resumes a paused tween.
     * @return {Tweenable}
     */
    Tweenable.prototype.resume = function () {
      if (this._isPaused) {
        this._timestamp += now() - this._pausedAtTime;
      }

      this._isPaused = false;
      this._isTweening = true;

      var self = this;
      this._timeoutHandler = function () {
        timeoutHandler(self, self._timestamp, self._duration, self._currentState,
          self._originalState, self._targetState, self._easing, self._step,
          self._scheduleFunction);
      };

      this._timeoutHandler();

      return this;
    };

    /**
     * Move the state of the animation to a specific point in the tween's timeline.
     * If the animation is not running, this will cause the `step` handlers to be
     * called.
     * @param {millisecond} millisecond The millisecond of the animation to seek to.
     * @return {Tweenable}
     */
    Tweenable.prototype.seek = function (millisecond) {
      this._timestamp = now() - millisecond;

      if (!this.isPlaying()) {
        this._isTweening = true;
        this._isPaused = false;

        // If the animation is not running, call timeoutHandler to make sure that
        // any step handlers are run.
        timeoutHandler(this, this._timestamp, this._duration, this._currentState,
          this._originalState, this._targetState, this._easing, this._step,
          this._scheduleFunction);

        this._timeoutHandler();
        this.pause();
      }

      return this;
    };

    /**
     * Stops and cancels a tween.
     * @param {boolean=} gotoEnd If false or omitted, the tween just stops at its current state, and the "finish" handler is not invoked.  If true, the tweened object's values are instantly set to the target values, and "finish" is invoked.
     * @return {Tweenable}
     */
    Tweenable.prototype.stop = function (gotoEnd) {
      this._isTweening = false;
      this._isPaused = false;
      this._timeoutHandler = noop;

      (root.cancelAnimationFrame            ||
        root.webkitCancelAnimationFrame     ||
        root.oCancelAnimationFrame          ||
        root.msCancelAnimationFrame         ||
        root.mozCancelRequestAnimationFrame ||
        root.clearTimeout)(this._scheduleId);

      if (gotoEnd) {
        shallowCopy(this._currentState, this._targetState);
        applyFilter(this, 'afterTweenEnd');
        this._finish.call(this, this._currentState, this._attachment);
      }

      return this;
    };

    /**
     * Returns whether or not a tween is running.
     * @return {boolean}
     */
    Tweenable.prototype.isPlaying = function () {
      return this._isTweening && !this._isPaused;
    };

    /**
     * Sets a custom schedule function.
     *
     * If a custom function is not set the default one is used [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window.requestAnimationFrame) if available, otherwise [`setTimeout`](https://developer.mozilla.org/en-US/docs/Web/API/Window.setTimeout)).
     *
     * @param {Function(Function,number)} scheduleFunction The function to be called to schedule the next frame to be rendered
     */
    Tweenable.prototype.setScheduleFunction = function (scheduleFunction) {
      this._scheduleFunction = scheduleFunction;
    };

    /**
     * `delete`s all "own" properties.  Call this when the `Tweenable` instance is no longer needed to free memory.
     */
    Tweenable.prototype.dispose = function () {
      var prop;
      for (prop in this) {
        if (this.hasOwnProperty(prop)) {
          delete this[prop];
        }
      }
    };

    /*!
     * Filters are used for transforming the properties of a tween at various
     * points in a Tweenable's life cycle.  See the README for more info on this.
     */
    Tweenable.prototype.filter = {};

    /*!
     * This object contains all of the tweens available to Shifty.  It is extendible - simply attach properties to the Tweenable.prototype.formula Object following the same format at linear.
     *
     * `pos` should be a normalized `number` (between 0 and 1).
     */
    Tweenable.prototype.formula = {
      linear: function (pos) {
        return pos;
      }
    };

    formula = Tweenable.prototype.formula;

    shallowCopy(Tweenable, {
      'now': now
      ,'each': each
      ,'tweenProps': tweenProps
      ,'tweenProp': tweenProp
      ,'applyFilter': applyFilter
      ,'shallowCopy': shallowCopy
      ,'defaults': defaults
      ,'composeEasingObject': composeEasingObject
    });

    root.Tweenable = Tweenable;
    return Tweenable;

  } ());

  /*!
   * All equations are adapted from Thomas Fuchs' [Scripty2](https://github.com/madrobby/scripty2/blob/master/src/effects/transitions/penner.js).
   *
   * Based on Easing Equations (c) 2003 [Robert Penner](http://www.robertpenner.com/), all rights reserved. This work is [subject to terms](http://www.robertpenner.com/easing_terms_of_use.html).
   */

  /*!
   *  TERMS OF USE - EASING EQUATIONS
   *  Open source under the BSD License.
   *  Easing Equations (c) 2003 Robert Penner, all rights reserved.
   */

  ;(function () {

    Tweenable.shallowCopy(Tweenable.prototype.formula, {
      easeInQuad: function (pos) {
        return Math.pow(pos, 2);
      },

      easeOutQuad: function (pos) {
        return -(Math.pow((pos - 1), 2) - 1);
      },

      easeInOutQuad: function (pos) {
        if ((pos /= 0.5) < 1) {return 0.5 * Math.pow(pos,2);}
        return -0.5 * ((pos -= 2) * pos - 2);
      },

      easeInCubic: function (pos) {
        return Math.pow(pos, 3);
      },

      easeOutCubic: function (pos) {
        return (Math.pow((pos - 1), 3) + 1);
      },

      easeInOutCubic: function (pos) {
        if ((pos /= 0.5) < 1) {return 0.5 * Math.pow(pos,3);}
        return 0.5 * (Math.pow((pos - 2),3) + 2);
      },

      easeInQuart: function (pos) {
        return Math.pow(pos, 4);
      },

      easeOutQuart: function (pos) {
        return -(Math.pow((pos - 1), 4) - 1);
      },

      easeInOutQuart: function (pos) {
        if ((pos /= 0.5) < 1) {return 0.5 * Math.pow(pos,4);}
        return -0.5 * ((pos -= 2) * Math.pow(pos,3) - 2);
      },

      easeInQuint: function (pos) {
        return Math.pow(pos, 5);
      },

      easeOutQuint: function (pos) {
        return (Math.pow((pos - 1), 5) + 1);
      },

      easeInOutQuint: function (pos) {
        if ((pos /= 0.5) < 1) {return 0.5 * Math.pow(pos,5);}
        return 0.5 * (Math.pow((pos - 2),5) + 2);
      },

      easeInSine: function (pos) {
        return -Math.cos(pos * (Math.PI / 2)) + 1;
      },

      easeOutSine: function (pos) {
        return Math.sin(pos * (Math.PI / 2));
      },

      easeInOutSine: function (pos) {
        return (-0.5 * (Math.cos(Math.PI * pos) - 1));
      },

      easeInExpo: function (pos) {
        return (pos === 0) ? 0 : Math.pow(2, 10 * (pos - 1));
      },

      easeOutExpo: function (pos) {
        return (pos === 1) ? 1 : -Math.pow(2, -10 * pos) + 1;
      },

      easeInOutExpo: function (pos) {
        if (pos === 0) {return 0;}
        if (pos === 1) {return 1;}
        if ((pos /= 0.5) < 1) {return 0.5 * Math.pow(2,10 * (pos - 1));}
        return 0.5 * (-Math.pow(2, -10 * --pos) + 2);
      },

      easeInCirc: function (pos) {
        return -(Math.sqrt(1 - (pos * pos)) - 1);
      },

      easeOutCirc: function (pos) {
        return Math.sqrt(1 - Math.pow((pos - 1), 2));
      },

      easeInOutCirc: function (pos) {
        if ((pos /= 0.5) < 1) {return -0.5 * (Math.sqrt(1 - pos * pos) - 1);}
        return 0.5 * (Math.sqrt(1 - (pos -= 2) * pos) + 1);
      },

      easeOutBounce: function (pos) {
        if ((pos) < (1 / 2.75)) {
          return (7.5625 * pos * pos);
        } else if (pos < (2 / 2.75)) {
          return (7.5625 * (pos -= (1.5 / 2.75)) * pos + 0.75);
        } else if (pos < (2.5 / 2.75)) {
          return (7.5625 * (pos -= (2.25 / 2.75)) * pos + 0.9375);
        } else {
          return (7.5625 * (pos -= (2.625 / 2.75)) * pos + 0.984375);
        }
      },

      easeInBack: function (pos) {
        var s = 1.70158;
        return (pos) * pos * ((s + 1) * pos - s);
      },

      easeOutBack: function (pos) {
        var s = 1.70158;
        return (pos = pos - 1) * pos * ((s + 1) * pos + s) + 1;
      },

      easeInOutBack: function (pos) {
        var s = 1.70158;
        if ((pos /= 0.5) < 1) {return 0.5 * (pos * pos * (((s *= (1.525)) + 1) * pos - s));}
        return 0.5 * ((pos -= 2) * pos * (((s *= (1.525)) + 1) * pos + s) + 2);
      },

      elastic: function (pos) {
        return -1 * Math.pow(4,-8 * pos) * Math.sin((pos * 6 - 1) * (2 * Math.PI) / 2) + 1;
      },

      swingFromTo: function (pos) {
        var s = 1.70158;
        return ((pos /= 0.5) < 1) ? 0.5 * (pos * pos * (((s *= (1.525)) + 1) * pos - s)) :
            0.5 * ((pos -= 2) * pos * (((s *= (1.525)) + 1) * pos + s) + 2);
      },

      swingFrom: function (pos) {
        var s = 1.70158;
        return pos * pos * ((s + 1) * pos - s);
      },

      swingTo: function (pos) {
        var s = 1.70158;
        return (pos -= 1) * pos * ((s + 1) * pos + s) + 1;
      },

      bounce: function (pos) {
        if (pos < (1 / 2.75)) {
          return (7.5625 * pos * pos);
        } else if (pos < (2 / 2.75)) {
          return (7.5625 * (pos -= (1.5 / 2.75)) * pos + 0.75);
        } else if (pos < (2.5 / 2.75)) {
          return (7.5625 * (pos -= (2.25 / 2.75)) * pos + 0.9375);
        } else {
          return (7.5625 * (pos -= (2.625 / 2.75)) * pos + 0.984375);
        }
      },

      bouncePast: function (pos) {
        if (pos < (1 / 2.75)) {
          return (7.5625 * pos * pos);
        } else if (pos < (2 / 2.75)) {
          return 2 - (7.5625 * (pos -= (1.5 / 2.75)) * pos + 0.75);
        } else if (pos < (2.5 / 2.75)) {
          return 2 - (7.5625 * (pos -= (2.25 / 2.75)) * pos + 0.9375);
        } else {
          return 2 - (7.5625 * (pos -= (2.625 / 2.75)) * pos + 0.984375);
        }
      },

      easeFromTo: function (pos) {
        if ((pos /= 0.5) < 1) {return 0.5 * Math.pow(pos,4);}
        return -0.5 * ((pos -= 2) * Math.pow(pos,3) - 2);
      },

      easeFrom: function (pos) {
        return Math.pow(pos,4);
      },

      easeTo: function (pos) {
        return Math.pow(pos,0.25);
      }
    });

  }());

  /*!
   * The Bezier magic in this file is adapted/copied almost wholesale from
   * [Scripty2](https://github.com/madrobby/scripty2/blob/master/src/effects/transitions/cubic-bezier.js),
   * which was adapted from Apple code (which probably came from
   * [here](http://opensource.apple.com/source/WebCore/WebCore-955.66/platform/graphics/UnitBezier.h)).
   * Special thanks to Apple and Thomas Fuchs for much of this code.
   */

  /*!
   *  Copyright (c) 2006 Apple Computer, Inc. All rights reserved.
   *
   *  Redistribution and use in source and binary forms, with or without
   *  modification, are permitted provided that the following conditions are met:
   *
   *  1. Redistributions of source code must retain the above copyright notice,
   *  this list of conditions and the following disclaimer.
   *
   *  2. Redistributions in binary form must reproduce the above copyright notice,
   *  this list of conditions and the following disclaimer in the documentation
   *  and/or other materials provided with the distribution.
   *
   *  3. Neither the name of the copyright holder(s) nor the names of any
   *  contributors may be used to endorse or promote products derived from
   *  this software without specific prior written permission.
   *
   *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
   *  "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
   *  THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
   *  ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE
   *  FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
   *  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
   *  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
   *  ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
   *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
   *  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
   */
  ;(function () {
    // port of webkit cubic bezier handling by http://www.netzgesta.de/dev/
    function cubicBezierAtTime(t,p1x,p1y,p2x,p2y,duration) {
      var ax = 0,bx = 0,cx = 0,ay = 0,by = 0,cy = 0;
      function sampleCurveX(t) {return ((ax * t + bx) * t + cx) * t;}
      function sampleCurveY(t) {return ((ay * t + by) * t + cy) * t;}
      function sampleCurveDerivativeX(t) {return (3.0 * ax * t + 2.0 * bx) * t + cx;}
      function solveEpsilon(duration) {return 1.0 / (200.0 * duration);}
      function solve(x,epsilon) {return sampleCurveY(solveCurveX(x,epsilon));}
      function fabs(n) {if (n >= 0) {return n;}else {return 0 - n;}}
      function solveCurveX(x,epsilon) {
        var t0,t1,t2,x2,d2,i;
        for (t2 = x, i = 0; i < 8; i++) {x2 = sampleCurveX(t2) - x; if (fabs(x2) < epsilon) {return t2;} d2 = sampleCurveDerivativeX(t2); if (fabs(d2) < 1e-6) {break;} t2 = t2 - x2 / d2;}
        t0 = 0.0; t1 = 1.0; t2 = x; if (t2 < t0) {return t0;} if (t2 > t1) {return t1;}
        while (t0 < t1) {x2 = sampleCurveX(t2); if (fabs(x2 - x) < epsilon) {return t2;} if (x > x2) {t0 = t2;}else {t1 = t2;} t2 = (t1 - t0) * 0.5 + t0;}
        return t2; // Failure.
      }
      cx = 3.0 * p1x; bx = 3.0 * (p2x - p1x) - cx; ax = 1.0 - cx - bx; cy = 3.0 * p1y; by = 3.0 * (p2y - p1y) - cy; ay = 1.0 - cy - by;
      return solve(t, solveEpsilon(duration));
    }
    /*!
     *  getCubicBezierTransition(x1, y1, x2, y2) -> Function
     *
     *  Generates a transition easing function that is compatible
     *  with WebKit's CSS transitions `-webkit-transition-timing-function`
     *  CSS property.
     *
     *  The W3C has more information about
     *  <a href="http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag">
     *  CSS3 transition timing functions</a>.
     *
     *  @param {number} x1
     *  @param {number} y1
     *  @param {number} x2
     *  @param {number} y2
     *  @return {function}
     */
    function getCubicBezierTransition (x1, y1, x2, y2) {
      return function (pos) {
        return cubicBezierAtTime(pos,x1,y1,x2,y2,1);
      };
    }
    // End ported code

    /**
     * Creates a Bezier easing function and attaches it to `Tweenable.prototype.formula`.  This function gives you total control over the easing curve.  Matthew Lein's [Ceaser](http://matthewlein.com/ceaser/) is a useful tool for visualizing the curves you can make with this function.
     *
     * @param {string} name The name of the easing curve.  Overwrites the old easing function on Tweenable.prototype.formula if it exists.
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @return {function} The easing function that was attached to Tweenable.prototype.formula.
     */
    Tweenable.setBezierFunction = function (name, x1, y1, x2, y2) {
      var cubicBezierTransition = getCubicBezierTransition(x1, y1, x2, y2);
      cubicBezierTransition.x1 = x1;
      cubicBezierTransition.y1 = y1;
      cubicBezierTransition.x2 = x2;
      cubicBezierTransition.y2 = y2;

      return Tweenable.prototype.formula[name] = cubicBezierTransition;
    };


    /**
     * `delete`s an easing function from `Tweenable.prototype.formula`.  Be careful with this method, as it `delete`s whatever easing formula matches `name` (which means you can delete default Shifty easing functions).
     *
     * @param {string} name The name of the easing function to delete.
     * @return {function}
     */
    Tweenable.unsetBezierFunction = function (name) {
      delete Tweenable.prototype.formula[name];
    };

  })();

  ;(function () {

    function getInterpolatedValues (
      from, current, targetState, position, easing) {
      return Tweenable.tweenProps(
        position, current, from, targetState, 1, 0, easing);
    }

    // Fake a Tweenable and patch some internals.  This approach allows us to
    // skip uneccessary processing and object recreation, cutting down on garbage
    // collection pauses.
    var mockTweenable = new Tweenable();
    mockTweenable._filterArgs = [];

    /**
     * Compute the midpoint of two Objects.  This method effectively calculates a specific frame of animation that [Tweenable#tween](shifty.core.js.html#tween) does many times over the course of a tween.
     *
     * Example:
     *
     *     var interpolatedValues = Tweenable.interpolate({
     *       width: '100px',
     *       opacity: 0,
     *       color: '#fff'
     *     }, {
     *       width: '200px',
     *       opacity: 1,
     *       color: '#000'
     *     }, 0.5);
     *
     *     console.log(interpolatedValues);
     *     // {opacity: 0.5, width: "150px", color: "rgb(127,127,127)"}
     *
     * @param {Object} from The starting values to tween from.
     * @param {Object} targetState The ending values to tween to.
     * @param {number} position The normalized position value (between 0.0 and 1.0) to interpolate the values between `from` and `to` for.  `from` represents 0 and `to` represents `1`.
     * @param {string|Object} easing The easing curve(s) to calculate the midpoint against.  You can reference any easing function attached to `Tweenable.prototype.formula`.  If omitted, this defaults to "linear".
     * @return {Object}
     */
    Tweenable.interpolate = function (from, targetState, position, easing) {
      var current = Tweenable.shallowCopy({}, from);
      var easingObject = Tweenable.composeEasingObject(
        from, easing || 'linear');

      mockTweenable.set({});

      // Alias and reuse the _filterArgs array instead of recreating it.
      var filterArgs = mockTweenable._filterArgs;
      filterArgs.length = 0;
      filterArgs[0] = current;
      filterArgs[1] = from;
      filterArgs[2] = targetState;
      filterArgs[3] = easingObject;

      // Any defined value transformation must be applied
      Tweenable.applyFilter(mockTweenable, 'tweenCreated');
      Tweenable.applyFilter(mockTweenable, 'beforeTween');

      var interpolatedValues = getInterpolatedValues(
        from, current, targetState, position, easingObject);

      // Transform values back into their original format
      Tweenable.applyFilter(mockTweenable, 'afterTween');

      return interpolatedValues;
    };

  }());

  /**
   * Adds string interpolation support to Shifty.
   *
   * The Token extension allows Shifty to tween numbers inside of strings.  Among
   * other things, this allows you to animate CSS properties.  For example, you
   * can do this:
   *
   *     var tweenable = new Tweenable();
   *     tweenable.tween({
   *       from: { transform: 'translateX(45px)'},
   *       to: { transform: 'translateX(90xp)'}
   *     });
   *
   * ` `
   * `translateX(45)` will be tweened to `translateX(90)`.  To demonstrate:
   *
   *     var tweenable = new Tweenable();
   *     tweenable.tween({
   *       from: { transform: 'translateX(45px)'},
   *       to: { transform: 'translateX(90px)'},
   *       step: function (state) {
   *         console.log(state.transform);
   *       }
   *     });
   *
   * ` `
   * The above snippet will log something like this in the console:
   *
   *     translateX(60.3px)
   *     ...
   *     translateX(76.05px)
   *     ...
   *     translateX(90px)
   *
   * ` `
   * Another use for this is animating colors:
   *
   *     var tweenable = new Tweenable();
   *     tweenable.tween({
   *       from: { color: 'rgb(0,255,0)'},
   *       to: { color: 'rgb(255,0,255)'},
   *       step: function (state) {
   *         console.log(state.color);
   *       }
   *     });
   *
   * ` `
   * The above snippet will log something like this:
   *
   *     rgb(84,170,84)
   *     ...
   *     rgb(170,84,170)
   *     ...
   *     rgb(255,0,255)
   *
   * ` `
   * This extension also supports hexadecimal colors, in both long (`#ff00ff`)
   * and short (`#f0f`) forms.  Be aware that hexadecimal input values will be
   * converted into the equivalent RGB output values.  This is done to optimize
   * for performance.
   *
   *     var tweenable = new Tweenable();
   *     tweenable.tween({
   *       from: { color: '#0f0'},
   *       to: { color: '#f0f'},
   *       step: function (state) {
   *         console.log(state.color);
   *       }
   *     });
   *
   * ` `
   * This snippet will generate the same output as the one before it because
   * equivalent values were supplied (just in hexadecimal form rather than RGB):
   *
   *     rgb(84,170,84)
   *     ...
   *     rgb(170,84,170)
   *     ...
   *     rgb(255,0,255)
   *
   * ` `
   * ` `
   * ## Easing support
   *
   * Easing works somewhat differently in the Token extension.  This is because
   * some CSS properties have multiple values in them, and you might need to
   * tween each value along its own easing curve.  A basic example:
   *
   *     var tweenable = new Tweenable();
   *     tweenable.tween({
   *       from: { transform: 'translateX(0px) translateY(0px)'},
   *       to: { transform:   'translateX(100px) translateY(100px)'},
   *       easing: { transform: 'easeInQuad' },
   *       step: function (state) {
   *         console.log(state.transform);
   *       }
   *     });
   *
   * ` `
   * The above snippet create values like this:
   *
   *     translateX(11.560000000000002px) translateY(11.560000000000002px)
   *     ...
   *     translateX(46.24000000000001px) translateY(46.24000000000001px)
   *     ...
   *     translateX(100px) translateY(100px)
   *
   * ` `
   * In this case, the values for `translateX` and `translateY` are always the
   * same for each step of the tween, because they have the same start and end
   * points and both use the same easing curve.  We can also tween `translateX`
   * and `translateY` along independent curves:
   *
   *     var tweenable = new Tweenable();
   *     tweenable.tween({
   *       from: { transform: 'translateX(0px) translateY(0px)'},
   *       to: { transform:   'translateX(100px) translateY(100px)'},
   *       easing: { transform: 'easeInQuad bounce' },
   *       step: function (state) {
   *         console.log(state.transform);
   *       }
   *     });
   *
   * ` `
   * The above snippet create values like this:
   *
   *     translateX(10.89px) translateY(82.355625px)
   *     ...
   *     translateX(44.89000000000001px) translateY(86.73062500000002px)
   *     ...
   *     translateX(100px) translateY(100px)
   *
   * ` `
   * `translateX` and `translateY` are not in sync anymore, because `easeInQuad`
   * was specified for `translateX` and `bounce` for `translateY`.  Mixing and
   * matching easing curves can make for some interesting motion in your
   * animations.
   *
   * The order of the space-separated easing curves correspond the token values
   * they apply to.  If there are more token values than easing curves listed,
   * the last easing curve listed is used.
   */
  function token () {
    // Functionality for this extension runs implicitly if it is loaded.
  } /*!*/

  // token function is defined above only so that dox-foundation sees it as
  // documentation and renders it.  It is never used, and is optimized away at
  // build time.

  ;(function (Tweenable) {

    /*!
     * @typedef {{
     *   formatString: string
     *   chunkNames: Array.<string>
     * }}
     */
    var formatManifest;

    // CONSTANTS

    var R_NUMBER_COMPONENT = /(\d|\-|\.)/;
    var R_FORMAT_CHUNKS = /([^\-0-9\.]+)/g;
    var R_UNFORMATTED_VALUES = /[0-9.\-]+/g;
    var R_RGB = new RegExp(
      'rgb\\(' + R_UNFORMATTED_VALUES.source +
      (/,\s*/.source) + R_UNFORMATTED_VALUES.source +
      (/,\s*/.source) + R_UNFORMATTED_VALUES.source + '\\)', 'g');
    var R_RGB_PREFIX = /^.*\(/;
    var R_HEX = /#([0-9]|[a-f]){3,6}/gi;
    var VALUE_PLACEHOLDER = 'VAL';

    // HELPERS

    var getFormatChunksFrom_accumulator = [];
    /*!
     * @param {Array.number} rawValues
     * @param {string} prefix
     *
     * @return {Array.<string>}
     */
    function getFormatChunksFrom (rawValues, prefix) {
      getFormatChunksFrom_accumulator.length = 0;

      var rawValuesLength = rawValues.length;
      var i;

      for (i = 0; i < rawValuesLength; i++) {
        getFormatChunksFrom_accumulator.push('_' + prefix + '_' + i);
      }

      return getFormatChunksFrom_accumulator;
    }

    /*!
     * @param {string} formattedString
     *
     * @return {string}
     */
    function getFormatStringFrom (formattedString) {
      var chunks = formattedString.match(R_FORMAT_CHUNKS);

      if (!chunks) {
        // chunks will be null if there were no tokens to parse in
        // formattedString (for example, if formattedString is '2').  Coerce
        // chunks to be useful here.
        chunks = ['', ''];

        // If there is only one chunk, assume that the string is a number
        // followed by a token...
        // NOTE: This may be an unwise assumption.
      } else if (chunks.length === 1 ||
          // ...or if the string starts with a number component (".", "-", or a
          // digit)...
          formattedString[0].match(R_NUMBER_COMPONENT)) {
        // ...prepend an empty string here to make sure that the formatted number
        // is properly replaced by VALUE_PLACEHOLDER
        chunks.unshift('');
      }

      return chunks.join(VALUE_PLACEHOLDER);
    }

    /*!
     * Convert all hex color values within a string to an rgb string.
     *
     * @param {Object} stateObject
     *
     * @return {Object} The modified obj
     */
    function sanitizeObjectForHexProps (stateObject) {
      Tweenable.each(stateObject, function (prop) {
        var currentProp = stateObject[prop];

        if (typeof currentProp === 'string' && currentProp.match(R_HEX)) {
          stateObject[prop] = sanitizeHexChunksToRGB(currentProp);
        }
      });
    }

    /*!
     * @param {string} str
     *
     * @return {string}
     */
    function  sanitizeHexChunksToRGB (str) {
      return filterStringChunks(R_HEX, str, convertHexToRGB);
    }

    /*!
     * @param {string} hexString
     *
     * @return {string}
     */
    function convertHexToRGB (hexString) {
      var rgbArr = hexToRGBArray(hexString);
      return 'rgb(' + rgbArr[0] + ',' + rgbArr[1] + ',' + rgbArr[2] + ')';
    }

    var hexToRGBArray_returnArray = [];
    /*!
     * Convert a hexadecimal string to an array with three items, one each for
     * the red, blue, and green decimal values.
     *
     * @param {string} hex A hexadecimal string.
     *
     * @returns {Array.<number>} The converted Array of RGB values if `hex` is a
     * valid string, or an Array of three 0's.
     */
    function hexToRGBArray (hex) {

      hex = hex.replace(/#/, '');

      // If the string is a shorthand three digit hex notation, normalize it to
      // the standard six digit notation
      if (hex.length === 3) {
        hex = hex.split('');
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }

      hexToRGBArray_returnArray[0] = hexToDec(hex.substr(0, 2));
      hexToRGBArray_returnArray[1] = hexToDec(hex.substr(2, 2));
      hexToRGBArray_returnArray[2] = hexToDec(hex.substr(4, 2));

      return hexToRGBArray_returnArray;
    }

    /*!
     * Convert a base-16 number to base-10.
     *
     * @param {Number|String} hex The value to convert
     *
     * @returns {Number} The base-10 equivalent of `hex`.
     */
    function hexToDec (hex) {
      return parseInt(hex, 16);
    }

    /*!
     * Runs a filter operation on all chunks of a string that match a RegExp
     *
     * @param {RegExp} pattern
     * @param {string} unfilteredString
     * @param {function(string)} filter
     *
     * @return {string}
     */
    function filterStringChunks (pattern, unfilteredString, filter) {
      var pattenMatches = unfilteredString.match(pattern);
      var filteredString = unfilteredString.replace(pattern, VALUE_PLACEHOLDER);

      if (pattenMatches) {
        var pattenMatchesLength = pattenMatches.length;
        var currentChunk;

        for (var i = 0; i < pattenMatchesLength; i++) {
          currentChunk = pattenMatches.shift();
          filteredString = filteredString.replace(
            VALUE_PLACEHOLDER, filter(currentChunk));
        }
      }

      return filteredString;
    }

    /*!
     * Check for floating point values within rgb strings and rounds them.
     *
     * @param {string} formattedString
     *
     * @return {string}
     */
    function sanitizeRGBChunks (formattedString) {
      return filterStringChunks(R_RGB, formattedString, sanitizeRGBChunk);
    }

    /*!
     * @param {string} rgbChunk
     *
     * @return {string}
     */
    function sanitizeRGBChunk (rgbChunk) {
      var numbers = rgbChunk.match(R_UNFORMATTED_VALUES);
      var numbersLength = numbers.length;
      var sanitizedString = rgbChunk.match(R_RGB_PREFIX)[0];

      for (var i = 0; i < numbersLength; i++) {
        sanitizedString += parseInt(numbers[i], 10) + ',';
      }

      sanitizedString = sanitizedString.slice(0, -1) + ')';

      return sanitizedString;
    }

    /*!
     * @param {Object} stateObject
     *
     * @return {Object} An Object of formatManifests that correspond to
     * the string properties of stateObject
     */
    function getFormatManifests (stateObject) {
      var manifestAccumulator = {};

      Tweenable.each(stateObject, function (prop) {
        var currentProp = stateObject[prop];

        if (typeof currentProp === 'string') {
          var rawValues = getValuesFrom(currentProp);

          manifestAccumulator[prop] = {
            'formatString': getFormatStringFrom(currentProp)
            ,'chunkNames': getFormatChunksFrom(rawValues, prop)
          };
        }
      });

      return manifestAccumulator;
    }

    /*!
     * @param {Object} stateObject
     * @param {Object} formatManifests
     */
    function expandFormattedProperties (stateObject, formatManifests) {
      Tweenable.each(formatManifests, function (prop) {
        var currentProp = stateObject[prop];
        var rawValues = getValuesFrom(currentProp);
        var rawValuesLength = rawValues.length;

        for (var i = 0; i < rawValuesLength; i++) {
          stateObject[formatManifests[prop].chunkNames[i]] = +rawValues[i];
        }

        delete stateObject[prop];
      });
    }

    /*!
     * @param {Object} stateObject
     * @param {Object} formatManifests
     */
    function collapseFormattedProperties (stateObject, formatManifests) {
      Tweenable.each(formatManifests, function (prop) {
        var currentProp = stateObject[prop];
        var formatChunks = extractPropertyChunks(
          stateObject, formatManifests[prop].chunkNames);
        var valuesList = getValuesList(
          formatChunks, formatManifests[prop].chunkNames);
        currentProp = getFormattedValues(
          formatManifests[prop].formatString, valuesList);
        stateObject[prop] = sanitizeRGBChunks(currentProp);
      });
    }

    /*!
     * @param {Object} stateObject
     * @param {Array.<string>} chunkNames
     *
     * @return {Object} The extracted value chunks.
     */
    function extractPropertyChunks (stateObject, chunkNames) {
      var extractedValues = {};
      var currentChunkName, chunkNamesLength = chunkNames.length;

      for (var i = 0; i < chunkNamesLength; i++) {
        currentChunkName = chunkNames[i];
        extractedValues[currentChunkName] = stateObject[currentChunkName];
        delete stateObject[currentChunkName];
      }

      return extractedValues;
    }

    var getValuesList_accumulator = [];
    /*!
     * @param {Object} stateObject
     * @param {Array.<string>} chunkNames
     *
     * @return {Array.<number>}
     */
    function getValuesList (stateObject, chunkNames) {
      getValuesList_accumulator.length = 0;
      var chunkNamesLength = chunkNames.length;

      for (var i = 0; i < chunkNamesLength; i++) {
        getValuesList_accumulator.push(stateObject[chunkNames[i]]);
      }

      return getValuesList_accumulator;
    }

    /*!
     * @param {string} formatString
     * @param {Array.<number>} rawValues
     *
     * @return {string}
     */
    function getFormattedValues (formatString, rawValues) {
      var formattedValueString = formatString;
      var rawValuesLength = rawValues.length;

      for (var i = 0; i < rawValuesLength; i++) {
        formattedValueString = formattedValueString.replace(
          VALUE_PLACEHOLDER, +rawValues[i].toFixed(4));
      }

      return formattedValueString;
    }

    /*!
     * Note: It's the duty of the caller to convert the Array elements of the
     * return value into numbers.  This is a performance optimization.
     *
     * @param {string} formattedString
     *
     * @return {Array.<string>|null}
     */
    function getValuesFrom (formattedString) {
      return formattedString.match(R_UNFORMATTED_VALUES);
    }

    /*!
     * @param {Object} easingObject
     * @param {Object} tokenData
     */
    function expandEasingObject (easingObject, tokenData) {
      Tweenable.each(tokenData, function (prop) {
        var currentProp = tokenData[prop];
        var chunkNames = currentProp.chunkNames;
        var chunkLength = chunkNames.length;
        var easingChunks = easingObject[prop].split(' ');
        var lastEasingChunk = easingChunks[easingChunks.length - 1];

        for (var i = 0; i < chunkLength; i++) {
          easingObject[chunkNames[i]] = easingChunks[i] || lastEasingChunk;
        }

        delete easingObject[prop];
      });
    }

    /*!
     * @param {Object} easingObject
     * @param {Object} tokenData
     */
    function collapseEasingObject (easingObject, tokenData) {
      Tweenable.each(tokenData, function (prop) {
        var currentProp = tokenData[prop];
        var chunkNames = currentProp.chunkNames;
        var chunkLength = chunkNames.length;
        var composedEasingString = '';

        for (var i = 0; i < chunkLength; i++) {
          composedEasingString += ' ' + easingObject[chunkNames[i]];
          delete easingObject[chunkNames[i]];
        }

        easingObject[prop] = composedEasingString.substr(1);
      });
    }

    Tweenable.prototype.filter.token = {
      'tweenCreated': function (currentState, fromState, toState, easingObject) {
        sanitizeObjectForHexProps(currentState);
        sanitizeObjectForHexProps(fromState);
        sanitizeObjectForHexProps(toState);
        this._tokenData = getFormatManifests(currentState);
      },

      'beforeTween': function (currentState, fromState, toState, easingObject) {
        expandEasingObject(easingObject, this._tokenData);
        expandFormattedProperties(currentState, this._tokenData);
        expandFormattedProperties(fromState, this._tokenData);
        expandFormattedProperties(toState, this._tokenData);
      },

      'afterTween': function (currentState, fromState, toState, easingObject) {
        collapseFormattedProperties(currentState, this._tokenData);
        collapseFormattedProperties(fromState, this._tokenData);
        collapseFormattedProperties(toState, this._tokenData);
        collapseEasingObject(easingObject, this._tokenData);
      }
    };

  } (Tweenable));

  }(window));

  return window.Tweenable;
});

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
