/*global angular, console, $*/

"use strict";

/*
Angular touch carousel with CSS GPU accel
http://github.com/revolunet/angular-carousel
*/

angular.module('angular-carousel', [])
  .directive('rnCarousel', ['$document', '$compile', '$parse', function($document, $compile, $parse) {
    // track number of carousel instances
    var carousels = 0;

    // track any ngRepeat directive
    function extractNgRepeatExpression(elm) {
      var ngRepeatPrefix =  "ngRepeat:";
      function getNgRepeatExpressionFromComment(comment) {
        // extract the expression from generated comment and trim it
        var expression = comment.nodeValue.substring(ngRepeatPrefix.length + 1);
        return(
            expression.replace( /^\s+|\s+$/g, "" )
        );
      }
     function getNgRepeatExpression() {
        // extract the generated comment node
        var nodes = Array.prototype.slice.call(elm.contents());
        var ngRepeatComment = nodes.filter(
            function(node) {
                return(
                    ( node.nodeType === 8 ) &&
                    ( node.nodeValue.indexOf(ngRepeatPrefix) !== -1 )
                );
            }
        );
        return(
            getNgRepeatExpressionFromComment(
                ngRepeatComment[0]
            )
        );
      }
      var expression = getNgRepeatExpression();
      // extract the list part of the final expression
      var expressionPattern = /^([^\s]+) in (.+)$/i;
      var expressionParts = expression.match( expressionPattern );
      return expressionParts[2];
    }

    return {
      restrict: 'A',
      scope: true,
      compile: function(tElement, tAttrs) {

        tElement.addClass('rn-carousel-slides');

        return function(scope, iElement, iAttrs, controller) {
          // init some variables
          carousels++;
          var carouselId = 'rn-carousel-' + carousels;
          var swiping = 0,
              startX = 0,
              startOffset  = 0,
              offset  = 0,
              minSwipePercentage = 0.1,
              containerWidth = 0;

          // add a wrapper div that will hide overflow
          var carousel = iElement.wrap("<div id='" + carouselId +"' class='rn-carousel-container'></div>"),
              container = carousel.parent();

          scope.carouselItems = [];
          scope.carouselIndex = 0;
          if (iAttrs.rnCarouselIndex) {
              // attribute data binding
              var activeModel = $parse(iAttrs['rnCarouselIndex']);
              scope.$watch('carouselIndex', function(newValue) {
                activeModel.assign(scope.$parent, newValue);
              });
              scope.$parent.$watch($parse(iAttrs.rnCarouselIndex), function(newValue) {
                scope.carouselIndex = newValue;
                updateSlidePosition();
              });
          } else {
              // if no bound indicator, just watch index and update display
              scope.$watch('carouselIndex', function(newValue) {
                updateSlidePosition();
              });
          }

          // extract the ngRepeat expression and watch it
          var collectionName = extractNgRepeatExpression(iElement);
          scope.$watch(collectionName, function(newValue, oldValue) {
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
          var showIndicator = (iAttrs['rnCarouselIndicator']==='true');
          if (showIndicator) {
            var indicator = $compile("<div id='" + carouselId +"-indicator' index='carouselIndex' items='carouselItems' data-rn-carousel-indicators class='rn-carousel-indicator'></div>")(scope);
            container.append(indicator);
          }

          var getSlidesCount = function() {
              /* returns the number of items in the carousel */
              return scope.carouselItems.length;
          };

          var updateSlidePosition = function() {
              offset = scope.carouselIndex * -containerWidth;
              carousel.removeClass('rn-carousel-noanimate').addClass('rn-carousel-animate').css({
                '-webkit-transform': 'translate3d(' + offset + 'px,0,0)',
                '-moz-transform': 'translate3d(' + offset + 'px,0,0)',
                '-ms-transform': 'translate3d(' + offset + 'px,0,0)',
                '-o-transform': 'translate3d(' + offset + 'px,0,0)',
                'transform': 'translate3d(' + offset + 'px,0,0)'
              });
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
              carousel.css({
                '-webkit-transform': 'translate3d(' + offset + 'px,0,0)',
                '-moz-transform': 'translate3d(' + offset + 'px,0,0)',
                '-ms-transform': 'translate3d(' + offset + 'px,0,0)',
                '-o-transform': 'translate3d(' + offset + 'px,0,0)',
                'transform': 'translate3d(' + offset + 'px,0,0)'
              }).removeClass().addClass('rn-carousel-noanimate');
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
