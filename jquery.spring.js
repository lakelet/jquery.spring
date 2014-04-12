/**
 * Copyright (C) 2014 LAKELET ELECTRONICS LIMITED
 *
 * Released under the MIT license - http://opensource.org/licenses/MIT
 */

(function ($) {
"use strict";
  var spring = $.spring = function ($item, $range, $bound, width) {
    var self = this;

    var bw = self.boxWidth($item);

    $item.data({'w': bw, 'x': false}).width(typeof width === 'undefined' ? bw : width);

    var w = self.springWidth($item, $range, $bound);
    w = w < 0 ? 0 : w;

    if (w < $item.data('w')) {
      $item.data('w', w);
    }

    self.shrink($item);

    $range.mouseenter(function (event) {
      if ($(document.elementFromPoint(event.clientX, event.clientY)).has($item).length == 0) {
        return true;
      }

      self.stretch($item, $range, $bound);
    });

    $('body').click(function (event) {
      if ($range.has(document.elementFromPoint(event.clientX, event.clientY)).length > 0) {
        return;
      }

      self.shrink($item);
    });
  };

  spring.prototype.hmbp = function ($item, property) {
    $item.css(property, 0);
    var hmbp = $item.outerWidth(true) - $item.width();
    $item.css(property, '');
    return $item.outerWidth(true) - $item.width() - hmbp;
  };

  spring.prototype.outerOffset = function ($item) {
    var outerOffset = {top: null, left: null};
    var offset = $item.offset();

    outerOffset.top = offset.top - this.hmbp($item, 'margin-top');
    outerOffset.left = offset.left - this.hmbp($item, 'margin-left');

    return outerOffset;
  };

  spring.prototype.innerOffset = function ($item) {
    var innerOffset = {top: null, left: null};
    var offset = $item.offset();

    innerOffset.top = offset.top + this.hmbp($item, 'border-top-width') + this.hmbp($item, 'padding-top');
    innerOffset.left = offset.left + this.hmbp($item, 'border-left-width') + this.hmbp($item, 'padding-left');

    return innerOffset;
  };

  spring.prototype.innerOffbox = function ($item) {
    var innerOffbox = {bottom: null, right: null};
    var offset = $item.offset();

    innerOffbox.bottom = offset.top + $item.outerHeight() - this.hmbp($item, 'border-bottom-width') - this.hmbp($item, 'padding-bottom');
    innerOffbox.right = offset.left + $item.outerWidth() - this.hmbp($item, 'border-right-width') - this.hmbp($item, 'padding-right');

    return innerOffbox;
  };

  spring.prototype.boxWidth = function ($item) {
    var w = $item.outerWidth();

    $.each(['-moz-box-sizing', '-webkit-box-sizing', 'box-sizing'], function(index, value) {
      switch ($item.css(value)) {
        case 'padding-box':
          w = $item.outerWidth() - hmbp($item, 'border-left-width') - hmbp($item, 'border-right-width');
          return false;
        case 'content-box':
          w = $item.width();
          return false;
      }
    });

    return w;
  };

  spring.prototype.springWidth = function ($item, $range, $bound, shear, coin) {
    shear = typeof shear === 'undefined' ? 1 : shear;
    coin = typeof coin === 'undefined' ? false : coin;

    var self = this;
    var il = self.innerOffset($bound).left;
    var ir = self.innerOffbox($bound).right;

    var offseta = self.outerOffset($item);
    var xla = offseta.left;
    var yta = offseta.top;
    var wa = $item.outerWidth(true);
    var xra = xla + wa;
    var yba = yta + $item.outerHeight(true);
    var xca = xla + wa / 2;

    $range.find('*').filter(':visible').each(function() {
      var $this = $(this);

      var offsetb = self.outerOffset($this);
      var xlb = offsetb.left;
      var ytb = offsetb.top;
      var wb = $this.outerWidth(true);
      var xrb = xlb + wb;
      var ybb = ytb + $this.outerHeight(true);
      var xcb = xlb + wb / 2;

      if ($this.has($item).length > 0) {
        var ixlb = self.innerOffset($this).left;
        var ixrb = self.innerOffbox($this).right;

        if (ixlb > xlb && ixlb > il) {
          il = ixlb;
        }

        if (ixrb < xrb && ixrb < ir) {
          ir = ixrb;
        }

        return;
      }

      if (this === $item.get(0)) {
        return true;
      }

      if (ybb <= yta || ytb >= yba) {
        return true;
      }

      if (xcb < xca) {
        il = xrb > il ? xrb : il;
      }
      else if (xcb > xca) {
        ir = xlb < ir ? xlb : ir;
      }
      else {
        if (coin) {
          ir = xlb < ir ? xlb : ir;
        }
        else {
          il = xrb > il ? xrb : il;
        }
      }
    });

    return ir - il - shear - wa + self.boxWidth($item);
  };

  spring.prototype.stretch = function ($item, $range, $bound) {
    if ($item.data('x')) {
      return;
    }

    $item.data('x', true);

    var w = this.springWidth($item, $range, $bound);
    w = w < 0 ? 0 : w;

    if (w > $item.data('w')) {
      $item.focus().animate({'width': w}, 'fast');
    }
  };

  spring.prototype.shrink = function ($item) {
    $item.data('x', true);

    $item.animate({'width': $item.data('w')}, 'fast', function () {
      $item.data('x', false);
    });
  };
})(jQuery);
