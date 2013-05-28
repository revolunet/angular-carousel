/**
 * Angular Carousel - Mobile friendly touch carousel for AngularJS
 * @version v0.0.8 - 2013-05-28
 * @link http://revolunet.github.com/angular-carousel
 * @author Julien Bouquillon <julien@revolunet.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
/*global angular, console, $*/

"use strict";

/*
Angular touch carousel with CSS GPU accel and slide buffering
http://github.com/revolunet/angular-carousel
*/

angular.module('angular-carousel', ['ngMobile'])
  .filter('carouselSlice', function() {
    return function(arr, start, end) {
      return arr.slice(start, end);
    };
  })
  .directive('rnCarousel', ['$compile', '$parse', '$swipe', function($compile, $parse, $swipe) {
    /* track number of carousel instances */
    var carousels = 0;

    return {
      restrict: 'A',
      scope: true,
      compile: function(tElement, tAttrs) {

        tElement.addClass('rn-carousel-slides');

        /* extract the ngRepeat expression from the first li attribute
           this expression will be used to update the carousel
           buffered carousels will add a slice operator to that expression

           TODO: handle various ng-repeat syntaxes
        */
        var liAttribute = tElement.find('li')[0].attributes['ng-repeat'],
            originalCollection = liAttribute.value.match( /^([^\s]+) in (.+)$/i )[2],
            isBuffered = angular.isDefined(tAttrs['rnCarouselBuffered']);

        if (isBuffered) {
          /* update the current ngRepeat expression and add a slice operator */
          var sliceExpression = '|carouselSlice:carouselBufferStart:carouselBufferStart+carouselBufferSize';
          liAttribute.value += sliceExpression;
        }

        return function(scope, iElement, iAttrs, controller) {
          carousels++;
          var carouselId = 'rn-carousel-' + carousels,
              swiping = 0,
              startX = 0,
              startOffset  = 0,
              offset  = 0,
              minSwipePercentage = 0.1,
              containerWidth = 0,
              initialPosition = true;

          /* add a wrapper div that will hide the overflow */
          var carousel = iElement.wrap("<div id='" + carouselId +"' class='rn-carousel-container'></div>"),
              container = carousel.parent();

          scope.carouselItems = [];       // reference to the ngRepeat collection
          scope.carouselBufferStart = 0;  // index of the buffer start, if any, relative to the whole collection
          scope.totalIndex = 0;           // index of the active slide, relative to the whole collection
          scope.activeIndex = 0;          // index of the active slide, relative to the buffered collection (may be buffered)

          var updateCarouselPadding = function(offset) {
            /* replace removed DOM elements with absolute left positionning
               we cannot use padding/margin here as it won't work with percentages based containers
            */
            carousel.addClass('rn-carousel-noanimate').css({
              'left': (offset * containerWidth) + 'px'
            });
          };
          var transitionEndCallback = function() {
            /* when carousel transition is finished,
               check if we need to update the DOM (add/remove slides)
            */
            var isLeftEdge = (scope.totalIndex > 0 && scope.activeIndex === 0),
                isRightEdge = (scope.totalIndex < (getSlidesCount() - 1) && scope.activeIndex === carousel.find('li').length - 1);

            if (isLeftEdge || isRightEdge) {
              var direction = isLeftEdge?-1:+1;
              updateCarouselPadding((scope.carouselBufferStart + direction));
              scope.$apply(function() {
                scope.carouselBufferStart += direction;
              });

              if (isRightEdge && iAttrs.rnCarouselOnEnd) {
                /* user set a callback function, when we reach the right edge
                   call it and send the last known slide index
                */
                $parse(iAttrs.rnCarouselOnEnd)(scope, {
                  index: (scope.totalIndex + 1)
                });
              }
            }
          };

          var vendorPrefixes = ["webkit", "moz"];
          function getCSSProperty(property, value) {
            /* cross browser CSS properties generator */
            var css = {};
            css[property] = value;
            angular.forEach(vendorPrefixes, function(prefix, idx) {
              css['-' + prefix.toLowerCase() + '-' + property] = value;
            });
            return css;
          }
          function translateSlideproperty(offset) {
            return getCSSProperty('transform', 'translate3d(' + offset + 'px,0,0)');
            //matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, ' + offset + ', 0, 0, 1)');
          }

          if (isBuffered) {
            /* buffered carousels listen transitionEnd CSS events to update the DOM */
            scope.carouselBufferSize = 3;
            carousel[0].addEventListener('webkitTransitionEnd', transitionEndCallback, false);  // webkit
            carousel[0].addEventListener('transitionend', transitionEndCallback, false);        // mozilla
            scope.$watch('carouselBufferStart', function(newValue, oldValue) {
              updateActiveIndex();
            });
          }

          function updateActiveIndex() {
            /* update the activeIndex (visible slide) based on the current collection 
               can be used to compare with $index in your carousel template
            */
            scope.activeIndex = scope.totalIndex - scope.carouselBufferStart;
          }

          /* handle rn-carousel-index attribute data binding */
          if (iAttrs.rnCarouselIndex) {
              var indexModel = $parse(iAttrs.rnCarouselIndex);
              if (angular.isFunction(indexModel.assign)) {
                /* check if this property is assignable then watch it */
                scope.$watch('totalIndex', function(newValue) {
                  indexModel.assign(scope.$parent, newValue);
                });
                scope.$parent.$watch(indexModel, function(newValue, oldValue) {
                  scope.totalIndex = newValue;
                });
              } else if (!isNaN(iAttrs.rnCarouselIndex)) {
                /* if user just set an initial number, set it */
                scope.totalIndex = parseInt(iAttrs.rnCarouselIndex, 10);
              }
          }

          scope.$watch('totalIndex', function(newValue, oldValue) {
            if (newValue!==oldValue) {
              updateSlidePosition();
            }
            updateActiveIndex();
          });

          scope.$watch(originalCollection, function(newValue, oldValue) {
            /* when the original collection change,
                - update local list reference
                - update container width based on first item width
            */
            scope.carouselItems = newValue;
            var slides = carousel.find('li');
            if (containerWidth === 0 && slides.length > 0) {
              containerWidth = slides[0].getBoundingClientRect().width;
              container.css('width', containerWidth + 'px');
              updateSlidePosition();
            } else {
              containerWidth = 0;
            }
          }, true);

          /* enable carousel indicator */
          if (angular.isDefined(iAttrs.rnCarouselIndicator)) {
            var indicator = $compile("<div id='" + carouselId +"-indicator' index='totalIndex' items='carouselItems' data-rn-carousel-indicators class='rn-carousel-indicator'></div>")(scope);
            container.append(indicator);
          }

          var getSlidesCount = function() {
              /* returns the total number of items in the carousel */
              return scope.carouselItems.length;
          };

          var updateSlidePosition = function() {
            /* trigger carousel position update */
            var skipAnimation = (initialPosition===true),
                slidesCount = getSlidesCount();
            /* check we're not out of bounds */
            if (scope.totalIndex < 0) {
              scope.totalIndex = 0;
            }
            else if (scope.totalIndex > slidesCount - 1) {
              scope.totalIndex = slidesCount - 1;
            }
            /* check if requested position is out of buffer */
            if (isBuffered) {
              if ((scope.totalIndex < scope.carouselBufferStart) || (scope.totalIndex > (scope.carouselBufferStart + scope.carouselBufferSize - 1))) {
                  scope.carouselBufferStart = Math.max(0, scope.totalIndex - 1);
                  skipAnimation = true;
                  updateCarouselPadding(scope.carouselBufferStart);
              }
              /* ensure buffer start never reduces buffer and is never negative */
              scope.carouselBufferStart = Math.max(0, Math.min(scope.carouselBufferStart, slidesCount - scope.carouselBufferSize));
            }
            offset = scope.totalIndex * -containerWidth;
            if (skipAnimation===true) {
                carousel.addClass('rn-carousel-noanimate')
                    .css(translateSlideproperty(offset));
            } else {
                carousel.removeClass('rn-carousel-noanimate')
                    .addClass('rn-carousel-animate')
                    .css(translateSlideproperty(offset));
            }
            initialPosition = false;
          };

          $swipe.bind(carousel, {
            /* use angular $swipe service */
            start: function(coords) {
              /* capture initial event position */
              if (swiping === 0) {
                swiping = 1;
                startX = coords.x;
              }
            },
            move: function (coords) {
              /* follow cursor movement */
              if (swiping===0) return;
              var deltaX = coords.x - startX;
              if (swiping === 1 && deltaX !== 0) {
                swiping = 2;
                startOffset = offset;
              }
              else if (swiping === 2) {
                var slideCount = getSlidesCount();
                /* ratio is used for the 'rubber band' effect */
                var ratio = 1;
                if ((scope.totalIndex === 0 && coords.x > startX) || (scope.totalIndex === slideCount - 1 && coords.x < startX))
                  ratio = 3;
                offset = startOffset + deltaX / ratio;
                carousel.css(translateSlideproperty(offset))
                        .removeClass()
                        .addClass('rn-carousel-noanimate');
              }
            },
            end: function (coords) {
              /* when movement ends, go to next slide or stay on the same */
              var slideCount = getSlidesCount(),
                  tmpSlide;
              if (swiping > 0) {
                swiping = 0;
                tmpSlide = offset < startOffset ? scope.totalIndex + 1 : scope.totalIndex - 1;
                tmpSlide = Math.min(Math.max(tmpSlide, 0), slideCount - 1);

                var delta = coords.x - startX;
                if (Math.abs(delta) <= containerWidth * minSwipePercentage) {
                  /* prevent swipe if not swipped enough */
                  tmpSlide = scope.totalIndex;
                }
                var changed = (scope.totalIndex !== tmpSlide);
                scope.$apply(function() {
                  scope.totalIndex = tmpSlide;
                });
                /* reset slide position if same slide (watch not triggered) */
                if (!changed) updateSlidePosition();
              }
            }
          });

        };
      }
    };
  }])
  .directive('rnCarouselIndicators', [function() {
    return {
      restrict: 'A',
      replace: true,
      scope: {
        items: '=',
        index: '='
      },
      template: '<div class="rn-carousel-indicator">' +
                  '<span ng-repeat="item in items" ng-class="{active: $index==$parent.index}">●</span>' +
                '</div>'
    };
  }]);
