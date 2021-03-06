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
		Weapon = require("classes/Weapon"),
	    debugGUI = require('debugGUI');

	var modelGroup = new THREE.Group();
	scene.add( modelGroup );

	var dg = debugGUI;
	var folder = [];
	var skeletonHelper = { update: function(){} };
	var activeCharacter;

	// var kfAnimations = [];
	// var kfAnimationsLength;
	var colladaLoader = new THREE.ColladaLoader();
	colladaLoader.options.convertUpAxis = true;

	var jsonLoader = new THREE.JSONLoader();

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
    	getName: function() {
    		return this._name;
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

    	update: function( deltaTime ) {
			skeletonHelper.update();

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

		loadjs: function() {

			cleanUp();

			var self = this;

			// Add new Folder to the GUI
			var newFolder = dg.addFolder( this._name );
			newFolder.open();
			folder.push( this._name );

			jsonLoader.load( this._url, function ( geometry, materials ) {

				// console.log( "geo, mat", geometry, materials );

				// SKINNING
				for ( var k in materials ) {
					materials[k].skinning = true;
				}

				var mesh = new THREE.SkinnedMesh(geometry, new THREE.MultiMaterial(materials));
				// var mesh = new THREE.Mesh( geometry, material );
				// var matrix = new THREE.Matrix4().makeTranslation(0,8,0);
				// geometry.applyMatrix( matrix );

				var geometry = new THREE.RingBufferGeometry( 0.3, 0.35, 32, 3 );
				geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI/2 ) );
				// var material = new THREE.MeshLambertMaterial( { color: 0xffaa00, polygonOffset: true,
				var material = new THREE.MeshLambertMaterial( { color: 0xFF0000, polygonOffset: true, polygonOffsetFactor: -0.5 } );
				var ring = new THREE.Mesh( geometry, material );
				mesh.add( ring );

				// scene.add( skinnedMesh );
				var mixer = new THREE.AnimationMixer( mesh );
				console.log( mesh.geometry.animations );
				// mixer.clipAction( mesh.geometry.animations[ 0 ] ).play();

				skeletonHelper = new THREE.SkeletonHelper( mesh );
				skeletonHelper.material.linewidth = 2;
				skeletonHelper.visible = false;
				scene.add( skeletonHelper );
				var animFolder = newFolder.addFolder("Animation");
				animFolder.open();
				animFolder.add( skeletonHelper, "visible" ).name("Show Skeletton");

				var action = {};
				action.idle  = mixer.clipAction( mesh.geometry.animations[ 0 ] );
				action.run   = mixer.clipAction( mesh.geometry.animations[ 1 ] );
				action.jump  = mixer.clipAction( mesh.geometry.animations[ 2 ] );
				action.slide = mixer.clipAction( mesh.geometry.animations[ 3 ] );

				action.idle.weight  = 1;
				action.run.weight   = 1;
				action.jump.weight  = 0;
				action.slide.weight = 0;

				console.log( action );
				// self.action = action;

				action.idle.play();
				// action.run.play();
				// self.run = mixer.clipAction( mesh.geometry.animations[ 1 ] ).play;

				self.run = function() { 

					// if( ! action.run.isScheduled() ) {
					// if( action.run.weight == 0 ) {
					// if( action.run.getEffectiveWeight() < 0.01 ) {
					if( ! action.run.isRunning() ) {
						// console.log("run");
						// action.run.play();

						// action.run.weight   = 1;
						// action.run.reset().fadeIn( 0.3 ).play();
						// action.idle.fadeOut( 0.3 ).play();

						action.run.reset().play().crossFadeFrom( action.idle, 0.3 );
					}

				};
				self.idle = function() { 				

					// if( ! action.idle.isScheduled() ) {
					if( ! action.idle.isRunning() ) {
					// if( action.idle.getEffectiveWeight() == 0 ) {
					// if( action.idle.weight == 0 ) {
						// action.run.play();

						// action.idle.weight  = 1;
						// action.idle.reset().fadeIn( 0.3 ).play();
						// action.run.fadeOut( 0.3 ).play();

						action.idle.reset().play().crossFadeFrom( action.run, 0.3 );
					}
				};

				// var mixer = new THREE.AnimationMixer( mesh );
				// self.mixer = mixer;

				// for ( let i = 0; i < mesh.geometry.animations.length; i ++ ) {

				// 	var obj = { customPlay: function() {

				// 					for( let i = 0; i < mesh.geometry.animations.length; i ++ ) {
				// 						mixer.clipAction( mesh.geometry.animations[ i ] ).stop();
				// 					}
				// 					mixer.clipAction( mesh.geometry.animations[ i ] ).play();

				// 	}};

				// 	animFolder.add( obj, "customPlay" ).name( "Play "+mesh.geometry.animations[ i ].name );

				// }

				(function() {

					var oldUpdateFunction = self.update;

					self.update= function( deltaTime ) {

						oldUpdateFunction();

						mixer.update( deltaTime );

					}

				})();

				self._mesh = mesh;

				// dae.updateMatrix();
				modelGroup.add( mesh );
				if ( this._onLoad !== undefined ) {
					this._onLoad( mesh );
				}
				console.log( mesh );

				tweenHelper.fitObject( mesh );

				// load complete
				this.fire( this );

			}.bind( this ) );

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
						// console.log( child );
						skeletonHelper = new THREE.SkeletonHelper( child );
						skeletonHelper.material.linewidth = 2;
						skeletonHelper.visible = false;
						scene.add( skeletonHelper );
						var animFolder = newFolder.addFolder("Animation");
						animFolder.open();
						animFolder.add( skeletonHelper, "visible" ).name("Show Skeletton");

						var animation = new THREE.Animation( child, child.geometry.animation );
						self.animation = animation;
						// animation.timeScale = 1/2 ; // add this
						// animation.play();
						console.log( "anim", animation );

						// var track = new THREE.NumberKeyframeTrack( trackName, times, values );
						var track = new THREE.NumberKeyframeTrack( "crazy", [0,1], [0, 40] );

						// var clip = new THREE.AnimationClip( name, duration, tracks );
						// var clip = THREE.AnimationClip.parseAnimation( animation, skl.tag );
						var clip = new THREE.AnimationClip( "crazy2", 2, track );

						animFolder.add( animation, "timeScale" ).max(2).min(0.1);
						var aPlay = animFolder.add( animation, "play" ).name("PLAY "+animation.data.name);
						var aStop = animFolder.add( animation, "stop" ).name("STOP "+animation.data.name);

						var start = 0;
						var max = animation.data.length;
						var fps = animation.data.fps;

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
											loop.start = 0; 
											loop.end = 40/fps; 
											loop.sound = null; 
											//play( loop.start ); 
										},
									walk:function(){ 
											loop.start = 40/fps; 
											loop.end = 90/fps; 
											loop.sound = step; 
											//play( loop.start ); 
										},
									run:function(){ 
											loop.start = 90/fps; 
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

						self.run = obj.walk;
						self.idle = obj.idle;

						self.animations = obj;
						// self.setupFSM( animation, obj, loop );

						(function() {

							var oldUpdateFunction = self.update;

							self.update= function( deltaTime ) {

								oldUpdateFunction();

								if ( animation.currentTime > loop.end || animation.currentTime < loop.start ) {
								    animation.stop();
								    if( loop.sound instanceof THREE.Audio ) {
								    	if ( loop.sound.isPlaying ) {
								        	loop.sound.stop();
								    	}
								        loop.sound.play();
								    }
								    animation.play(loop.start);
								}
							}

						})();
						/*
						self.update = function( deltaTime ) {

							// skeletonHelper.update();
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
