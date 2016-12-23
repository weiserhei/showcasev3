/**
 * Setup the control method
define(["three","debugGUI"], 
       function (THREE, debugGUI) {
 */

define(function (require) {

    var debugGUI = require('debugGUI');
    var Navigation = require('classes/Navigation');
    var	Enemy = require('classes/Enemy');

    var camera = require("camera");

	// return function () {};

    'use strict';

    var dg = debugGUI;
    var guiFolder = dg.addFolder("Models");
    guiFolder.open();

    var navigation = { update: function() {} }; // dummy function for update
    var activeCharacter = { update: function() {} }; // dummy function for update

    function CharacterController() {
    	this._activeCharacter = { update: function() {} };
        navigation = new Navigation();
    }

    var enemys = [];
    var raycastBoxes = [];

        var mouse = new THREE.Vector2();
        var raycaster = new THREE.Raycaster();

        document.addEventListener( 'mousedown', _onDocumentMouseClick, false );

        function getIntersection ( event ) {

            mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

            camera.updateMatrixWorld();

            raycaster.setFromCamera( mouse, camera );
            var intersects = raycaster.intersectObjects( raycastBoxes );

            if ( intersects.length > 0 ) {
                return intersects[0];
            }
        }

        function _onDocumentMouseClick (event) {
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
                    var element = getIntersection( event ).object;
                    console.log( element );
                    element.material.color = new THREE.Color( 0xFFAA00 );
                    break;
                default:
                    // alert('You have a strange Mouse!');
            }

        }

    CharacterController.prototype = {

        setActive: function( character ) {
            this._activeCharacter = character;
            activeCharacter = character;
            navigation.setCharacter( character );

            var o = {
                spawn: spawn,
                howMany: 0
            };
            function spawn() {
                for ( var i = 0; i < o.howMany; i ++ ) {
                    var enemy = new Enemy();
                    // enemy.setTarget( character.getPawn() );
                    enemys.push( enemy );
                    raycastBoxes.push( enemy.getBoundingBox() );
                }
            }

            dg.add( o, "howMany" ).min(0).max(999);
            dg.add( o, "spawn" ).name("Spawn them");

        },
   //   disable: function( character ) {
            // var index = activeCharacters.indexOf(character);
            // if (index > -1) {
            //     array.splice(index, 1);
            // }
   //   },
        add: function( character ) {
            guiFolder.add( character, "load" ).name("Load "+character.getName());
            character.subscribeOnLoad( this.setActive );
        },        
        addjs: function( character ) {
            guiFolder.add( character, "loadjs" ).name("Load "+character.getName());
            character.subscribeOnLoad( this.setActive );
    	},
    	/*
    	load: function( character ) {
    		character.load();
    	},
    	*/
    	update: function( deltaTime ) {
			activeCharacter.update( deltaTime );
            navigation.update( deltaTime, enemys );
            var length = enemys.length;
            if( length > 0 ) {
                for( let i = 0; i < enemys.length; i ++ ) {

                    if ( enemys[ i ].fsm.is("dead") ) {

                        // enemys[ i ].mesh.visible = false;
                        // var index = enemys.indexOf( enemys[ i ] );
                        // if (index > -1) {
                        //     enemys.splice(index, 1);
                        // }
                    }

                    enemys[ i ].update( deltaTime, enemys );
                }
            }
    	}

    };

    return CharacterController;
});