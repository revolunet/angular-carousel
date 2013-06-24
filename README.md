# AngularJS Touch Carousel

A carousel implementation for AngularJS ng-repeats, optimised for mobile devices.

Demo : http://revolunet.github.io/angular-carousel

Comments and contributions welcome :)

Proudly brought to you by the [@revolunet](http://twitter.com/revolunet) team.

## Usage :

 1. Add `angular-carousel.js` and `angular-mobile.js` (from this repo) to your code.

```html
<link href="lib/angular-carousel.css" rel="stylesheet" type="text/css" />
<script src="lib/angular.js"></script>
<script src="lib/angular-mobile.js"></script>
<script src="lib/angular-carousel.js"></script>
```
 2. Add a dependency to `angular-carousel` module in your application.

```js
angular.module('MyApp', ['angular-carousel']);
```

 3. Add a `rn-carousel` attribute to your `<ul>` block and your `<li>`'s become magically swipable ;)

```html
<h3>Discover sports</h3>
<ul rn-carousel class="image">
  <li ng-repeat="image in sportImages" style="background-image:url({{ image }});">
    <div class="layer">{{ image }}</div>
  </li>
</ul>
```

## Features :

 - Mobile friendly, tested on webkit+firefox
 - CSS 3D transformations with GPU accel
 - `rn-carousel-index` two way binding to control the carousel position, see demo page.
 - `rn-carousel-indicator` to turn on the indicator, see demo page.
 - `rn-carousel-buffered` to buffer the carousel, good if you have many or unlimited items inside.
 - `rn-carousel-cycle` to have an forever-cycling carousel.
 - `rn-carousel-next="getNextSlide(item)"` : callback called when carousel reach the last slide, that should return a single slide. great for generating slides on-demand.
 - `rn-carousel-prev="getPrevSlide(item)"` : callback called when carousel reach the first slide, that should return a single slide. great for generating slides on-demand.


## Todo :
 - moar tests :)
 - perfs improvements
 - optional auto-slide
 - buffering : allow buffer size tuning (default=3 slides)
 - buffering : add intelligent indicators

## Inspirations
 - https://github.com/ajoslin/angular-mobile-nav
 - http://mobile.smashingmagazine.com/2012/06/21/play-with-hardware-accelerated-css/
 - Thanks @ganarajpr @bennadel and angular folks for all the tips :)

## Licence
As AngularJS itself, this module is released under the permissive [MIT license](http://revolunet.mit-license.org). Your contributions are always welcome.
