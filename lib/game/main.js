ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',

	'plugins.twopointfive.game',	
	
	'plugins.touch-button',
	'plugins.touch-field',
	'plugins.gamepad',

	'game.levels.base1',
	'game.entities.enemy-blob',

	'game.entities.grenade-pickup',
	'game.entities.health-pickup',


	'game.title',
	'game.hud', 
	'game.menu', 
	'game.menu-pause'  // <-- Ajoute cette ligne ici !

	// ,'plugins.twopointfive.debug'
)
.defines(function(){ "use strict";
	
	var MyGame = tpf.Game.extend({
		sectorSize: 4,
		
		hud: null,
		dead: false,
		menu: null,
		
		touchButtons: null,
		touchFieldMove: null,
		touchFieldTurn: null,

		gravity: 4,

		blobSpawnWaitInitial: 2,
		blobSpawnWaitCurrent: 2,
		blobSpawnWaitDiv: 1.01,
		blobKillCount: 0,
		blobSpawnTimer: null,

		powerupSpawnWait: 8,
		powerupSpawnTimer: null,

        musicAmbient1: new ig.Sound('media/music/jungle-ish-beat-for-video-games.mp3',false),
        musicAmbient2: new ig.Sound('media/music/song-for-creditstitlewhatever-you-want-for-a-video-game.mp3',false),
        musicAmbient3: new ig.Sound('media/music/video-game-boss-fight-music.mp3',false),

		init: function() {
			var as = new ig.AnimationSheet('media/tiles/basic-tiles-64.png',64,64);
			/*this.simonTiles = [
				new ig.Animation(as,0.08,[120, 121, 122, 123, 124, 125, 120],true), 
				new ig.Animation(as,0.08,[120, 121, 122, 123, 124, 125, 120],true), 
				new ig.Animation(as,0.08,[120, 121, 122, 123, 124, 125, 120],true), 
				new ig.Animation(as,0.08,[120, 121, 122, 123, 124, 125, 120],true)
				];*/
			this.backgroundAnims = {
				'media/tiles/basic-tiles-64.png': {
					14: new ig.Animation(as,0.2,[14, 48, 49, 50, 51, 50, 49]),
					20: new ig.Animation(as,0.15,[20, 60, 61, 20, 20]),
					28: new ig.Animation(as,0.4,[28, 58, 57, 58, 59])
					/*36: new ig.Animation(as,0.2,[36, 100, 101, 102, 103]),
					58: new ig.Animation(as,0.1,[58, 108, 58, 108, 108, 108])
					/*120: this.simonTiles[0],
					121: this.simonTiles[1],
					122: this.simonTiles[2],
					123: this.simonTiles[3]*/
				}
			};	
			// Setup HTML Checkboxes and mouse lock on click
			if( !ig.ua.mobile ) {
	/*			ig.$('#requestFullscreen').addEventListener('click', function( ev ) {
					ig.system.requestFullscreen();
					ev.preventDefault();
					this.blur();
					return false;
				},false);

				ig.$('#riftStereoMode').addEventListener('change', function( ev ) {
					ig.system.setStereoMode(ev.target.checked);
					ev.preventDefault();
					this.blur();
					return false;
				},false);

				if( ig.$('#riftStereoMode').checked ) {
					ig.system.setStereoMode(true);
				}*/

				ig.system.canvas.addEventListener('click', function(){
					ig.system.requestMouseLock();
				});
			}
			
			// Setup Controls
			ig.input.bind( ig.KEY.MOUSE1, 'click' );
			if( ig.ua.mobile ) { 
				this.setupTouchControls(); 
			}
			else { 
				this.setupDesktopControls(); 
			}

            ig.music.volume = 0.5;
            ig.music.add(this.musicAmbient1, 'ambient1');
            ig.music.add(this.musicAmbient2, 'ambient2');
            ig.music.add(this.musicAmbient3, 'ambient3');
            ig.music.loop = true;

			this.setTitle();
		},

		setTitle: function() {
			this.menu = new MyTitle();
		},

		setGame: function() {
			this.menu = null;
			this.dead = false;
			this.hud = new MyHud( 1280, 720 );

			this.blobKillCount = 0;
			this.blobSpawnWaitInitial = this.blobSpawnWaitInitial;
			this.blobSpawnTimer = new ig.Timer(this.blobSpawnWaitInitial);
			this.powerupSpawnTimer = new ig.Timer(this.powerupSpawnWait);

			// Load the last level we've been in or the default Base1
			this.loadLevel( this.lastLevel || LevelBase1 );
		},
		
		setupDesktopControls: function() {
			// Setup keyboard & mouse controls
			ig.input.bind( ig.KEY.UP_ARROW, 'forward' );
			ig.input.bind( ig.KEY.LEFT_ARROW, 'left' );
			ig.input.bind( ig.KEY.DOWN_ARROW, 'back' );
			ig.input.bind( ig.KEY.RIGHT_ARROW, 'right' );
			
			ig.input.bind( ig.KEY.C, 'shoot' );
			ig.input.bind( ig.KEY.ENTER, 'shoot' );
			ig.input.bind( ig.KEY.X, 'run' );
			ig.input.bind( ig.KEY.V, 'weaponNext' );
			ig.input.bind( ig.KEY.Q, 'quit' ); 

			ig.input.bind( ig.KEY.ESC, 'pause' );
			
			ig.input.bind( ig.KEY.W, 'forward' );
			ig.input.bind( ig.KEY.A, 'stepleft' );
			ig.input.bind( ig.KEY.S, 'back' );
			ig.input.bind( ig.KEY.D, 'stepright' );
			
			ig.input.bind( ig.KEY.SHIFT, 'run' );
			ig.input.bind( ig.KEY.CTRL, 'shoot' );
			
			ig.input.bind( ig.KEY.MOUSE2, 'run' );
			ig.input.bind( ig.KEY.MWHEEL_UP, 'weaponNext' );
			ig.input.bind( ig.KEY.MWHEEL_DOWN, 'weaponPrev' );

			// Setup Gamepad
			ig.input.bind( ig.GAMEPAD.PAD_TOP, 'forward' );
			ig.input.bind( ig.GAMEPAD.PAD_LEFT, 'left' );
			ig.input.bind( ig.GAMEPAD.PAD_BOTTOM, 'back' );
			ig.input.bind( ig.GAMEPAD.PAD_RIGHT, 'right' );

			ig.input.bind( ig.GAMEPAD.RIGHT_SHOULDER_BOTTOM, 'shoot' );
			ig.input.bind( ig.GAMEPAD.LEFT_SHOULDER_BOTTOM, 'run' );
			ig.input.bind( ig.GAMEPAD.FACE_1, 'shoot' );
			ig.input.bind( ig.GAMEPAD.FACE_4, 'reset-tracking' );
			ig.input.bind( ig.GAMEPAD.FACE_3, 'weaponNext' );
			ig.input.bind( ig.GAMEPAD.FACE_2, 'weaponPrev' );
		},

		setupTouchControls: function() {
			if( this.touchButtons ) { this.touchButtons.remove(); }
			if( this.touchFieldMove ) { this.touchFieldMove.remove(); }
			if( this.touchFieldTurn ) { this.touchFieldTurn.remove(); }

			// Touch buttons are anchored to either the left or right and top or bottom
			// edge of the screen.
			this.touchButtons = new ig.TouchButtonCollection([
				new ig.TouchButton( 'shoot', {right: 0, bottom: 0}, ig.system.width/2, ig.system.height/4 )
			]);
			this.touchButtons.align();
			
			this.touchFieldMove = new ig.TouchField(0, 0, ig.system.width/2, ig.system.height);
			this.touchFieldTurn = new ig.TouchField(ig.system.width/2, 0, ig.system.width/2, ig.system.height/4*3);
		},

		loadLevel: function( data ) {
			this.lastLevel = data;
			this.clearColor = null;

			// Find the info entity
			var info = null;
			for( var i = 0; i < data.entities.length; i++ ) {
				if( data.entities[i].settings && data.entities[i].settings.name == 'info' ) {
					info = data.entities[i].settings;
				}
			}

			// Use the sector size specified in the info entity or default (4)
			this.sectorSize = (info && info.sectorSize) || 4;
			// Load the map
			this.parent( data );
			// Play music
            if (info && info.music) {
                ig.music.play(info.music);
            }

			// Set the fog and fog color (never use fog on mobile)
			if( info && typeof info.fogColor !== 'undefined' && !ig.ua.mobile ) {
				ig.system.renderer.setFog( parseInt(info.fogColor), info.fogNear, info.fogFar );
			}
			else {
				ig.system.renderer.setFog( false );
			}

			// Remember the floor map, so we know where we can spawn entities
			this.floorMap = this.getMapByName('floor');
		},

		
		update: function() {
			// Reset tracking position for WebVR on button press
			if( ig.input.pressed('reset-tracking') && ig.system.renderer instanceof tpf.StereoRenderer ) {
				ig.system.renderer.reset();
			}

			if( this.menu ) {
				// If we have a menu don't update anything else
				this.menu.update();
				return;
			}

			if( ig.input.pressed('quit') ) {
				ig.music.fadeOut(1);
				this.setTitle();  // Retourne au menu principal
			}

			if( this.dead ) {
				// Wait for keypress if we are dead
				if( ig.input.released('shoot') || (!ig.ua.mobile && ig.input.released('click')) ) {
					this.setTitle();
				}
			}
			else {
				// Is it time to spawn another Blob?
				if( this.blobSpawnTimer.delta() > 0 ) {
					this.spawnBlob();
				}
				if( this.powerupSpawnTimer.delta() > 0 ) {
					this.spawnPowerup();
				}
			}

			// Pause menu
			if (ig.input.pressed('pause')) {
				if (this.menu) {
					this.menu = null; // Fermer le menu pause
				} else {
					this.menu = new Game.MenuPause();  // Active le menu pause
				}
			}
			
			// Update all entities and backgroundMaps
			this.parent();
			
			// Roll the death animation; just move the camera down a bit.
			if( this.deathAnimTimer ) {
				var delta = this.deathAnimTimer.delta();
				if( delta < 0 ) {
					ig.system.camera.position[1] = delta.map(
						-this.deathAnimTimer.target, 0,
						0, -ig.game.collisionMap.tilesize / 4
					);
				}
				else {
					this.deathAnimTimer = null;
					this.dead = true;
				}
			}
		},

		spawnBlob: function() {
			var spawnPos = null,
				playerPos = this.player.pos;

			// Try a few times to find a spawn position that's not too close
			// to the player
			for( var i = 0; i < 10; i++ ) {
				spawnPos = this.getRandomSpawnPos();
				if( Math.abs(spawnPos.x - playerPos.x) + Math.abs(spawnPos.y - playerPos.y) > 256 ) {
					// Far enough; all good!
					break;
				}
			}
			this.spawnEntity(EntityEnemyBlobSpawner, spawnPos.x, spawnPos.y);

			this.blobSpawnWaitCurrent /= this.blobSpawnWaitDiv;
			this.blobSpawnTimer.set( Math.max(this.blobSpawnWaitCurrent, 0.5) );
		},

		spawnPowerup: function() {
			// 1/3 chance for health, 2/3 chance for grenades
			var powerups = [EntityHealthPickup, EntityGrenadePickup, EntityGrenadePickup];
			var entityClass = powerups.random();

			var pos = this.getRandomSpawnPos();
			this.spawnEntity(entityClass, pos.x, pos.y);

			this.powerupSpawnTimer.reset();
		},

		getRandomSpawnPos: function() {
			// This randomly probes the floor map and stops at the first tile
			// that is set. If the floor map is empty, this results in an 
			// endless loop, so... better have a floor map in your level!
			var ts = this.floorMap.tilesize;
			while( true ) {
				var x = ((Math.random() * this.floorMap.width)|0) * ts + ts/2,
					y = ((Math.random() * this.floorMap.height)|0) * ts + ts/2;
				
				if( this.floorMap.getTile(x, y) ) {				
					return { x: x, y:y };
				}
			}
		},
		
		showDeathAnim: function() {
			this.deathAnimTimer = new ig.Timer( 1 );
		},

		drawWorld: function() {
			this.parent();
		},

		drawHud: function() {
			ig.system.renderer.hudFreelook = false;
			if( this.player ) {
				ig.game.hud.draw(this.player, this.player.currentWeapon);
			}

			if( this.menu ) {
				ig.system.renderer.hudFreelook = true;
				this.menu.draw();
			}
		}
	});


	document.body.className = 
		(ig.System.hasWebGL() ? 'webgl' : 'no-webgl') + ' ' +
		(ig.ua.mobile ? 'mobile' : 'desktop');


	var width = 1280;
	var height = 720;

	if( window.Ejecta ) {
		var canvas = ig.$('#canvas');
		width = window.innerWidth;
		height = window.innerHeight;
		
		canvas.style.width = window.innerWidth + 'px';
		canvas.style.height = window.innerHeight + 'px';
	}
	else if( ig.ua.mobile ) {
		ig.$('#game').className = 'mobile';
		var canvas = ig.$('#canvas');

		// Listen to the window's 'resize' event and set the canvas' size each time
		// it changes.
		// Wait 16ms, because iOS might report the wrong window size immediately
		// after rotation.
		window.addEventListener('resize', function(){ setTimeout(function(){
			if( ig.system ) { ig.system.resize( window.innerWidth, window.innerHeight ); }
			if( ig.game ) { ig.game.setupTouchControls(); }
		}, 16); }, false);

		width = window.innerWidth;
		height = window.innerHeight;
	}


	ig.Sound.use = [ig.Sound.FORMAT.OGG, ig.Sound.FORMAT.M4A];

	// Test WebGL support and init
	if( ig.System.hasWebGL() ) {
		ig.main( '#canvas', MyGame, 60, width, height, 1, tpf.Loader );
	}
	else {
		ig.$('#game').style.display = 'none';
		ig.$('#no-webgl').style.display = 'block';
	}

});
