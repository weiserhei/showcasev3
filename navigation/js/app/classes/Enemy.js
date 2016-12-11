/**
 * Enemy
 * + setTarget( THREE.Mesh )
 * + calculatePath( fromPos, toPos )
 * + update( deltaTime )
 *
 */

define(function (require) {

	'use strict';

	var THREE = require("three");
	var scene = require("scene");
	var loadingManager = require("loadingManager");
	var ColladaLoader = require("ColladaLoader");
	var dg = require("debugGUI");
	var StateMachine = require("StateMachine");

	var model = null;

	/*
	var colladaLoader = new THREE.ColladaLoader( loadingManager );
	colladaLoader.options.convertUpAxis = true;
	colladaLoader.load( "assets/models/monster/monster.dae", function callback( collada ) {
		model = collada.scene;
		// model.matrix.makeRotationY( -Math.PI / 2 );

		// var rotateX = Math.PI / 2;
		// var matrix = new THREE.Matrix4().makeRotationY( rotateX );
		var matrix = new THREE.Matrix4().multiplyScalar( 0.001 );
		model.applyMatrix( matrix );
		// model.scale.multiplyScalar( 0.01 );

	} );
	*/

	// Returns a random integer between min (included) and max (included)
	function getRandomInt(min, max) {
	  return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	/**
	 * Returns a number whose value is limited to the given range.
	 *
	 * Example: limit the output of this computation to between 0 and 255
	 * (x * 255).clamp(0, 255)
	 *
	 * @param {Number} min The lower boundary of the output range
	 * @param {Number} max The upper boundary of the output range
	 * @returns A number in the range [min, max]
	 * @type Number
	 */
	Number.prototype.clamp = function(min, max) {
	  return Math.min(Math.max(this, min), max);
	};

	// function getRandomInt(min, max) {
	//   var MAX_UINT32 = 0xFFFFFFFF;
	//   var range = max - min;

	//   if (!(range <= MAX_UINT32)) {
	//     throw new Error(
	//       "Range of " + range + " covering " + min + " to " + max + " is > " +
	//       MAX_UINT32 + ".");
	//   } else if (min === max) {
	//     return min;
	//   } else if (!(max > min)) {
	//     throw new Error("max (" + max + ") must be >= min (" + min + ").");
	//   }

	//   // We need to cut off values greater than this to avoid bias in distribution
	//   // over the range.
	//   var maxUnbiased = MAX_UINT32 - ((MAX_UINT32 + 1) % (range + 1));

	//   var rand;
	//   do {
	//     rand = crypto.getRandomValues(new Uint32Array(1))[0];
	//   } while (rand > maxUnbiased);

	//   var offset = rand % (range + 1);
	//   return min + offset;
	// }

	var jsonLoader = new THREE.JSONLoader();
	jsonLoader.load( "assets/models/gumi/gumi.json", function ( geometry, materials ) {

		// console.log( "geo, mat", geometry, materials );
		var material = new THREE.MultiMaterial( materials );

		// SKINNING
		for ( var k in materials ) {
			materials[k].skinning = true;
		}

		var mesh = new THREE.SkinnedMesh(geometry, new THREE.MultiMaterial(materials));
		model = mesh;

	} );


	var playerNavMeshGroup = 0;
	var pathLines;
	var calculatedPath = null;

	var tempQuaternion = new THREE.Quaternion();

	function Enemy() {

		this.mesh = model.clone();
		scene.add( this.mesh );

    	var x = getRandomInt( -20, 20 );
    	var z = getRandomInt( -20, 20 );
    	this.mesh.position.set( x, 0, z );

    	this._calculatedPath = null;
    	this._state = 0;
		this._speed = 3;
		this._target = null;
		this._health = 100;
		this._rotationAxis = new THREE.Vector3( 0, 0, 1 );

		var mesh = this.mesh;
		var mixer = new THREE.AnimationMixer( this.mesh );
		this._mixer = mixer;

		var action = {};
		action.idle  = mixer.clipAction( mesh.geometry.animations[ 0 ] );
		action.run   = mixer.clipAction( mesh.geometry.animations[ 1 ] );
		action.jump  = mixer.clipAction( mesh.geometry.animations[ 2 ] );
		action.slide = mixer.clipAction( mesh.geometry.animations[ 3 ] );

		action.idle.weight  = 1;
		action.run.weight   = 1;
		action.jump.weight  = 1;
		action.slide.weight = 0;
		this.action = action;
		// action.jump.loop = THREE.LoopOnce;

		// action.idle.play();
		action.run.play();

		this._run = function() { 
			if( ! action.run.isRunning() ) {
				// console.log("run");
				// action.run.reset().play().crossFadeFrom( action.idle, 0.3 );
				action.run.reset().play().crossFadeFrom( action.jump, 0.3 );
				// action.idle.stop();
			}
		};
		this._idle = function() { 				
			// if( ! action.idle.isRunning() ) {
				// console.log("idle");
				// action.idle.reset().play().crossFadeFrom( action.run, 0.3 );
			// }
		};
		this._die = function() {
			action.run.weight = 0;
			action.jump.weight = 0;
			action.idle.weight = 1;
			action.idle.reset().play();
		};
		this._jump = function() { 
			if( ! action.jump.isRunning() && ! action.idle.isRunning() ) {
				// console.log("jump");
				// action.idle.enabled = false;
				// action.jump.play();
				action.jump.reset().play().crossFadeFrom( action.run, 0.3 );
				// action.run.enabled = false;
				// action.idle.reset().startAt( mixer.time + 1 ).play().fadeIn( 0.3 );
				// action.idle.reset().play().fadeIn( 0.3 );
				// action.jump.reset().play().fadeIn( 0.3 );
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

		var box = new THREE.Box3().setFromObject( model )
		var boundingBoxSize = box.max.sub( box.min );
		var height = boundingBoxSize.y;

		var geometry = new THREE.SphereBufferGeometry( 0.2, 7, 2 );
		geometry.scale( 1, 2, 1 );
		this._healthDiamond = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( {color: 0x00FF00} ) );
		// healthDiamond.position.copy( this.mesh.position );
		this.mesh.add( this._healthDiamond );
		this._healthDiamond.position.y = height + 0.5;

		var geometry = new THREE.RingBufferGeometry( 0.3, 0.35, 32, 3 );
		geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI/2 ) );
		var material = new THREE.MeshLambertMaterial( { color: 0x00FF00, polygonOffset: true, polygonOffsetFactor: -0.5 } );
		this._ring = new THREE.Mesh( geometry, material );
		this._ring.visible = false;
		this.mesh.add( this._ring );

        // var nav = this;
        // var inputs = { 
        //         x:0, 
        //         y:0, 
        //         z:0, 
        //         calc: function() { 

        //         	do {

	       //          	inputs.x = getRandomInt( -200, 200 );
	       //          	inputs.z = getRandomInt( -200, 200 );
	       //          	console.log( inputs );
        //         		calculatedPath = nav.calculatePath( nav.mesh.position, new THREE.Vector3( inputs.x, inputs.y, inputs.z ) );

        //         	} while ( calculatedPath == null || calculatedPath.length === 0 );

                    
        //         } 
        //     };
        // dg.add( inputs, "x" );
        // dg.add( inputs, "y" );
        // dg.add( inputs, "z" );
        // dg.add( inputs, "calc" );

        this._calculatedPath = [];
        this._cooldown = 1.3;
        this._currentCooldown = 0;
        this.fsm = this._setupFSM();

	}

	Enemy.prototype = {

		remove: function() {

			console.log("remove", this.mesh );
			// this.mesh.visible = false;
			this.mesh.visible = false;
			scene.remove( this.mesh );

		},

		setRandomTarget: function() {
        	do {

            	var x = getRandomInt( -200, 200 );
            	var z = getRandomInt( -200, 200 );
        		this._calculatedPath = this.calculatePath( this.mesh.position, new THREE.Vector3( x, 0, z ) );

        	} while ( this._calculatedPath == null || this._calculatedPath.length === 0 );

		},

		setTarget: function( targetMesh ) {

			// this.mesh.position.copy( targetMesh.position );
			// this.mesh.position.z -= 1;
			// this._target = targetMesh;

		},

	    calculatePath: function( fromPosition, targetPosition ) {

            // Calculate a path to the target and store it
            var calculatedPath = patrol.findPath( fromPosition, targetPosition, 'level', playerNavMeshGroup);
            // console.log("calculated path", calculatedPath);

            if (calculatedPath && calculatedPath.length) {

                if (pathLines) {
                    scene.remove(pathLines);
                }

                var material = new THREE.LineBasicMaterial({
                    color: 0x00FF00,
                    linewidth: 2
                });

                var geometry = new THREE.Geometry();
                geometry.vertices.push(fromPosition);

                // Draw debug lines
                for (var i = 0; i < calculatedPath.length; i++) {
                    geometry.vertices.push(calculatedPath[i].clone().add(new THREE.Vector3(0, 0.2, 0)));
                }

                pathLines = new THREE.Line( geometry, material );
                scene.add( pathLines );

                // Draw debug cubes except the last one. Also, add the player position.
                var debugPath = [fromPosition].concat(calculatedPath);

                for (var i = 0; i < debugPath.length - 1; i++) {
                    geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
                    var material = new THREE.MeshBasicMaterial( {color: 0x00F0F0} );
                    var node = new THREE.Mesh( geometry, material );
                    node.position.copy(debugPath[i]);
                    pathLines.add( node );
                }
            }

	        return calculatedPath;
	    },

	    lookAt: function( direction, deltaTime, rotationSpeed ) {

            direction.y = 0;

            // character.getPawn().quaternion.setFromUnitVectors( this._rotationAxis, lookVector);
            // SLERP for smooth rotation
            tempQuaternion.setFromUnitVectors( this._rotationAxis, direction );
            // slerp.multiply( new THREE.Quaternion( 0, -0.7071, 0, 0.7071 ) ); // offset rotation 90 deg
            this.mesh.quaternion.slerp( tempQuaternion, deltaTime*rotationSpeed );

	    },

		_setupFSM: function() {

			var self = this;
			var fsm = StateMachine.create({

				// Events: attack, die, run
				// States: fighting, dead, running

				initial: 'running',
				events: [
					{ name: 'run', from: 'fighting', to: 'running' },
					{ name: 'attack', from: ['running','fighting'], to: 'fighting' },
					{ name: 'die', from: ['running','fighting'], to: 'dead' },
					{ name: 'takeDamage', from: ['running','fighting'], to: 'fighting' },
					{ name: 'revive', from: 'dead', to: 'running' }
				],
				callbacks: {
					onenterstate: function( event, from, to ) {

					},
					onrevive: function() {
						self._health = 100;
						var color = new THREE.Color( 0x0000FF );
						self._healthDiamond.material.color = color;
						self.action.idle.weight = 0;
						self.action.jump.weight = 0;
						self.action.run.weight = 1;
						self._run();
					},
					ontakeDamage: function( event, from, to, howMuch, who ) {
						self._calculatedPath = [];
						if ( self._target === null ) { self._target = who; }
						self.takeDamage( howMuch, who );
					},
					onattack: function( event, from, to, enemy, deltaTime ) {
	                	self._target = enemy;
						self.attack( enemy, deltaTime );
						var distance = self.mesh.position.distanceTo( enemy.mesh.position );
						// console.log("distance", distance );
				    	if( enemy.fsm.is("dead") || distance > 2 ) {
				    		self._currentCooldown = 0;
				    		this.run();
				    	}
					},
					onrun: function() {
						self._ring.visible = false;
						// self._ring.material.color = new THREE.Color( 0x00FF00 );
					},
					ondie: function() {
						self.die();
					}
				}
			});

			dg.add( fsm, "current" ).listen();

			return fsm;

		},

	    attack: function( enemy, deltaTime ) {

			this._calculatedPath = [];
	    	this._currentCooldown -= deltaTime;
	    	var color = Math.floor( this._currentCooldown * 100 ).clamp( 0, 100);
	    	this._ring.visible = true;
	    	// this._ring.material.color = new THREE.Color("rgb(10,10,"+color+")");
	    	this._ring.material.color = new THREE.Color("hsl(224, 100%, "+color+"%)");

	    	if ( this._currentCooldown > 0 ) {
	    		return;
	    	}
    		// console.log( "cooldown over", this._currentCooldown );
    		this.mesh.lookAt( new THREE.Vector3( enemy.mesh.position.x, this.mesh.position.y, enemy.mesh.position.z ) )
	    	this._currentCooldown = this._cooldown;
	    	// console.log("attack", this, enemy );

	    	if ( this._health > 0 ) {
		    	this._jump();
		    	var attackDamage = getRandomInt( 5, 15 );
		    	if ( enemy.fsm.can( "takeDamage" ) ) {
		    		enemy.fsm.takeDamage( attackDamage, this );
		    	}
	    	}

	    },

	    die: function() {
    		this._healthDiamond.material.color = new THREE.Color("rgb(10,10,10)");
    		this._ring.material.color = new THREE.Color("rgb(10,10,10)");
    		this._die();
	    },

	    takeDamage: function( howMuch, who ) {
	    	// character is attacked
	    	this._health -= howMuch;

	    	if ( this._health <= 0 ) {
	    		this._health = 0;
	    		this.fsm.die();
	    		return;
	    	}

			// If health is below 50 percent, 
			//   Red is 100 percent (255)  'Red is also 100 percent for yellow (with green 100%)
			//   Green is Health/50 percent ( (hp/50) * 255 )  'so goes from full red at 0 to full yellow at 50%
			// else 'health above 50 percent, remove Red over the next 50 percent, 'til full green.
			//   Green is 100 percent (255)
			//   Red is ((100 - hp) / 50)*255 (goes 50 to 0 over hp range 50 to 100, 
			//                           / 50 to get %, * 255 to diminish red from full to 0, over the range of 50 to 100 hp
			// end if.

	    	if ( this._health < 50 ) {
	    		var red = 255;
	    		var green = ( this._health / 50 ) * 255;
	    	} else {
	    		var red = ((100 - this._health ) / 50 ) * 255;
	    		var green = 255;
	    	}

			var color = new THREE.Color("rgb("+Math.floor(red)+", "+Math.floor(green)+", 0)");
			// var color = new THREE.Color("rgb(100%, 0%, 0%)");
			this._healthDiamond.material.color = color;
			// this._ring.material.color = color;
	    },

    	update: function( deltaTime, enemys ) {

            // patrolJS
            // if (!level) {
            // if (level.length == 0 ) {
            //     return;
            // }
            // level, calculatedPath, player
            var targetPosition;

            // timebuffer += deltaTime;
            // if ( timebuffer > 1 ) {
            // 	timebuffer = 0;
            // 	// calculatedPath = this.calculatePath( this.mesh.position, this._target.position );
            // }
            this._mixer.update( deltaTime );

            if ( this.fsm.is("running") ) {

	            for ( let i = 0; i < enemys.length; i ++ ) {
	            	var enemy = enemys[ i ];
	            	if ( this === enemy ) { continue; }

	            	var distance = this.mesh.position.distanceTo( enemy.mesh.position );
	                if ( distance < 1 && enemy.fsm.is("running") ) {
	                    this.fsm.attack( enemy, deltaTime );
	                    // console.log( "contact", this, enemys[ j ] );
	                }
	            }
            } 
            else if ( this.fsm.can("attack") && this._target !== null ) {
            	this.fsm.attack( this._target, deltaTime );
            } 
            // else if ( this.fsm.is("dead") ) {
            // 	timebuffer += deltaTime;
            // 	if ( timebuffer > 5 ) {
            // 		timebuffer = 0;
            // 		this.fsm.revive();
            // 	}
            // }

            /*
            if ( this.mesh.position.distanceTo(this._target.position ) < 2 ) {
                var vel = this._target.position.clone().sub(this.mesh.position);
                vel.normalize();
                
                this.lookAt( vel, deltaTime, 3 );

            	this._jump();

            }

            else 
			*/
            if (this._calculatedPath && this._calculatedPath.length) {
                targetPosition = this._calculatedPath[0];

                var vel = targetPosition.clone().sub(this.mesh.position);

                // console.log("moving enemy", this.mesh.position, targetPosition );
                // character.animations.walk();
                this._run();

                if (vel.lengthSq() > 0.05 * 0.05) {
                    vel.normalize();
                    
                    this.lookAt( vel.clone(), deltaTime, 10 );

                    // Move player to target
                    this.mesh.position.add( vel.multiplyScalar(deltaTime * this._speed) );

                }
                else {
                    // Remove node from the path we calculated
                    this._calculatedPath.shift();
                }
            }
            else {
                // character.animations.idle();
                if ( this.fsm.is("running") ) {

	                this.setRandomTarget();
	                this._idle();

                }
            }

    	}

	};

	var timebuffer = 0;


	return Enemy;

});