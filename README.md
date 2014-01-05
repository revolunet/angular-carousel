# AngularJS Touch Carousel

An AngularJS carousel implementation optimised for mobile devices.

Demo : http://revolunet.github.io/angular-carousel

Comments and contributions welcome :)

Proudly brought to you by the [@revolunet](http://twitter.com/revolunet) team.

## Usage :

 1. If you use bower, just `bower install angular-carousel`.
 2. If not, add `angular-carousel.css`, `angular-carousel.js` to your code:
```html
<link href="lib/angular-carousel.css" rel="stylesheet" type="text/css" />
<script src="lib/angular.js"></script>
<script src="lib/angular-mobile.js"></script>
<script src="lib/angular-carousel.js"></script>
```

 2. Add a dependency to the `angular-carousel` module in your application.
```js
angular.module('MyApp', ['angular-carousel']);
```

 3. Add a `rn-carousel` attribute to your `<ul>` block and your `<li>`'s become magically swipable ;)
```html
<ul rn-carousel class="image">
  <li ng-repeat="image in sportImages" style="background-image:url({{ image }});">
    <div class="layer">{{ image }}</div>
  </li>
</ul>
```
 4. You can also use `rn-carousel` without ng-repeat ;)
```html
<ul rn-carousel class="image">
  <li>slide #1</li>
  <li>slide #2</li>
  <li>slide #3</li>
</ul>
```

## Features :
 - Mobile friendly, tested on webkit+firefox
 - CSS 3D transformations with GPU accel
 - DOM buffering
 - index data-binding

### Regular carousel :
 - `rn-carousel-index` two way binding to control the carousel position.
 - `rn-carousel-indicator` to turn on the indicator, see demo page.
 - `rn-carousel-buffered` to buffer the carousel, good to minimize the DOM. (works only with arrays)

## Todo :
 - see the [TODO file](./TODO)

## Inspirations
 - https://github.com/ajoslin/angular-mobile-nav
 - http://mobile.smashingmagazine.com/2012/06/21/play-with-hardware-accelerated-css/
 - http://ariya.ofilabs.com/2013/08/javascript-kinetic-scrolling-part-1.html
 - Thanks to all angular folks for all the tips :)

## Licence
As AngularJS itself, this module is released under the permissive [MIT license](http://revolunet.mit-license.org). Your contributions are always welcome.
