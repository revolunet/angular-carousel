/*global angular, console */

/*
Angular touch carousel with CSS GPU accel and slide buffering
http://github.com/revolunet/angular-carousel

TODO : 
 - OK cycle + index
 - OK cycle without buffer
 - activeIndex : removed
 - prev/next cbs
 - OK skip initial animation
 - add/remove ngRepeat collection
 - OK transitionCb bug
 - cycle + no initial index ? (is -1)
 - cycle + indicator
 - OK ngRepeat collections
*/

angular.module('angular-carousel', ['ngMobile']);
