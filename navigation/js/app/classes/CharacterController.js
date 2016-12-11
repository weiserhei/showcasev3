/**
 * Setup the control method
define(["three","debugGUI"], 
       function (THREE, debugGUI) {
 */

define(function (require) {

    var debugGUI = require('debugGUI');
    var Navigation = require('classes/Navigation');
    var	Enemy = require('classes/Enemy');
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
                }
            }

            dg.add( o, "howMany" ).min(0).max(99);
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