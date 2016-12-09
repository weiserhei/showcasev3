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

	var model = null;

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

	var playerNavMeshGroup = 0;
	var pathLines;
	var calculatedPath = null;

	function Enemy() {

		this.mesh = model.clone();
		scene.add( this.mesh );

		this._speed = 4;
		this._target = null;

		this._rotationAxis = new THREE.Vector3( 0, 0, 1 );

	}

	Enemy.prototype = {

		setTarget: function( targetMesh ) {

			this.mesh.position.copy( targetMesh.position );
			this._target = targetMesh;

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
	        // }

	        return calculatedPath;
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
            	calculatedPath = this.calculatePath( this.mesh.position, this._target.position );
            }

            if (calculatedPath && calculatedPath.length) {
                targetPosition = calculatedPath[0];

                var vel = targetPosition.clone().sub(this.mesh.position);

                // console.log("moving enemy", this.mesh.position, targetPosition );
                // character.animations.walk();

                if (vel.lengthSq() > 0.05 * 0.05) {
                    vel.normalize();
                    
                    var lookVector = vel.clone();
                    lookVector.y = 0;
                    // console.log( lookVector );

                    // character.getPawn().quaternion.setFromUnitVectors( this._rotationAxis, lookVector);

                    // SLERP for smooth rotation
                    var slerp = new THREE.Quaternion().setFromUnitVectors( this._rotationAxis, lookVector );
                    slerp.multiply( new THREE.Quaternion( 0, -0.7071, 0, 0.7071 ) );
                    this.mesh.quaternion.slerp( slerp, deltaTime*10 );

                    // Move player to target
                    this.mesh.position.add( vel.multiplyScalar(deltaTime * this._speed) );

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