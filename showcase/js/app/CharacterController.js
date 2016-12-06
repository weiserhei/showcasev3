/**
 * Setup the control method
define(["three","debugGUI"], 
       function (THREE, debugGUI) {
 */

define(function (require) {

    var	debugGUI = require('debugGUI');
    var THREE = require("three");
    var camera = require("camera");
	var scene = require("scene");
	// return function () {};

    'use strict';

    var dg = debugGUI;
    var guiFolder = dg.addFolder("Models");
    guiFolder.open();

    var activeCharacter = { update: function() {} }; // dummy function for update

    // patrol JS
    var player,
        raycaster = new THREE.Raycaster(),
        intersectObject,
        level = [],
        calculatedPath = null,
        pathLines,
        mouse = new THREE.Vector2(),
        target,
        playerNavMeshGroup;
    
    document.addEventListener( 'click', onDocumentMouseClick, false );

    function onDocumentMouseClick (event) {
        // patrolJS
        // event.preventDefault();

        switch (event.which) {
            case 1:
                // alert('Left Mouse button pressed.');
                break;
            case 2:
                // alert('Middle Mouse button pressed.');
                break;
            case 3:
                // alert('Right Mouse button pressed.');
                calculatePath( event );
                break;
            default:
                // alert('You have a strange Mouse!');
        }

    }

    function calculatePath( event ) {

        var player = activeCharacter.getPawn();

        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        camera.updateMatrixWorld();

        raycaster.setFromCamera( mouse, camera );
        var intersects = raycaster.intersectObjects( level );

        if ( intersects.length > 0 ) {
            var vec = intersects[0].point;
            target.position.copy(vec);

            // Calculate a path to the target and store it
            calculatedPath = patrol.findPath(player.position, target.position, 'level', playerNavMeshGroup);
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
                geometry.vertices.push(player.position);

                // Draw debug lines
                for (var i = 0; i < calculatedPath.length; i++) {
                    geometry.vertices.push(calculatedPath[i].clone().add(new THREE.Vector3(0, 0.2, 0)));
                }

                pathLines = new THREE.Line( geometry, material );
                scene.add( pathLines );

                // Draw debug cubes except the last one. Also, add the player position.
                var debugPath = [player.position].concat(calculatedPath);

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

    function CharacterController(){
    	this._activeCharacter = { update: function() {} };
    }

    CharacterController.prototype = {

        setLevel: function( leve ) {
            level = leve;
        },
        setTarget: function( targ ) {
            target = targ;
        },
        setNavMeshGroup: function( meshGroup ) {
            playerNavMeshGroup = meshGroup;
        },

    	setActive: function( character ) {
    		this._activeCharacter = character;
    		activeCharacter = character;
    	},
   //  	disable: function( character ) {
			// var index = activeCharacters.indexOf(character);
			// if (index > -1) {
			//     array.splice(index, 1);
			// }
   //  	},
    	add: function( character ) {
    		guiFolder.add( character, "load" ).name("Load "+character.getName());
    		character.subscribeOnLoad( this.setActive );
    	},
    	/*
    	load: function( character ) {
    		character.load();
    	},
    	*/
    	update: function( deltaTime ) {
			activeCharacter.update( deltaTime );

            // patrolJS
            // if (!level) {
            if (level.length == 0) {
                return;
            }
            // level, calculatedPath, player
            var player = activeCharacter.getPawn();

            var speed = 5;
            var targetPosition;

            if (calculatedPath && calculatedPath.length) {
                targetPosition = calculatedPath[0];

                var vel = targetPosition.clone().sub(player.position);

                // console.log("moving player");
                activeCharacter.animations.walk();

                if (vel.lengthSq() > 0.05 * 0.05) {
                    vel.normalize();
                    // Mve player to target
                    player.position.add(vel.multiplyScalar(deltaTime * speed));
                }
                else {
                    // Remove node from the path we calculated
                    calculatedPath.shift();
                }
            }
            else {
                activeCharacter.animations.idle();
            }

    	}

    };

    return CharacterController;
});