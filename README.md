# AngularJS Touch Carousel

An AngularJS carousel implementation optimised for mobile devices.

Demo : http://revolunet.github.io/angular-carousel

Comments and contributions welcome :)

Proudly brought to you by the [@revolunet](http://twitter.com/revolunet) team.

**NOTE :** if you use IE<=9, iOS<7 or Android<4 please include the [requestAnimationFrame polyfill](https://github.com/darius/requestAnimationFrame/blob/master/requestAnimationFrame.js) in your application.

## Usage :

 - If you use bower, just `bower install angular-carousel`. If not, download files [from the github repo](./dist)
 - Add `angular-touch.js`, `angular-carousel.css`, and `angular-carousel.js` to your code:
```html
<link href="angular-carousel.css" rel="stylesheet" type="text/css" />
<script src="angular.js"></script>
<script src="angular-touch.js"></script>
<script src="angular-carousel.js"></script>
```
 - Add a dependency to the `angular-carousel` module in your application.
```js
angular.module('MyApp', ['angular-carousel']);
```

 - Add a `rn-carousel` attribute to your `<ul>` block and your `<li>`'s become magically swipable ;)
```html
<ul rn-carousel class="image">
  <li ng-repeat="image in sportImages" ng-style="{ backgroundImage: 'url(' + image + ')' }">
    <div class="layer">{{ image }}</div>
  </li>
</ul>
```

 - You can also use `rn-carousel` without ng-repeat ;)
```html
<ul rn-carousel class="image">
  <li>slide #1</li>
  <li>slide #2</li>
  <li>slide #3</li>
</ul>
```



## Features :
 - Mobile friendly, tested on webkit+firefox
 - Use CSS 3D transformations and `requestAnimationFrame`. (fallback to CSS 2D if 3D support not available)
 - DOM buffering
 - Index data-binding
 - Optional indicators

### Regular carousel :
 - `rn-carousel-index` two way binding to control the carousel position.
 - `rn-carousel-indicator` boolean value to enable the indicator, see demo page.
 - `rn-carousel-buffered` boolean value to enable the carousel buffering, good to minimize the DOM, defaults to 5 slides. (works only with arrays)
 - `rn-carousel-swipe` boolean value to enable/disable swiping (default true)
 - `rn-carousel-control` boolean value to enable builtin prev/next buttons (you can override by CSS)
 - `rn-carousel-auto-slide` integer value will make the slider automatically change the visible slide after given seconds
 - `rn-carousel-pause-on-hover="true"` prevent auto-slide on hover
 - `rn-carousel-prevent-animation="true"` if you dont want animations

## Todo :
 - see the [TODO file](./TODO)

## Contributing 
 - Please follow [AngularJS GIT conventions](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit#)
 - Please add tests
 - Please update the README and demo (index.html)

## Inspirations
 - https://github.com/ajoslin/angular-mobile-nav
 - http://mobile.smashingmagazine.com/2012/06/21/play-with-hardware-accelerated-css/
 - http://ariya.ofilabs.com/2013/08/javascript-kinetic-scrolling-part-1.html
 - Thanks to all angular folks for all the tips :)

## License
As AngularJS itself, this module is released under the permissive [MIT license](http://revolunet.mit-license.org). Your contributions are always welcome.
