/**
 * Enemy
 * 
 */

define(function (require) {

	'use strict';

	var THREE = require("three");
	var scene = require("scene");
	var camera = require("camera");

	var loadingManager = require("loadingManager");

	var colladaLoader = new THREE.ColladaLoader( loadingManager );
	colladaLoader.options.convertUpAxis = true;

	var model = null;

	colladaLoader.load( "assets/models/monster/monster.dae", function callback( collada ) {
		model = collada.scene;
		model.scale.multiplyScalar( 0.01 );
	} );

	var level;
	var playerNavMeshGroup = 0;
	var pathLines;

	function Enemy( chara, lev ) {

		this.mesh = model.clone();
		this.mesh.position.set( 1, 0, 1 );
		scene.add( this.mesh );

		this._speed = 3;

		this.target = chara;

		level = lev;

		// xxxx
		this._playerNavMeshGroup = patrol.getGroup('level', this.mesh.position );

	}

	var calculatedPath;

	Enemy.prototype = {

		attack: function( target, playerNavMeshGroup ) {

			// console.log("attack", target.position );
			// this.calculatePath( this.mesh.position, target.position, playerNavMeshGroup );

		},

	    calculatePath: function( fromPosition, targetPosition ) {

	        // mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	        // mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	        // camera.updateMatrixWorld();

	        // raycaster.setFromCamera( mouse, camera );
	        // var intersects = raycaster.intersectObjects( level );

	        // if ( intersects.length > 0 ) {
	        //     var vec = intersects[0].point;

	            // var vec = targetPosition;
	            // targetPosition.copy(vec);

	            // var targetPosition = new THREE.Vector3( 12, 0, 12 );

	            // console.log("inputs", fromPosition, targetPosition, playerNavMeshGroup );
	            // Calculate a path to the target and store it
	            calculatedPath = patrol.findPath( fromPosition, targetPosition, 'level', playerNavMeshGroup);
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
	        // }
	    },


    	update: function( deltaTime ) {

            // patrolJS
            // if (!level) {
            // if (level.length == 0 ) {
            //     return;
            // }
            // level, calculatedPath, player
            var targetPosition;

            timebuffer += deltaTime;
            if ( timebuffer > 1 ) {
            	timebuffer = 0;
            	this.calculatePath( this.mesh.position, this.target.position );
            }

            if (calculatedPath && calculatedPath.length) {
                targetPosition = calculatedPath[0];

                var vel = targetPosition.clone().sub(this.mesh.position);

                // console.log("moving enemy", this.mesh.position, targetPosition );
                // character.animations.walk();

                if (vel.lengthSq() > 0.05 * 0.05) {
                    vel.normalize();
                    // Mve player to target
                    this.mesh.position.add(vel.multiplyScalar(deltaTime * this._speed));
                }
                else {
                    // Remove node from the path we calculated
                    calculatedPath.shift();
                }
            }
            else {
                // character.animations.idle();
            }

    	}

	};

	var timebuffer = 0;


	return Enemy;

});