/*global angular, console, $*/

"use strict";

/*
Angular touch carousel with CSS GPU accel
http://github.com/revolunet/angular-carousel
*/

angular.module('angular-carousel', [])
  .filter('carouselSlice', function() {
    return function(arr, start, end) {
      return arr.slice(start, end);
    };
  })
  .directive('rnCarousel', ['$document', '$compile', '$parse', '$timeout', function($document, $compile, $parse, $timeout) {
    // track number of carousel instances
    var carousels = 0;

    return {
      restrict: 'A',
      scope: true,
      compile: function(tElement, tAttrs) {

        tElement.addClass('rn-carousel-slides');

        // extract the ngRepeat expression from the li attribute
        // TODO: handle various ng-repeat syntaxes
        var liAttribute = tElement.find('li')[0].attributes['ng-repeat'],
            originalCollection = liAttribute.value.match( /^([^\s]+) in (.+)$/i )[2];

        var isBuffered = angular.isDefined(tAttrs['rnCarouselBuffered']);

        if (isBuffered) {
          // update the current ngRepat expression and add a slice for buffered carousel
          var sliceExpression = '|carouselSlice:carouselBufferStart:carouselBufferStart+carouselBufferSize';
          liAttribute.value += sliceExpression;
        }

        return function(scope, iElement, iAttrs, controller) {
          // init some variables
          carousels++;
          var carouselId = 'rn-carousel-' + carousels,
              swiping = 0,
              startX = 0,
              startOffset  = 0,
              offset  = 0,
              minSwipePercentage = 0.1,
              containerWidth = 0,
              initialPosition = true;

          // add a wrapper div that will hide overflow
          var carousel = iElement.wrap("<div id='" + carouselId +"' class='rn-carousel-container'></div>"),
              container = carousel.parent();

          scope.carouselItems = [];
          scope.carouselIndex = 0;

          var updateCarouselPadding = function(offset) {
            // replace DOM elements with padding
            carousel.addClass('rn-carousel-noanimate').css({
              'padding-left': (offset* containerWidth) + 'px'
            });
          };
          var transitionEndCallback = function() {
            // when carousel transition is finished,
            // check if we need to update the DOM (add/remove slides)
            // TODO: prevent overlapping
            var isLeftEdge = (scope.carouselIndex > 0 && (scope.carouselIndex - scope.carouselBufferStart) === 0),
                isRightEdge = (scope.carouselIndex < (getSlidesCount() - 1) && (scope.carouselIndex - scope.carouselBufferStart) === carousel.find('li').length - 1);
            if (isLeftEdge || isRightEdge) {
              // update the buffer, and add a padding to replace the content
              var direction = isLeftEdge?-1:+1;
              updateCarouselPadding((scope.carouselBufferStart + direction));
              scope.$apply(function() {
                scope.carouselBufferStart += direction;
              });
            }
          };

          var vendorPrefixes = ["webkit", "moz"];
          function getCSSProperty(property, value) {
            // cross browser CSS properties generator
            var css = {};
            css[property] = value;
            angular.forEach(vendorPrefixes, function(prefix, idx) {
              css['-' + prefix.toLowerCase() + '-' + property] = value;
            });
            return css;
          }

          // for buffered carousels
          if (isBuffered) {
            scope.carouselBufferSize = 3;
            scope.carouselBufferStart = 0;
            carousel[0].addEventListener('webkitTransitionEnd', transitionEndCallback, false);  // webkit
            carousel[0].addEventListener('transitionend', transitionEndCallback, false);        // mozilla
          }

          function watchLocalIndex() {
            scope.$watch('carouselIndex', function(newValue, oldValue) {
              if (newValue!==oldValue) {
                updateSlidePosition();
              }
            });
          }

          // handle rn-carousel-index attribute data binding
          if (iAttrs.rnCarouselIndex) {
              var activeModel = $parse(iAttrs['rnCarouselIndex']);
              if (angular.isFunction(activeModel.assign)) {
                // check if this property is assignable then watch it
                scope.$watch('carouselIndex', function(newValue) {
                  activeModel.assign(scope.$parent, newValue);
                });
                scope.$parent.$watch($parse(iAttrs.rnCarouselIndex), function(newValue, oldValue) {
                  scope.carouselIndex = newValue;
                  if (newValue!==oldValue) {
                    updateSlidePosition();
                  }
                });
              } else if (!isNaN(iAttrs['rnCarouselIndex'])) {
                // if user just set an initial number, set it then start watching
                watchLocalIndex();
                scope.carouselIndex = parseInt(iAttrs['rnCarouselIndex'], 10);
              }
          } else {
              // just watch index and update display accordingly
              watchLocalIndex();
          }

          // watch the ngRepeat expression for changes
          scope.$watch(originalCollection, function(newValue, oldValue) {
            // update local list reference when slides updated
            // also update container width based on first item width
            scope.carouselItems = newValue;

            var slides = carousel.find('li');
            if (slides.length > 0) {
              containerWidth = slides[0].getBoundingClientRect().width;
              container.css('width', containerWidth + 'px');
              updateSlidePosition();
            } else {
              containerWidth = 0;
            }
          }, true);

          // enable carousel indicator
          var showIndicator = angular.isDefined(iAttrs['rnCarouselIndicator']);
          if (showIndicator) {
            var indicator = $compile("<div id='" + carouselId +"-indicator' index='carouselIndex' items='carouselItems' data-rn-carousel-indicators class='rn-carousel-indicator'></div>")(scope);
            container.append(indicator);
          }

          var getSlidesCount = function() {
              /* returns the number of items in the carousel */
              return scope.carouselItems.length;
          };

          var updateSlidePosition = function() {
            var skipAnimation = (initialPosition===true);
            if (isBuffered && (scope.carouselIndex < scope.carouselBufferStart || scope.carouselIndex > (scope.carouselBufferStart + scope.carouselBufferSize - 1))) {
              // asked position is out of buffer, reinitialize it
              scope.carouselBufferStart = scope.carouselIndex - 1;
              skipAnimation = true;
              updateCarouselPadding(scope.carouselBufferStart);
            }
            offset = scope.carouselIndex * -containerWidth;
            if (skipAnimation===true) {
                carousel.addClass('rn-carousel-noanimate')
                    .css(getCSSProperty('transform',  'translate3d(' + offset + 'px,0,0)'));
            } else {
                carousel.removeClass('rn-carousel-noanimate')
                    .addClass('rn-carousel-animate')
                    .css(getCSSProperty('transform',  'translate3d(' + offset + 'px,0,0)'));
            }
            initialPosition = false;
          };

          var transformEvent = function(event) {
            /* allow mouseEvent + touchEvent */
            if ((typeof event.originalEvent !== 'undefined') && event.originalEvent.touches > 0)
              event = event.originalEvent.touches[0];
            else if ((typeof event.touches !== 'undefined') && event.touches.length > 0)
              event = event.touches[0];
            else if ((typeof event.changedTouches !== 'undefined') && event.changedTouches.length > 0)
              event = event.changedTouches[0];
            return event;
          };

          var swipeStart = function(event) {
            /* capture initial event position */
            event = transformEvent(event);
            if (swiping === 0) {
              swiping = 1;
              startX = event.clientX;
            }
            $document.bind('mouseup', swipeEnd);
          };

          var swipe = function(event) {
            /* follow cursor movement */
            if (swiping===0) return;
            event.preventDefault();
            event = transformEvent(event);

            var deltaX = event.clientX - startX;
            if (swiping === 1 && deltaX !== 0) {
              swiping = 2;
              startOffset = offset;
            }
            else if (swiping === 2) {
              var slideCount = getSlidesCount();
              // ratio is used for the 'rubber band' effect
              var ratio = 1;
              if ((scope.carouselIndex === 0 && event.clientX > startX) || (scope.carouselIndex === slideCount - 1 && event.clientX < startX))
                ratio = 3;
              offset = startOffset + deltaX / ratio;
              carousel.css(getCSSProperty('transform',  'translate3d(' + offset + 'px,0,0)'))
                      .removeClass()
                      .addClass('rn-carousel-noanimate');
            }
          };

          var swipeEnd = function(event) {
            $document.unbind('mouseup', swipeEnd);
            /* when movement ends, go to next slide or stay on the same */
            event = transformEvent(event);
            var slideCount = getSlidesCount(),
                tmpSlide;
            if (swiping > 0) {
              swiping = 0;
              tmpSlide = offset < startOffset ? scope.carouselIndex + 1 : scope.carouselIndex - 1;
              tmpSlide = Math.min(Math.max(tmpSlide, 0), slideCount - 1);

              var delta = event.clientX - startX;
              if (Math.abs(delta) <= containerWidth * minSwipePercentage) {
                // prevent swipe if not swipped enough
                tmpSlide = scope.carouselIndex;
              }
              var changed = (scope.carouselIndex !== tmpSlide);
              scope.$apply(function() {
                scope.carouselIndex = tmpSlide;
              });
              // reset position if same slide (watch not triggered)
              if (!changed) updateSlidePosition();
            }
          };

          // bind events
          container.bind('mousedown touchstart', swipeStart);
          container.bind('mousemove touchmove', swipe);
          container.bind('mouseup touchend', swipeEnd);

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
