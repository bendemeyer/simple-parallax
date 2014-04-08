(function ($) {
   
    $.fn.simpleParallax = function (arg) {
        $.fn.simpleParallax.count = $.fn.simpleParallax.count ? $.fn.simpleParallax.count + 1 : 1;
        var _this = this;
		
		
		// Easings based on jQuery UI implementation
		// http://api.jqueryui.com/easings/
		
		var easings = {};
		var baseEasings = {};

		$.each( [ "Quad", "Cubic", "Quart", "Quint", "Expo" ], function( i, name ) {
			baseEasings[ name ] = function( p ) {
				return Math.pow( p, i + 2 );
			};
		});

		$.extend( baseEasings, {
			Sine: function ( p ) {
				return 1 - Math.cos( p * Math.PI / 2 );
			},
			Circ: function ( p ) {
				return 1 - Math.sqrt( 1 - p * p );
			},
			Elastic: function( p ) {
				return p === 0 || p === 1 ? p :
					-Math.pow( 2, 8 * (p - 1) ) * Math.sin( ( (p - 1) * 80 - 7.5 ) * Math.PI / 15 );
			},
			Back: function( p ) {
				return p * p * ( 3 * p - 2 );
			},
			Bounce: function ( p ) {
				var pow2,
					bounce = 4;

				while ( p < ( ( pow2 = Math.pow( 2, --bounce ) ) - 1 ) / 11 ) {}
				return 1 / Math.pow( 4, 3 - bounce ) - 7.5625 * Math.pow( ( pow2 * 3 - 2 ) / 22 - p, 2 );
			}
		});

		$.each( baseEasings, function( name, easeIn ) {
			easings[ "easeIn" + name ] = easeIn;
			easings[ "easeOut" + name ] = function( p ) {
				return 1 - easeIn( 1 - p );
			};
			easings[ "easeInOut" + name ] = function( p ) {
				return p < 0.5 ?
					easeIn( p * 2 ) / 2 :
					1 - easeIn( p * -2 + 2 ) / 2;
			};
		});
		
		easings['linear'] = function (p) {
			return p;
		}
		
		for (var key in easings) {
			(function () {
				var k = key;
				var newKey = 'inverse' + k.charAt(0).toUpperCase() + k.substring(1);
				var func = easings[k];
				easings[newKey] = function (percent) {
					return 1 - func(percent);
				}
			})();
		}
		
        $.each(arguments, function(index, value) {
            var arg = value;
			var switchOnly = false;
			
			if (typeof(arg.easing) != 'function') {
				arg.easing = arg.easing || 'linear';
				arg.easing = easings[arg.easing] || easings['linear'];
			}
			
			if (arg.end) {
				var delta = arg.end - arg.start;
				var strings = arg.cssStart.match(/([A-Z]|[a-z]|\s|\(|\)|\[|\]|\{|\}|\,|\%|\-(?!(\d|\.(?=\d)))|(\.(?!\d)))+/g);
				var starts = arg.cssStart.match(/\-?\.?\d+(\.\d+)?/g);
				var ends = arg.cssEnd.match(/\-?\.?\d+(\.\d+)?/g);
				var deltas = [];
				var numsFirst = /^(\d|\.(?=\d)|\-(?=\d))/.test(arg.cssStart);
				
				for (var j = 0; j < starts.length; j++) {
					starts[j] = parseFloat(starts[j]);
					ends[j] = parseFloat(ends[j]);
					deltas[j] = ends[j] - starts[j];
				}
			} else {
				arg.end = arg.start;
				switchOnly = true;
			}
            
			var currPos = 0;
			
            $(window).on('scroll.simpleParallax:' + $.fn.simpleParallax.count, function () {
                var newPos = $(window).scrollTop();
				var inc = 0;
				if (newPos != currPos) {
					inc = newPos > currPos ? 1 : -1;
				}
				while (currPos != newPos) {
					currPos += inc;
					applyParallax(currPos, inc == 1);
				}
            });
			
			function applyParallax(position, inc) {
                if (position >= arg.start && position <= arg.end) {
					var rule = '';
					if (!switchOnly) {
						var percent = (position - arg.start) / delta;
						var finals = [];
						for (var k = 0; k < deltas.length; k++) {
							arg.round = arg.round ? arg.round : 0;
							if (typeof(arg.round) == 'function') {
								finals[k] = arg.round((arg.easing(percent) * deltas[k]) + starts[k]);
							} else {
								var raw = (arg.easing(percent) * deltas[k]) + starts[k];
								finals[k] = Math.round(raw * Math.pow(10, arg.round)) / Math.pow(10, arg.round);
							}
						}
						var first, second;
						if (numsFirst) {
							first = finals;
							second = strings;
						} else {
							first = strings;
							second = finals;
						}
						for (var o = 0; o < first.length; o++) {
							rule += first[o];
							rule += second && o < second.length ? second[o] : '';
						}
					} else {
						rule = inc ? arg.cssEnd : arg.cssStart;
					}
                    _this.css(arg.cssProp, rule);
                }
			};
        });
        
        _this.destroyParallax = function () {
            $(window).off('scroll.simpleParallax:' + $.fn.simpleParallax.count);
        };
		
		_this.triggerParallax = function (pos) {
			$(window).trigger('scroll.simpleParallax:' + $.fn.simpleParallax.count);
		};
        
        return this;
    };
})(jQuery);
