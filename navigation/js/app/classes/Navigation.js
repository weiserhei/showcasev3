define(function (require) {

    'use strict';

    var	THREE = require('three');
    var	camera = require('camera');
    var	scene = require('scene');
    var dg = require('debugGUI');
    var Enemy = require('classes/Enemy');
    var	loadingManager = require('loadingManager');

    // patrol JS
    var raycaster = new THREE.Raycaster(),
        mouse = new THREE.Vector2(),
        level = [],
        calculatedPath = null;

    var enemy;

    function Navigation() {

        this._tempQuaternion = new THREE.Quaternion();

    	document.addEventListener( 'mousedown', this._onDocumentMouseClick.bind( this ), false );
	    
    	this._speed = 5;
        this._rotationAxis = new THREE.Vector3( 0, 0, 1 );

		var geometry = new THREE.BoxGeometry( 0.3, 0.3, 0.3 );
		var material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
		this._targetMarker = new THREE.Mesh( geometry, material );
		scene.add( this._targetMarker );
		// target.position.copy(player.position);

		var objLoader = new THREE.OBJLoader( loadingManager );
		var playground = "assets/maps/navmesh_playground/rendergeo_playground.obj";
		objLoader.load( playground, function callback( group ) {
			level.push( group.children[1] );
			level.push( group.children[2] );
			scene.add( group );
		});

		var jsonLoader = new THREE.JSONLoader();
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

    }

    var pathLines;

    Navigation.prototype = {

        setCharacter: function( character ) {

            this._character = character;
            this._pawn = character.getPawn();
			// character.getPawn().position.set(-3.5, 0.5, 5.5);

		    // Set the player's navigation mesh group
		    this._playerNavMeshGroup = patrol.getGroup('level', character.getPawn().position );


            var nav = this;
            var inputs = { 
                    x:0, 
                    y:0, 
                    z:0, 
                    calc: function() { 
                        nav.calculatePath( nav._pawn.position, new THREE.Vector3( inputs.x, inputs.y, inputs.z ) ); 
                    } 
                };
            dg.add( inputs, "x" );
            dg.add( inputs, "y" );
            dg.add( inputs, "z" );
            dg.add( inputs, "calc" );



        },
        _drawPathLines: function (fromPosition, calculatedPath) {

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
                geometry.vertices.push(calculatedPath[i].clone().add(new THREE.Vector3(0, 0.1, 0)));
            }

            pathLines = new THREE.Line( geometry, material );
            scene.add( pathLines );

            // Draw debug cubes except the last one. Also, add the player position.
            var debugPath = [fromPosition].concat(calculatedPath);

            for (var i = 0; i < debugPath.length - 1; i++) {
                geometry = new THREE.BoxBufferGeometry( 0.3, 0.3, 0.3 );
                // geometry = new THREE.SphereBufferGeometry( 0.1, 8, 8 );
                var material = new THREE.MeshBasicMaterial( {color: 0x00ffff} );
                var node = new THREE.Mesh( geometry, material );
                node.position.copy(debugPath[i]);
                pathLines.add( node );
            }
        },

        calculatePath: function( fromPosition, toPosition ) {

                this._targetMarker.position.copy( toPosition );

                // Calculate a path to the target and store it
                calculatedPath = patrol.findPath(fromPosition, toPosition, 'level', this._playerNavMeshGroup);
                console.log("calculated path", calculatedPath);

                if (calculatedPath && calculatedPath.length) {
                    this._drawPathLines( fromPosition, calculatedPath );
                }
        },

        getIntersection: function( event ) {

            mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

            camera.updateMatrixWorld();

            raycaster.setFromCamera( mouse, camera );
            var intersects = raycaster.intersectObjects( level );

            if ( intersects.length > 0 ) {
                return intersects[0].point;
            }
        },

        _onDocumentMouseClick: function (event) {
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
                    this.calculatePath( this._pawn.position, this.getIntersection( event ) );
                    break;
                default:
                    // alert('You have a strange Mouse!');
            }

        },

    	update: function( deltaTime ) {

            // MOVE this shit to character?

            // patrolJS
            // if (!level) {
            if (level.length == 0 || typeof this._character == 'undefined' ) {
                return;
            }

            var targetPosition;

            if (calculatedPath && calculatedPath.length) {
                targetPosition = calculatedPath[0];

                var vel = targetPosition.clone().sub( this._pawn.position );

                if (vel.lengthSq() > 0.05 * 0.05) {
                    vel.normalize();

                    // console.log("moving player");
                    this._character.run();

                    // Rotate Player to target
                    var lookVector = vel.clone();
                    lookVector.y = 0;
                    // character.getPawn().quaternion.setFromUnitVectors( this._rotationAxis, lookVector);
                    // SLERP for smooth rotation
                    this._tempQuaternion.setFromUnitVectors( this._rotationAxis, lookVector);
                    this._pawn.quaternion.slerp( this._tempQuaternion, deltaTime*10 );

                    // Move player to target
                    this._pawn.position.add(vel.multiplyScalar(deltaTime * this._speed));

                }
                else {
                    // Remove node from the path we calculated
                    calculatedPath.shift();
                }
            }
            else {
                // character.animations.idle();
                this._character.idle();
            }

    	}

    };

    return Navigation;
});
