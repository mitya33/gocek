gocek = ({

	/* ---
	| MAIN
	--- */

	init() {

		//elements container - collect any starting elements
		this.els = Array.from(document.querySelectorAll('*:not(img).lazy, img.lazy[data-src]:not(.viewed)')).map(el => this.register_el(el, 1));

		//custom events conatiner
		this.evts = {};

		//on scroll end (on window), handle any elements that come into view. For imgs, load them...
		addEventListener('scroll', () => {
			clearTimeout(this.scroll_timeout);
			this.scroll_timeout = setTimeout(() => {
				this.els.forEach(el => {

					let
					old_state = el.getAttribute('data-gocek-state'),
					new_state = this.is_visible(el, el.matches('.completely')) ? 'visible' : 'hidden';

					//...state - if old state same as new state, ignore
					if (old_state == new_state) return;
					el.setAttribute('data-gocek-state', new_state);

					//...if visible and unloaded image, load now
					if (new_state == 'visible' && el.matches('img:not(.viewed)')) {
						el.src = el.dataset.src;
						el.classList.add('viewed');
						el.classList.remove('loading');
					}

					//...any callbacks registered on this element?
					let cb = el['gocek_on_'+new_state+'_cb'];
					if (cb) cb('gocek_'+new_state, el);
					if (el['gocek_on_'+new_state+'_once']) delete cb;

				});
			}, 250);
		});
		window.dispatchEvent(new CustomEvent('scroll'));

		//return API
		return this;

	},

	/* ---
	| ON... - register event to fire when element(s) become(s) scrolls into or out of view. Args:
	|	@on (str) 		- which event, either 'visible' or 'hidden'
	|	@el (str; obj) 	- a selector or element reference representing the element to listen for
	|	@func (func)	- the callback function
	|	@once (bool)	- if true, runs only once for given event type, not each time
	--- */

	on(on, el, func, once) {
		if (typeof el == 'string') el = document.querySelector(el);
		else if (!(el instanceof HTMLElement)) return;
		el['gocek_on_'+on+'_cb'] = func;
		if (once) el['gocek_on_'+on+'_once'] = 1;
	},

	/* ---
	| IS VISIBLE - return whether an element is currently visible - partially or fully. Used internally but available
	| on API too. Args:
	|	@el (str; obj) 		- (see ::on())
	|	@completely (bool)	- if true, returns true only if completely visible, not partially
	--- */

	is_visible(el, completely) {

	    let
		scrollTop = window.pageYOffset,
		winHeight = window.innerHeight,
		elTop = el.offsetTop,
	    elBottom = el.offsetTop + el.offsetHeight;

	    if (!completely)
	    	return elBottom > scrollTop && elTop < scrollTop + winHeight;
	    else
	    	return elTop > scrollTop && elBottom < scrollTop + winHeight;
	    	
	},

	/* ---
	| REGISTER ELEMENT(S) - alternate, programmatic way to register element(s) with Gocek (other way is via HTML attributes). Args:
	|	@els (obj; arr) - reference to element, or array of elements
	--- */

	register_el(els, internal) {
		els = els instanceof Array ? els : [els];
		for (let i=0; i<els.length; i++) {
			if (els[i].tagName == 'IMG') els[i].classList.add('loading');
			if (internal)
				return els[i]; //<-- no problem returning from loop; for internal use, only ever one element passed at a time
			else
				this.els.push(els[i]);
		}
	},

}).init();