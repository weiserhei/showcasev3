define(function (require) {

    'use strict';

    var	THREE = require('three');
    var	camera = require('camera');
    var	scene = require('scene');
    var dg = require('debugGUI');
    var Enemy = require('classes/Enemy');
    var	loadingManager = require('loadingManager');
    var container = require("container");

    // patrol JS
    var raycaster = new THREE.Raycaster(),
        mouse = new THREE.Vector2(),
        intersectObject,
        level = [],
        calculatedPath = null,
        pathLines,
        target,
        playerNavMeshGroup,
        character;

    var enemy;

    function Navigation() {

    	//container.addEventListener( 'click', onDocumentMouseClick, false );
    	document.addEventListener( 'mousedown', onDocumentMouseClick, false );
	    
    	this._speed = 5;
        this._rotationAxis = new THREE.Vector3( 0, 0, 1 );

		// var obj = { add: function(){ 

							var geometry = new THREE.BoxGeometry( 0.3, 0.3, 0.3 );
							var material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
							target = new THREE.Mesh( geometry, material );
							scene.add( target );
							// target.position.copy(player.position);

							var objLoader = new THREE.OBJLoader( loadingManager );
							var playground = "assets/maps/navmesh_playground/rendergeo_playground.obj";
							objLoader.load( playground, function callback( group ) {
								level.push( group.children[1] );
								level.push( group.children[2] );
								scene.add( group );
							});

							var jsonLoader = new THREE.JSONLoader;
							// jsonLoader.load( 'assets/maps/navmesh_demo/level.nav.js', function( geometry, materials ) {
							jsonLoader.load( 'assets/maps/navmesh_playground/navmesh_playground.json', function( geometry, materials ) {
							    var zoneNodes = patrol.buildNodes(geometry);
							    patrol.setZoneData('level', zoneNodes);

						    	var mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
						    		color: 0xd79fd4,
						    		opacity: 0.5,
						    		transparent: true
						    	}));

						    	scene.add(mesh);

							});
						// }
		// };
		// dg.add( obj, "add" ).name("Load Nav");

    }

    Navigation.prototype = {

        // setLevel: function( leve ) {
        //     level = leve;
        // },
        // setNavMeshGroup: function( meshGroup ) {
        //     playerNavMeshGroup = meshGroup;
        // },
        setCharacter: function( characte ) {
        	character = characte;
			// character.getPawn().position.set(-3.5, 0.5, 5.5);
		    // // Set the player's navigation mesh group
		    // playerNavMeshGroup = patrol.getGroup('level', character.getPawn().position);

		    playerNavMeshGroup = patrol.getGroup('level', character.getPawn().position );

            enemy = new Enemy();
            enemy.setTarget( character.getPawn() );

        },

    	update: function( deltaTime ) {

            // MOVE this shit to character?

            // patrolJS
            // if (!level) {
            if (level.length == 0 || typeof character == 'undefined' ) {
                return;
            }

            enemy.update( deltaTime );

            // level, calculatedPath, player
            var targetPosition;

            if (calculatedPath && calculatedPath.length) {
                targetPosition = calculatedPath[0];

                var vel = targetPosition.clone().sub(character.getPawn().position);

                // console.log("moving player");
                character.run();

                if (vel.lengthSq() > 0.05 * 0.05) {
                    vel.normalize();

                    var lookVector = vel.clone();
                    lookVector.y = 0;
                    // console.log( lookVector );

                    // character.getPawn().quaternion.setFromUnitVectors( this._rotationAxis, lookVector);

                    // SLERP for smooth rotation
                    var slerp = new THREE.Quaternion().setFromUnitVectors( this._rotationAxis, lookVector);
                    character.getPawn().quaternion.slerp( slerp, deltaTime*10 );

                    // console.log( character.getPawn().rotation );

                    // Move player to target
                    character.getPawn().position.add(vel.multiplyScalar(deltaTime * this._speed));
                }
                else {
                    // Remove node from the path we calculated
                    calculatedPath.shift();
                }
            }
            else {
                // character.animations.idle();
                character.idle();
            }

    	}

    };

    function onDocumentMouseClick (event) {
        // event.preventDefault();
        //console.log( event.which );

        switch (event.which) {
            case 1:
                // alert('Left Mouse button pressed.');
                break;
            case 2:
                // alert('Middle Mouse button pressed.');
                break;
            case 3:
                // alert('Right Mouse button pressed.');
                calculatePath( event, character.getPawn().position, target.position );
                break;
            default:
                // alert('You have a strange Mouse!');
        }

    }

    function calculatePath( event, fromPosition, targetPosition ) {

        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        camera.updateMatrixWorld();

        raycaster.setFromCamera( mouse, camera );
        var intersects = raycaster.intersectObjects( level );

        if ( intersects.length > 0 ) {
            var vec = intersects[0].point;
            targetPosition.copy(vec);

            // Calculate a path to the target and store it
            // console.log("nav inputs", fromPosition, targetPosition, playerNavMeshGroup );
            calculatedPath = patrol.findPath(fromPosition, targetPosition, 'level', playerNavMeshGroup);
            // console.log("calculated path", calculatedPath);

            if (calculatedPath && calculatedPath.length) {

                if (pathLines) {
                    scene.remove(pathLines);
                }

                var material = new THREE.LineBasicMaterial({
                    color: 0x0000ff,
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
                    geometry = new THREE.BoxGeometry( 0.3, 0.3, 0.3 );
                    var material = new THREE.MeshBasicMaterial( {color: 0x00ffff} );
                    var node = new THREE.Mesh( geometry, material );
                    node.position.copy(debugPath[i]);
                    pathLines.add( node );
                }
            }
        }
    }

    return Navigation;
});
