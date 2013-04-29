# AngularJS Touch Carousel

This is a simple carousel implementation for AngularJS ng-repeats, optimised for mobile devices.

Demo : http://revolunet.github.io/angular-carousel

Comments and contributions welcome :)

Proudly brought to you by the [@revolunet](http://twitter.com/revolunet) team.

## Usage :

Add a dependency to `angular-carousel` module in your application.

Then, just add a `rn-carousel` attribute to your `<ul>` block and your `<li>`'s become magically swipable ;)

```html
<h3>Discover sports</h3>
<ul data-rn-carousel class="image">
  <li ng-repeat="image in sportImages" style="background-image:url({{ image }});">
    <div class="layer">{{ image }}</div>
  </li>
</ul>
```

Of course, include `angular-carousel.js` and `angular-carousel.css` in your project.

## Features :

 - Mobile friendly, tested on webkit+firefox
 - CSS 3D trasnformations with GPU accel
 - `rn-carousel-index` two way binding to control the carousel position, see demo page.
 - `rn-carousel-indicator='true'` to turn on the indicator, see demo page.

## Todo :
 - ~~Grunt build~~
 - moar tests :)
 - perfs improvements
 - ~~cancel swipe if too short~~
 - ~~indicator~~
 - ~~index two way binding~~
 - optional auto-slide
 - buffer slides (3) to reduce DOM size and allow dynamic add/remove of slides (inifinite scroll)

## Inspirations
 - https://github.com/ajoslin/angular-mobile-nav
 - http://mobile.smashingmagazine.com/2012/06/21/play-with-hardware-accelerated-css/
 - Thanks @ganarajpr @bennadel and angular folks for all the tips :)

## Licence
As AngularJS itself, this module is released under the permissive [MIT license](http://revolunet.mit-license.org). Your contributions are always welcome.
