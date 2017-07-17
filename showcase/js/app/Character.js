/**
 * Setup the control method
 */

define(function (require) {

	'use strict';
	
	var THREE = require("three"),
		scene = require("scene"),
		tweenHelper = require("tweenHelper"),
		ColladaLoader = require("ColladaLoader"),
		audioListener = require("audioListener"),
		StateMachine = require("StateMachine"),
		Weapon = require("Weapon"),
	    debugGUI = require('debugGUI');

	var modelGroup = new THREE.Group();
	scene.add( modelGroup );

	var dg = debugGUI;
	var folder = [];
	var skeletonHelper;
	var activeCharacter;

	// var kfAnimations = [];
	// var kfAnimationsLength;
	var colladaLoader = new THREE.ColladaLoader();
	colladaLoader.options.convertUpAxis = true;

	function cleanUp() {

		// remove existing Folders from the gui
		for ( var j = 0; j < folder.length; j ++ ) {
			dg.removeFolder( folder[ j ] );
		}

		// remove existing models from the scene
		modelGroup.traverse( function ( child ) {
			// if ( child instanceof THREE.SkinnedMesh ) {
			modelGroup.remove( child );
			// }
		});

		scene.remove( skeletonHelper );

	}

    function Character( url, name, onLoad ){

    	this._url = url;
    	this._name = name;
    	this._onLoad = onLoad;
    	this._mesh = null; //?
    	this.handlers = [];  // callbacks

    	this.animations;
    	this.animation;

    	this.healthPoints = 100;
    	this.weapon = new Weapon( "Hellebarde", 10 );

    }

    Character.prototype = {

    	getPawn: function() {

    		return this._mesh;

    	},

		subscribeOnLoad: function(fn) {
		    this.handlers.push(fn);
		},
		unsubscribe: function(fn) {
		    this.handlers = this.handlers.filter(
		        function(item) {
		            if (item !== fn) {
		                return item;
		            }
		        }
		    );
		},
		fire: function(o, thisObj) {
		    var scope = thisObj || window;
		    this.handlers.forEach(function(item) {
		        item.call(scope, o);
		    });
		},

		attack: function( target ) {
			target.takeDamage( this.weapon.attackDamage );
			this.animations.fight();
		},
		takeDamage: function( howMuch ) {
			this.healthPoints -= howMuch;
			if( this.healthPoints <= 0 ) {
				this.healthPoints = 0;
				this.die();
			}
		},
		die: function() {
			// disable
			this.animations.die();
		},
    	getName: function() {
    		return this._name;
    	},
    	update: function( deltaTime ) {

            // console.log( this.animation.currentTime );
	        // if ( this.animation.currentTime > this.loop.end || this.animation.currentTime < this.loop.start ) {
	        // 	this.animation.stop();
	        // }
	        // if ( this.animation.currentTime > this.loop.end || this.animation.currentTime < this.loop.start ) {
	        //     this.animation.stop();
	        //     if( this.loop.sound instanceof THREE.Audio ) {
	        //     	if ( this.loop.sound.isPlaying ) {
		       //      	this.loop.sound.stop();
	        //     	}
		       //      this.loop.sound.play();
	        //     }
	        //     this.animation.play(this.loop.start);
	        // }

    	},
    	setupFSM: function( animation, animationFunctions, loop ) {

			// states: idle, walking, running, fighting, dead
			// events: reset, move, moveFast, attack, die

			var fsm = StateMachine.create({

				initial: 'idle',
				events: [
					{ name: 'reset', from: '*',  to: 'idle' },
					{ name: 'move', from: ['idle','running', 'walking','fighting'], to: 'walking' },
					{ name: 'moveFast', from: ['idle','running','walking'], to: 'running'   },
					{ name: 'attack', from: ['idle','walking'], to: 'fighting' },
					{ name: 'die', from: '*', to: 'dead' },
				],
				callbacks: {
					// constrain safe door to itemslot
					// fsm.onafterinteract = function( event, from, to, msg ) {
					onenterstate: function( event, from, to ) {

						// var action = this.transitions()[ 0 ];

					},
					onbeforeattack: function(event, from, to) { 

						// if ( this.is( "locked" ) ) {
						//     // some UI action, minigame, unlock this shit
						//    	// return if itemslot isnt filled
						//     if ( constraint.active === true ) {
						//     	sounds.beep.play();
						//     	// cancel transition
						//     	return false;
						//     }

						// }

					},
					onidle: function() {
						animationFunctions.idle();
						animation.play( loop.start, loop.end );
					},
					onwalking: function() {
						animationFunctions.walk();
						animation.play( loop.start, loop.end );
					},
					onrunning: function() {
						animationFunctions.run();
						animation.play( loop.start, loop.end );
					},
					onfighting: function(event, from, to, msg) { 
						animationFunctions.fight();
						animation.play( loop.start, loop.end );
					},
					ondead: function() {
						animationFunctions.die();
						animation.play( loop.start, loop.end );
					},
					onreset: function() {
						animationFunctions.reset();
					},
					// onleavestate: function( event, from, to, msg ) {
					// onafterinteract: function( event, from, to, msg ) {
					// 	console.log("leaving state", event, from, to, fsm.transitions() );

					// },
					onleavelocked: function() {

						/*
						tweens.wheel.onComplete( function() { 
							fsm.transition(); 
							safesound.safe_door.stop();						
						} );
						tweens.unlock.chain( tweens.wheel );
						tweens.unlock.onComplete( function() { 

							safesound.safe_door.play(); 
							// broken
							// sound1.gain.gain.exponentialRampToValueAtTime( 0.01, sound1.context.currentTime + 2.5 );

						} );
						tweens.unlock.onStart( 
							function() { 
								// sound is too short for the animation :s
								// setTimeout( function() { sound4.play(); }, 300 );
								safesound.click_slow.play() 
							} 
						);
						tweens.unlock.start();

						return StateMachine.ASYNC;
						*/

					},
					onbeforereset: function( event, from, to ) {

					},
				}

			});
	
			var folder = dg.addFolder("StateMachine");
			folder.open();

			folder.add( fsm, "current" ).name("Current State").listen();
			folder.add( fsm, "reset" ).name("Reset");

			folder.add( fsm, "move" ).name("Move");
			folder.add( fsm, "moveFast" ).name("MoveFast");
			folder.add( fsm, "attack" ).name("Attack");
			folder.add( fsm, "die" ).name("die");

			return fsm;

		},
    	load: function () {

			cleanUp();

			var self = this;

			// Add new Folder to the GUI
			var newFolder = dg.addFolder( this._name );
			newFolder.open();
			folder.push( this._name );

			colladaLoader.load( this._url, function ( collada ) {

				var dae = collada.scene;
				self._mesh = dae;
				// prep animations
				/*
				var animations = collada.animations;
				kfAnimationsLength = animations.length;

				// KeyFrame Animations

				for ( var i = 0; i < kfAnimationsLength; ++i ) {

					var animation = animations[ i ];

					var kfAnimation = new THREE.KeyFrameAnimation( animation );
					kfAnimation.timeScale = 1;
					kfAnimations.push( kfAnimation );

				}

				for ( var i = 0; i < kfAnimationsLength; ++i ) {

					var animation = kfAnimations[i];

					for ( var h = 0, hl = animation.hierarchy.length; h < hl; h++ ) {

						var keys = animation.data.hierarchy[ h ].keys;
						var sids = animation.data.hierarchy[ h ].sids;
						var obj = animation.hierarchy[ h ];

						if ( keys.length && sids ) {

							for ( var s = 0; s < sids.length; s++ ) {

								var sid = sids[ s ];
								var next = animation.getNextKeyWith( sid, h, 0 );

								if ( next ) next.apply( sid );

							}

							obj.matrixAutoUpdate = false;
							animation.data.hierarchy[ h ].node.updateMatrix();
							obj.matrixWorldNeedsUpdate = true;

						}

					}

					animation.loop = true;
					animation.play();

				}

				if ( kfAnimationsLength > 0 ) {

					self.update = function( deltaTime ) {
						for ( var i = 0; i < kfAnimationsLength; ++i ) {
							console.log("updateing af");
							kfAnimations[ i ].update( deltaTime );
						}
						
					}

				}
				// end prep
				// console.log( "animations", kfAnimations );
				*/

				dae.traverse( function ( child ) {

					if (child instanceof THREE.Mesh) {
						// enable casting shadows
						child.castShadow = true;
						// child.receiveShadow = true;
					}

					if ( child instanceof THREE.SkinnedMesh ) {

						skeletonHelper = new THREE.SkeletonHelper( dae );
						skeletonHelper.material.linewidth = 3;
						skeletonHelper.visible = false;
						scene.add( skeletonHelper );

						var animFolder = newFolder.addFolder("Animation");
						animFolder.open();
						animFolder.add( skeletonHelper, "visible" ).name("Show Skeletton");

						var mixer = new THREE.AnimationMixer( dae );
						var animations = collada.animations;
						var clip = mixer.clipAction( animations[ 0 ] );

						self.animation = animations;
						// animation.timeScale = 1/2 ; // add this
						// animation.play();
						console.log( "animations", animations );
						console.log( "mixer", mixer );
						console.log( "clip", clip );

						animFolder.add( clip, "timeScale" ).max(2).min(0.1);
						//var aPlay = animFolder.add( clip, "play" ).name("PLAY "+animations[ 0 ].name);
						//var aStop = animFolder.add( clip, "stop" ).name("STOP "+animations[ 0 ].name);
						var aPlay = animFolder.add( clip, "paused" ).name( "PAUSE "+animations[ 0 ].name );

						var start = 0;
						var max = animations[ 0 ].duration;
						// var fps = clip.fps;
						var fps = 24;

						var loop = { start: 0, end: 0, sound: null };
						self.loop = loop;
						// animFolder.add( loop, "start" ).max(max).min(0);
						// animFolder.add( loop, "end" ).max(max).min(0);


						var knife = new THREE.Audio( audioListener );
						scene.add( knife );						
						var die = new THREE.Audio( audioListener );
						scene.add( die );					
						var step = new THREE.Audio( audioListener );
						scene.add( step );

						var loader = new THREE.AudioLoader();
						loader.load('assets/sounds/cstrike/knife_deploy.wav', function ( audioBuffer ) {
								knife.setBuffer( audioBuffer );
							});						
						loader.load('assets/sounds/cstrike/die2.wav', function ( audioBuffer ) {
								die.setBuffer( audioBuffer );
							});						
						loader.load('assets/sounds/cstrike/pl_dirt1.wav', function ( audioBuffer ) {
								step.setBuffer( audioBuffer );
							});

						// use this as trigger
						// when animations doesnt run in a loop
						// function play( start ) {
						// 	self.animation.stop();
						// 	self.animation.play( start );
						// }

						var obj = { 
									idle:function(){ 
											loop.start = 0/fps; 
											loop.end = 40/fps; 
											loop.sound = null; 
											//play( loop.start ); 
										},
									walk:function(){ 
											loop.start = 50/fps; 
											loop.end = 90/fps; 
											loop.sound = step; 
											//play( loop.start ); 
										},
									run:function(){ 
											loop.start = 100/fps; 
											loop.end = 120/fps; 
											loop.sound = step; 
											//play( loop.start ); 
										},
									fight:function(){ 
											loop.start = 120/fps; 
											loop.end = 171/fps; 
											loop.sound = knife; 
											// play( loop.start ); 
										},
									die:function(){ 
											loop.start = 171/fps; 
											loop.end = max; 
											loop.sound = die; 
											//play( loop.start ); 
										},
									reset:function(){ 
											loop.start = 0; 
											loop.end = max; 
											loop.sound = null; 
											//play( loop.start ); 
										}
								};

						// var name = "Wache";
						var name = self._name;
						if ( dg.__folders[ name ] ) {
							var folder = dg.__folders[ name ];
						} else {
							var folder = dg.addFolder( name );
						}

						var name = "Animation";
						if ( folder.__folders[ name ] ) {
							var animFolder = folder.__folders[ name ];
						} else {
							var animFolder = folder.addFolder( name );
						}

						for ( var k in obj ) {
							animFolder.add( obj, k );
						}

						// start with idle animation
						obj.idle();
						clip.play();

						self.animations = obj;
						// self.setupFSM( animation, obj, loop );

						(function() {

							var oldUpdateFunction = self.update;

							self.update= function( deltaTime ) {

								oldUpdateFunction();
						    				
								if ( mixer !== undefined ) {
									mixer.update( deltaTime );
								}

								if ( clip.time > loop.end || clip.time < loop.start ) {
								    // clip.stop();
								    clip.reset();
								    if( loop.sound instanceof THREE.Audio ) {
								    	if ( loop.sound.isPlaying ) {
								        	loop.sound.stop();
								    	}
								        loop.sound.play();
								    }
								    clip.time = loop.start;
								    clip.play();
								}
								
							}

						})();
						/*
						self.update = function( deltaTime ) {
							// console.log("updating", self.getName() );
					    };
						*/
						    // https://code.tutsplus.com/tutorials/webgl-with-threejs-models-and-animation--net-35993
						    // frames: 
			    			// 0/1 idle 
			    			// 40 idle to walk 
			    			// 50 walk 
			    			// 90 walk to run 
			    			// 100 run 
			    			// 120 ||| 120 (basis: idle) attack 
			    			// 141 (hold pose)  attack2 (holdpose) 
			    			// 161 hold idle 
			    			// 171  bis 191 mist
							// 191 bis 211 die ani
					}
					
				} );


				dae.updateMatrix();
				modelGroup.add( dae );
				if ( this._onLoad !== undefined ) {
					this._onLoad( dae );
				}
				// scene.add( dae );
				// console.log( dae );

				// var box = new THREE.Box3().setFromObject( mesh )
				// var boundingBoxSize = box.max.sub( box.min );
				// var height = boundingBoxSize.y;
				// camera.position.set( 0, height, 4 );
				// controls.target.copy( new THREE.Vector3( 0, 0.5, 0 ) );

				tweenHelper.fitObject( dae );

				// load complete
				this.fire( this );

			}.bind( this ) ); // bind the Model to access its callback
    	}

    };

    return Character;
});
