/**
 * Setup the control method
 */
define(["three","debugGUI"], 
       function (THREE, debugGUI) {

    'use strict';

    var dg = debugGUI;
    var guiFolder = dg.addFolder("Models");
    guiFolder.open();

    var activeCharacter = { update: function() {} }; // dummy function for update

    function CharacterController(){
    	this._activeCharacter = { update: function() {} };
    }

    CharacterController.prototype = {

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
    	}

    };

    return CharacterController;
});