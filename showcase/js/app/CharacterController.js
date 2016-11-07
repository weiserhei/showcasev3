/**
 * Setup the control method
 */
define(["three","debugGUI"], 
       function (THREE, debugGUI) {

    'use strict';

    var dg = debugGUI;
    var activeCharacter = { update: function() {} };

    function CharacterController(){

    }

    CharacterController.prototype = {

    	setActive: function( character ) {
    		// console.log("set active this", this, dg );
    		// this._activeCharacters.push( character );
    		activeCharacter = character;
    	},
   //  	disable: function( character ) {
			// var index = activeCharacters.indexOf(character);
			// if (index > -1) {
			//     array.splice(index, 1);
			// }
   //  	},
    	add: function( character ) {
    		dg.add( character, "load" ).name("Load "+character.getName());
    		character.subscribeOnLoad( this.setActive );
    	},
    	/*
    	load: function( character ) {
    		character.load();
    	},
    	*/
    	update: function( deltaTime ) {
			// this._activeCharacters[ i ].update( deltaTime );
			activeCharacter.update( deltaTime );
    	}

    };

    return CharacterController;
});