ig.module(
	'game.hud'
)
.requires(
	'plugins.twopointfive.hud'
)
.defines(function(){

	MyHud = tpf.Hud.extend({

		fontInfo: new tpf.Font( 'media/mizu.22.font.png' ),
		font: new tpf.Font( 'media/mizu.38.font.png' ),

		healthIconImage: new ig.Image( 'media/health-icon.png' ),
		damageIndicatorImage: new ig.Image( 'media/hud-blood-low.png' ),
		
		healthIcon: null,
		keys: [],
		showControlsTimer: null,

		init: function( width, height, showControls ) {
			this.parent(width, height);

			this.healthIcon = new tpf.HudTile( this.healthIconImage, 0, 32, 32 );
			this.healthIcon.setPosition( 96, this.height-this.healthIcon.tileHeight-4 );
		},

		draw: function( player, weapon ) {
			this.prepare();

			if( weapon ) {
				weapon.draw();

				if( weapon.ammoIcon ) {
					weapon.ammoIcon.draw();
					this.font.draw( weapon.ammo, 210, this.height - this.font.height + 1, ig.Font.ALIGN.RIGHT );
				}

				// Affichage de l'icône de l'arme
				if (weapon.weaponIcon) {
					weapon.weaponIcon.draw(32, this.height - 140); // Position ajustable
				}

				// Affichage du nom de l'arme et de ses stats
				this.fontInfo.draw( "Arme: " + weapon.name, 32, this.height - 100, ig.Font.ALIGN.LEFT ); 
				this.fontInfo.draw( "Puissance: " + weapon.power, 32, this.height - 80, ig.Font.ALIGN.LEFT ); 
				this.fontInfo.draw( "Cadence: " + weapon.fireRate, 32, this.height - 60, ig.Font.ALIGN.LEFT ); 		
			}

			this.healthIcon.draw();
			this.font.draw( player.health, 90, this.height - this.font.height + 1, ig.Font.ALIGN.RIGHT );

			this.font.draw( 'Kills: ' +ig.game.blobKillCount, 32, 8 );

			// Dessiner les messages et l'indicateur de dégâts (showMessage(text))
			this.drawDefault();
		}
	});


});