# AngularJS Touch Carousel

This is a simple carousel implementation for AngularJS ng-repeats.

For best performances on mobile devices, it uses CSS 3D transforms (GPU accel).

It handles click and touch events.

Demo : http://revolunet.github.io/angular-carousel

Proudly brought to you by the [@revolunet](http://twitter.com/revolunet) team.

## Usage :

Add a dependency to `angular-carousel` module in your application.

Then, just add a `carousel` attribute to your `<ul>` block and your `<li>`'s become swipable ;)

```html
<h3>Discover sports</h3>
<ul carousel class="image">
  <li ng-repeat="image in sportImages" style="background-image:url({{ image }});">
    <div class="layer">{{ image }}</div>
  </li>
</ul>
```

Of course, include `angular-carousel.js` and `angular-carousel.css` in your project.

## Todo :
 - Grunt build
 - Tests :)
 - cancel swipe if too short
 - indicator
 - buffer slides (3) to reduce DOM size and allow dynamic add/remove of slides (inifinite scroll)

## Inspirations
 - https://github.com/ajoslin/angular-mobile-nav
 - http://mobile.smashingmagazine.com/2012/06/21/play-with-hardware-accelerated-css/
 - Thanks @ganarajpr for support

## Licence
As AngularJS itself, this module is released under the permissive [MIT license](http://revolunet.mit-license.org). Your contributions are always welcome.
