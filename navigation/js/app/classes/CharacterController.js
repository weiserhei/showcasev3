/**
 * Setup the control method
define(["three","debugGUI"], 
       function (THREE, debugGUI) {
 */

define(function (require) {

    var debugGUI = require('debugGUI');
    var	Navigation = require('classes/Navigation');
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

    CharacterController.prototype = {

        setActive: function( character ) {
            this._activeCharacter = character;
            activeCharacter = character;
            navigation.setCharacter( character );
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
            navigation.update( deltaTime );
    	}

    };

    return CharacterController;
});