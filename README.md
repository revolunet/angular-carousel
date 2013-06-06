# AngularJS Touch Carousel

This is a simple carousel implementation for AngularJS ng-repeats, optimised for mobile devices.

Demo : http://revolunet.github.io/angular-carousel and making of article  : http://blog.revolunet.com/blog/2013/05/02/angular-carousel-making-of/

Comments and contributions welcome :)

Proudly brought to you by the [@revolunet](http://twitter.com/revolunet) team.

## Usage :

Add a dependency to `angular-carousel` module in your application.

Then, just add a `rn-carousel` attribute to your `<ul>` block and your `<li>`'s become magically swipable ;)

```html
<h3>Discover sports</h3>
<ul rn-carousel class="image">
  <li ng-repeat="image in sportImages" style="background-image:url({{ image }});">
    <div class="layer">{{ image }}</div>
  </li>
</ul>
```

Of course, include `angular-carousel.js` and `angular-carousel.css` in your project.

## Features :

 - Mobile friendly, tested on webkit+firefox
 - CSS 3D transformations with GPU accel
 - `rn-carousel-index` two way binding to control the carousel position, see demo page.
 - `rn-carousel-indicator` to turn on the indicator, see demo page.
 - `rn-carousel-buffered` to buffer the carousel, good if you have many or unlimited items inside.
 - `rn-carousel-next="addSlides(index, item)"` : callback called when carousel reach the penultimate slide. you can then return one or more elements if needed.
 - `rn-carousel-prev="addSlides(index, item)"` : callback called when carousel reach the second slide. you can then return one or more elements if needed.

## Scope properties :

 - The carousel adds some useful properties to the `ngRepeat` scope :
     - `activeIndex` : the current active index. useful to detect which slide is active in your `ng-repeat`.

## Todo :
 - moar tests :)
 - perfs improvements
 - optional auto-slide
 - optional auto-infinite (restart at 0 at the end)
 - buffering : allow buffer size tuning (default=3 slides)
 - buffering : add intelligent indicators

## Inspirations
 - https://github.com/ajoslin/angular-mobile-nav
 - http://mobile.smashingmagazine.com/2012/06/21/play-with-hardware-accelerated-css/
 - Thanks @ganarajpr @bennadel and angular folks for all the tips :)

## Licence
As AngularJS itself, this module is released under the permissive [MIT license](http://revolunet.mit-license.org). Your contributions are always welcome.
