/*global angular */

/*
Angular touch carousel with CSS GPU accel and slide buffering/cycling
http://github.com/revolunet/angular-carousel

TODO :
 - skip initial animation
 - add/remove ngRepeat collection
 - prev/next cbs
 - cycle + no initial index ? (is -1 and has bug)
 - cycle + indicator
*/

angular.module('angular-carousel', ['ngTouch']).config(['$provide', function($provide) {
  $provide.decorator('$rootScope', ['$delegate', function($delegate) {
    $delegate.safeApply = function(fn) {
      var phase = $delegate.$$phase;
      if (phase === "$apply" || phase === "$digest") {
        if (fn && typeof fn === 'function') {
          fn();
        }
      } else {
        $delegate.$apply(fn);
      }
    };

    return $delegate;
  }]);
}]);
