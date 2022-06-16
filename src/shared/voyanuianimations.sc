.flash
	filename="voyanuianimations.swf"
	version=8
	fps=25
	bbox=760x389
	background=#FFFFFF
	compress

	.font TradeMarkerLight "fonts/trademarker_light.ttf"

	.swf icon_ep1 "icons/ep1.swf"
	.swf icon_ep2 "icons/ep2.swf"
	.swf icon_ep3 "icons/ep3.swf"
	.swf icon_ep4 "icons/ep4.swf"
	.swf icon_ep5 "icons/ep5.swf"
	.swf icon_ep6 "icons/ep6.swf"

	.box menu_background width=760 height=389 line=0 fill=#1E1E1E
	.box button_shape width=87 height=205 line=0 fill=#1E1E1E
	.box button_cover width=87 height=205 line=0 fill=#FFFFFF1E

	.sprite button_ep1_idle
		.put button_shape pin=center
		.put icon_ep1 pin=center
	.end

	.sprite button_ep2_idle
		.put button_shape pin=center
		.put icon_ep2 pin=center
	.end

	.sprite button_ep3_idle
		.put button_shape pin=center
		.put icon_ep3 pin=center
	.end

	.sprite button_ep4_idle
		.put button_shape pin=center
		.put icon_ep4 pin=center
	.end

	.sprite button_ep5_idle
		.put button_shape pin=center
		.put icon_ep5 pin=center
	.end

	.sprite button_ep6_idle
		.put button_shape pin=center
		.put icon_ep6 pin=center
	.end

	.sprite button_ep1_hover
		.put button_shape pin=center
		.put icon_ep1 pin=center
		.put button_cover pin=center
	.end

	.sprite button_ep2_hover
		.put button_shape pin=center
		.put icon_ep2 pin=center
		.put button_cover pin=center
	.end

	.sprite button_ep3_hover
		.put button_shape pin=center
		.put icon_ep3 pin=center
		.put button_cover pin=center
	.end

	.sprite button_ep4_hover
		.put button_shape pin=center
		.put icon_ep4 pin=center
		.put button_cover pin=center
	.end

	.sprite button_ep5_hover
		.put button_shape pin=center
		.put icon_ep5 pin=center
		.put button_cover pin=center
	.end

	.sprite button_ep6_hover
		.put button_shape pin=center
		.put icon_ep6 pin=center
		.put button_cover pin=center
	.end

	.button button_ep1
		.show button_shape pin=center as=area
		.show button_ep1_idle as=idle
		.show button_ep1_hover as=hover,pressed
	.end

	.button button_ep2
		.show button_shape pin=center as=area
		.show button_ep2_idle as=idle
		.show button_ep2_hover as=hover,pressed
	.end

	.button button_ep3
		.show button_shape pin=center as=area
		.show button_ep3_idle as=idle
		.show button_ep3_hover as=hover,pressed
	.end

	.button button_ep4
		.show button_shape pin=center as=area
		.show button_ep4_idle as=idle
		.show button_ep4_hover as=hover,pressed
	.end

	.button button_ep5
		.show button_shape pin=center as=area
		.show button_ep5_idle as=idle
		.show button_ep5_hover as=hover,pressed
	.end

	.button button_ep6
		.show button_shape pin=center as=area
		.show button_ep6_idle as=idle
		.show button_ep6_hover as=hover,pressed
	.end

	.text menu_title font=TradeMarkerLight size=40pt color=#FFFFFF text="Voya Nui Animations"

	.sprite menu
		.put menu_background
		.put menu_title pin=center x=380 y=68
		.put button_ep1 x=77.5  y=242.5
		.put button_ep2 x=198.5 y=242.5
		.put button_ep3 x=319.5 y=242.5
		.put button_ep4 x=440.5 y=242.5
		.put button_ep5 x=561.5 y=242.5
		.put button_ep6 x=682.5 y=242.5
	.end

	.put menu

	.action:
		Array(function() {
			// Reset globals so they do not persist between the episodes.
			var globals = [];
			for (var p in _global) {
				globals.push(p);
			}
			while (globals.length) {
				delete _global[globals.pop()];
			}

			// Must load the episodes into level 0 or they do not work.
			var switchTo = function(url, end) {
				endSequence = end;
				loadMovie(url, "_level0");
			};

			// Fix hiding menu issue and inject code into the episodes.
			// All episodes set showMenu early on so perfect injection point.
			var emptyMenu = new ContextMenu();
			emptyMenu.hideBuiltInItems();
			var endSequence = null;
			var paddingFrames = 0;
			var checkPlayAgain = function() {
				var seq = (
					endSequence &&
					_root.main_mc &&
					_root.main_mc[endSequence]
				);
				var hasPlayAgain = false;
				if (seq) {
					for (var p in seq) {
						if (seq[p] && seq[p]["btnPlayAgain"]) {
							hasPlayAgain = true;
							break;
						}
					}
				}

				// Return to menu if on end screen for X frames.
				if (hasPlayAgain) {
					if (paddingFrames-- < 1) {
						switchTo("voyanuianimations.swf", null);
					}
				}
				else {
					// Reset frame count if not on end screen.
					paddingFrames = 250; // 25 * 10
				}
			};
			Stage.addProperty(
				"showMenu",
				function() {
					return _root.menu != emptyMenu;
				},
				function(value) {
					// Using showMenu removes menu bar from a projector leaving overflow.
					// Using empty menu does same thing but keeps the projector menu bar.
					_root.menu = value ? null : emptyMenu;

					// Nothing uses root onEnterFrame so we can use it to hook into.
					_root.onEnterFrame = function() {
						checkPlayAgain();
					};
				}
			);

			// The menu episode buttons.
			menu.button_ep1.onRelease = function() {
				switchTo("ep1/preload.swf?assetsPath=ep1/&xmlPath=ep1/&lang=en", "sequence6");
			};
			menu.button_ep2.onRelease = function() {
				switchTo("ep2/preload.swf?assetsPath=ep2/&xmlPath=ep2/&lang=en", "sequence6");
			};
			menu.button_ep3.onRelease = function() {
				switchTo("ep3/preload.swf?assetsPath=ep3/&xmlPath=ep3/&lang=en", "sequence5");
			};
			menu.button_ep4.onRelease = function() {
				switchTo("ep4/preload.swf?assetsPath=ep4/&xmlPath=ep4/&lang=en", "sequence5");
			};
			menu.button_ep5.onRelease = function() {
				switchTo("ep5/preload.swf?assetsPath=ep5/&xmlPath=ep5/&lang=en", "sequence6");
			};
			menu.button_ep6.onRelease = function() {
				switchTo("ep6/preload.swf?assetsPath=ep6/&xmlPath=ep6/&lang=en", "sequence4");
			};
		})[0]();
	.end
.end
