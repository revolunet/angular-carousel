angular.module('angular-carousel')

.directive('rnCarousel', ['$compile', '$parse', '$swipe', '$document', '$window', 'CollectionManager', function($compile, $parse, $swipe, $document, $window, CollectionManager) {
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

         if no ng-repeat found, try to use existing <li> DOM nodes
      */
      var liAttributes = tElement.children('li')[0].attributes,
          repeatAttribute = liAttributes['ng-repeat'],
          isBuffered = false,
          originalCollection,
          fakeArray;
      if (!repeatAttribute) repeatAttribute = liAttributes['data-ng-repeat'];
      if (!repeatAttribute) repeatAttribute = liAttributes['x-ng-repeat'];
      if (!repeatAttribute) {
        var liChilds = tElement.children('li');
        if (liChilds.length < 2) {
          throw new Error("carousel: cannot find the ngRepeat attribute OR no childNodes detected");
        }
        // if we use DOM nodes instead of ng-repeat, create a fake collection
        originalCollection = 'fakeArray';
        fakeArray = Array.prototype.slice.apply(liChilds);
      } else {
        var exprMatch = repeatAttribute.value.match(/^\s*(.+)\s+in\s+(.*?)\s*(\s+track\s+by\s+(.+)\s*)?$/),
            originalItem = exprMatch[1],
            trackProperty = exprMatch[3] || '';
        originalCollection = exprMatch[2];
        isBuffered = angular.isDefined(tAttrs['rnCarouselBuffered']);

          /* update the current ngRepeat expression and add a slice operator */
          repeatAttribute.value = originalItem + ' in carouselCollection.cards ' + trackProperty;
      }
      return function(scope, iElement, iAttrs, controller) {
        carousels++;
        var carouselId = 'rn-carousel-' + carousels,
            swiping = 0,                    // swipe status
            startX = 0,                     // initial swipe
            startOffset  = 0,               // first move offset
            offset  = 0,                    // move offset
            minSwipePercentage = 0.1,       // minimum swipe required to trigger slide change
            containerWidth = 0,          // store width of the first slide
            skipAnimation = true;

        /* add a wrapper div that will hide the overflow */
        var carousel = iElement.wrap("<div id='" + carouselId +"' class='rn-carousel-container'></div>"),
            container = carousel.parent();

        if (fakeArray) {
          // publish the fakeArray on the scope to be able to add indicators
          scope.fakeArray = fakeArray;
        }

        function getTransformCoordinates(el) {
          var results = angular.element(el).css('transform').match(/translate3d\((-?\d+(?:px)?),\s*(-?\d+(?:px)?),\s*(-?\d+(?:px)?)\)/);
          if(!results) return [0, 0, 0];
          return results.slice(1, 3);
        }

        function transitionEndCallback(event) {
          /* when slide transition finished, update buffer */
          if ((event.target && event.target=== carousel[0]) && (
              event.propertyName === 'transform' ||
              event.propertyName === '-webkit-transform' ||
              event.propertyName === '-moz-transform')
          ) {
            scope.$apply(function() {
              checkEdges();
              scope.carouselCollection.adjustBuffer();
              updateSlidePosition(true);
            });

          // we should replace the 3d transform with 2d transform to prevent blurry effect on some phones (eg: GS3)
          // todo : use non-3d version for browsers not supporting it
          carousel.css(translateSlideProperty(getTransformCoordinates(carousel[0]), true));

          }
        }

        function updateSlides(method, items) {
          // force apply if no apply/digest phase in progress
          function cb() {
            skipAnimation = true;
            scope.carouselCollection[method](items, true);
          }
          if(!scope.$$phase) {
            scope.$apply(cb);
          } else {
            cb();
          }

        }

        function addSlides(position, items) {
          var method = (position==='after')?'push':'unshift';
          if (items) {
            if (angular.isObject(items.promise)) {
              items.promise.then(function(items) {
                if (items) {
                  updateSlides(method, items);
                }
              });
            } else if (angular.isFunction(items.then)) {
              items.then(function(items) {
                if (items) {
                  updateSlides(method, items);
                }
              });
            } else {
              updateSlides(method, items);
            }
          }
        }

        function checkEdges() {
          var position = scope.carouselCollection.position,
              lastIndex = scope.carouselCollection.getLastIndex(),
              slides=null;
          if (position===0 && angular.isDefined(iAttrs.rnCarouselPrev)) {
            slides = $parse(iAttrs.rnCarouselPrev)(scope, {
              item: scope.carouselCollection.cards[0]
            });
            addSlides('before', slides);
          }
          if (position===lastIndex && angular.isDefined(iAttrs.rnCarouselNext)) {
            slides = $parse(iAttrs.rnCarouselNext)(scope, {
              item: scope.carouselCollection.cards[scope.carouselCollection.cards.length - 1]
            });
            addSlides('after', slides);
          }
        }

        var collectionModel = $parse(originalCollection);
        var collectionParams = {};

        /* rn-carousel-index attribute data binding */
        var initialIndex = 0;
        if (iAttrs.rnCarouselIndex) {
            var indexModel = $parse(iAttrs.rnCarouselIndex);
            if (angular.isFunction(indexModel.assign)) {
              /* check if this property is assignable then watch it */
              scope.$watch('carouselCollection.index', function(newValue) {
                indexModel.assign(scope.$parent, newValue);
              });
              initialIndex = indexModel(scope);
              scope.$parent.$watch(indexModel, function(newValue, oldValue) {
                  if (newValue!==undefined) {
                    scope.carouselCollection.goToIndex(newValue, true);
                  }
                });
            } else if (!isNaN(iAttrs.rnCarouselIndex)) {
              /* if user just set an initial number, set it */
              initialIndex = parseInt(iAttrs.rnCarouselIndex, 10);
            }
        }

        if (angular.isDefined(iAttrs.rnCarouselCycle)) {
          collectionParams.cycle = true;
        }
        collectionParams.index = initialIndex;

        if (isBuffered) {
          collectionParams.bufferSize = 3;
          collectionParams.buffered = true;
        }

        // initialise the collection
        scope.carouselCollection = CollectionManager.create(collectionParams);

        scope.$watch('carouselCollection.updated', function(newValue, oldValue) {
          if (newValue) updateSlidePosition();
        });

        var collectionReady = false;
        scope.$watch(collectionModel, function(newValue, oldValue) {
          // update whole collection contents
          // reinitialise index
          scope.carouselCollection.setItems(newValue, collectionReady);
          collectionReady = true;
          if (containerWidth===0) updateContainerWidth();
          updateSlidePosition();
        });

        if (angular.isDefined(iAttrs.rnCarouselWatch)) {
          scope.$watch(originalCollection, function(newValue, oldValue) {
            // partial collection update, watch deeply so use carefully
            scope.carouselCollection.setItems(newValue, false);
            collectionReady = true;
            if (containerWidth===0) updateContainerWidth();
            updateSlidePosition();
          }, true);
        }

        var vendorPrefixes = ["webkit", "moz"];
        function genCSSProperties(property, value) {
          /* cross browser CSS properties generator */
          var css = {};
          css[property] = value;
          angular.forEach(vendorPrefixes, function(prefix, idx) {
            css['-' + prefix.toLowerCase() + '-' + property] = value;
          });
          return css;
        }
        function translateSlideProperty(offset, is3d) {
          if (is3d) {
            return genCSSProperties('transform', 'translate3d(' + offset + 'px,0,0)');
          } else {
            return genCSSProperties('transform', 'translate(' + offset + 'px,0)');
          }
        }

        carousel[0].addEventListener('webkitTransitionEnd', transitionEndCallback, false);  // webkit
        carousel[0].addEventListener('transitionend', transitionEndCallback, false);        // mozilla

        // when orientation change, force width re-redetection
        window.addEventListener('orientationchange', resize);
        // when window is resized (responsive design)
        window.addEventListener('resize', resize);

        function resize () {
            updateContainerWidth();
            updateSlidePosition();
        }

        function updateContainerWidth() {
            container.css('width', 'auto');
            skipAnimation = true;
            var slides = carousel.children('li');
            if (slides.length === 0) {
              containerWidth = carousel[0].getBoundingClientRect().width;
            } else {
              containerWidth = slides[0].getBoundingClientRect().width;
            }
            container.css('width', containerWidth + 'px');
            return containerWidth;
        }

        /* enable carousel indicator */
        if (angular.isDefined(iAttrs.rnCarouselIndicator)) {
          scope.setActive = function(index) {
            scope.carouselCollection.goToIndex(index, true);
          };
          var indicator = $compile("<div id='" + carouselId +"-indicator' index='carouselCollection.index' items='carouselCollection.items' delegate='this' data-rn-carousel-indicators class='rn-carousel-indicator'></div>")(scope);
          container.append(indicator);
        }

        function updateSlidePosition(forceSkipAnimation) {
          /* trigger carousel position update */
          skipAnimation = !!forceSkipAnimation || skipAnimation;
          if (containerWidth===0) updateContainerWidth();
          offset = Math.round(scope.carouselCollection.getRelativeIndex() * -containerWidth);
          if (skipAnimation===true) {
              carousel.removeClass('rn-carousel-animate')
                  .addClass('rn-carousel-noanimate')
                  .css(translateSlideProperty(offset, false));
          } else {
              carousel.removeClass('rn-carousel-noanimate')
                  .addClass('rn-carousel-animate')
                  .css(translateSlideProperty(offset, true));
          }
          skipAnimation = false;
        }

        /* bind events */

        function swipeEnd(coords) {
            /* when movement ends, go to next slide or stay on the same */
            $document.unbind('mouseup', documentMouseUpEvent);
            if (containerWidth===0) updateContainerWidth();
            if (swiping > 1) {
              var lastIndex = scope.carouselCollection.getLastIndex(),
                  position = scope.carouselCollection.position,
                  slideOffset = (offset < startOffset)?1:-1,
                  tmpSlideIndex = Math.min(Math.max(0, position + slideOffset), lastIndex);
              var delta = coords.x - startX;
              if (Math.abs(delta) <= containerWidth * minSwipePercentage) {
                /* prevent swipe if not swipped enough */
                tmpSlideIndex = position;
              }
              var changed = (position !== tmpSlideIndex);
              //console.log(offset, startOffset, slideOffset);
              /* reset slide position if same slide (watch not triggered) */
              if (!changed) {
                scope.$apply(function() {
                  updateSlidePosition();
                });
              } else {
                scope.$apply(function() {
                  if (angular.isDefined(iAttrs.rnCarouselCycle)) {
                    // force slide move even if invalid position for cycle carousels
                    scope.carouselCollection.position = tmpSlideIndex;
                    updateSlidePosition();
                  }
                  scope.carouselCollection.goTo(tmpSlideIndex, true);
                });
              }
            }
            swiping = 0;
        }
        function isInsideCarousel(coords) {
          // check coords are inside the carousel area
          // we always compute the container dimensions in case user have scrolled the page
          var containerRect = container[0].getBoundingClientRect();

          var isInside = (coords.x > containerRect.left && coords.x < (containerRect.left + containerWidth) &&
                  (coords.y > containerRect.top && coords.y < containerRect.top + containerRect.height));

          // console.log('isInsideCarousel', {
          //   containerLeft: containerRect.left,
          //   containerTop: containerRect.top,
          //   containerHeight: containerRect.height,
          //   isInside: isInside,
          //   x: coords.x,
          //   y: coords.y
          // });
          return isInside;
        }
        function documentMouseUpEvent(event) {
          swipeEnd({
            x: event.clientX,
            y: event.clientY
          });
        }
        // move throttling
        var lastMove = null,
            // todo: requestAnimationFrame instead
            moveDelay = ($window.jasmine || $window.navigator.platform=='iPad')?0:50;

        $swipe.bind(carousel, {
          /* use angular $swipe service */
          start: function(coords) {
           // console.log('$swipe start');
            /* capture initial event position */
            if (swiping === 0) {
              swiping = 1;
              startX = coords.x;
            }
            $document.bind('mouseup', documentMouseUpEvent);
          },
          move: function (coords) {
            // cancel movement if not inside
            if (!isInsideCarousel(coords)) {
             // console.log('force end');
              swipeEnd(coords);
              return;
            }
            //console.log('$swipe move');
            if (swiping===0) return;
            var deltaX = coords.x - startX;
            if (swiping === 1 && deltaX !== 0) {
              swiping = 2;
              startOffset = offset;
            }
            else if (swiping === 2) {
              var now = (new Date()).getTime();
              if (lastMove && (now-lastMove) < moveDelay) return;
              lastMove = now;
              var lastIndex = scope.carouselCollection.getLastIndex(),
                  position = scope.carouselCollection.position;
              /* ratio is used for the 'rubber band' effect */
              var ratio = 1;
              if ((position === 0 && coords.x > startX) || (position === lastIndex && coords.x < startX))
                ratio = 3;
              /* follow cursor movement */
              offset = startOffset + deltaX / ratio;
              carousel.css(translateSlideProperty(offset, true))
                      .removeClass('rn-carousel-animate')
                      .addClass('rn-carousel-noanimate');
            }
          },
          end: function (coords) {
            //console.log('$swipe end');
            swipeEnd(coords);
          }
        });
      //  if (containerWidth===0) updateContainerWidth();
      };
    }
  };
}]);
