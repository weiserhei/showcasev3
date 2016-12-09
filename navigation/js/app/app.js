/**
 * Core application handling
 * Initialize Viewer
 */

define(function (require) {

	'use strict';

	var THREE = require("three"),
		TWEEN = require("TWEEN"),
		scene = require("scene"),
		camera = require("camera"),
		renderer = require("renderer"),
		controls = require("controls"),
		stats = require("stats"),
		clock = require("clock"),
		tweenHelper = require("tweenHelper"),
		ColladaLoader = require("ColladaLoader"),
		OBJLoader = require("OBJLoader"),
		Character = require("classes/Character"),
		CharacterController = require("classes/CharacterController"),
		audioListener = require("audioListener"),
		StateMachine = require("StateMachine"),
		loadingManager = require("loadingManager"),
	    debugGUI = require('debugGUI');
	    // patrol = require('../libs/patrol2');

	var characterController = new CharacterController(); // update sekeletons, add gui button
	var deltaTime = 0; // loop variable

	// DAE doesnt handle materials properly
	function getReplacedMaterials( material ) {

		var parameters = { roughness: 0.7, metalness: 0.2 };

		if ( material instanceof THREE.MultiMaterial ) {

			var replacedMaterial = new THREE.MultiMaterial();

			for( let i = 0; i < material.materials.length; i ++ ) {

				// var newMaterial = new THREE.MeshPhongMaterial();
				var newMaterial = new THREE.MeshStandardMaterial( parameters );
				newMaterial.map = material.materials[ i ].map;
				newMaterial.normalMap = material.materials[ i ].bumpMap;
				// console.log("material", newMaterial);
				// mm.materials[ i ] = newMaterial;
				replacedMaterial.materials.push( newMaterial );
				
			}

		} else if ( material instanceof THREE.Material ) {
			// var material = new THREE.MeshPhongMaterial();
			var replacedMaterial = new THREE.MeshStandardMaterial( parameters );
			replacedMaterial.skinning = true;
			replacedMaterial.map = material.map;
			replacedMaterial.normalMap = material.bumpMap;
		}

		return replacedMaterial;

	}


	// Start program
    var initialize = function () {

		// INITIAL CAMERA POSITION AND TARGET
		camera.position.set( 0, 1, 4 );
		controls.target.copy( new THREE.Vector3( 0, 0.5, 0 ) );

		// set Reset Values
		controls.target0 = controls.target.clone();
		controls.position0 = camera.position.clone();
		controls.zoom0 = camera.zoom;

		// DEBUG GUI
    	var dg = debugGUI;
		var options = {
			reset: function() { 
				tweenHelper.resetCamera( 600 );
			}
		};

		dg.add( options, "reset" ).name("Reset Camera");

		// GRID FOR ORIENTATION
		var gridXZ = new THREE.GridHelper( 3, 10, new THREE.Color( 0xff0000 ), new THREE.Color( 0xffffff ) );
		scene.add(gridXZ);
		gridXZ.position.y = 0;
		gridXZ.visible = false;

		dg.add( gridXZ, "visible" ).name("Show Grid");
		
		var monster = new Character( "assets/models/monster/monster.dae", "Monster", function callback( dae ) {
			dae.scale.multiplyScalar( 0.01 );
		} );
		// load manually or let CharacterController handle it
		// monster.load();
		characterController.add( monster );
		// var fryman = new Character("assets/models/fryman/fryman_animation.dae", "Fryman" );
		// characterController.add( fryman );

		var wache = new Character( "assets/models/wache/wache_body_only2.dae", "Wache", callbackWache );
		characterController.add( wache );

		function callbackWache ( dae ) {

			// var jsonLoader = new THREE.JSONLoader();

		    // jsonLoader.load( 'assets/maps/navmesh_demo/level.js', function( geometry, materials ) {
		    // jsonLoader.load( 'assets/maps/navmesh_playground/playground.json', function( geometry, materials ) {
		    // 	level = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
		    // 	scene.add(level);
		    // });

			// wache
			// dae.children[1].children[0].material.color.setHex( 0x00FF00 );
			// console.log( dae );

			// var shoulder_R = dae.children[1].children[0].children[0].children[0].children[0].children[1];
			// var hand_R = shoulder_R.children[0].children[0].children[0];
			// var hand_R = dae.getObjectByName("hand_R");
			var hand_L = dae.getObjectByName("hand_L");
			console.log("hand",hand_L);

			var item_L = dae.getObjectByName("item_L");
			console.log( "item bone", item_L);
			// dg.add( item_L.position, "x" );
			// hand_L.add( item_L );
			// item_L.updateMatrix();

			var weapons = new THREE.Group();
			// weapons.applyMatrix( item_L.matrix );
			// hand_L.add( weapons );
			item_L.add( weapons );
			
			dae.traverse( function ( child ) {

				if ( child instanceof THREE.SkinnedMesh ) {

					var material = getReplacedMaterials( child.material );
					child.material = material;

				}
				
			} );

		}

		// var wache2 = new Character( "assets/models/wache2/wache2_2.dae", "Wache 2", callbackWache2 );
		var wache2 = new Character( "assets/models/wache2/wache02shorts_idle_walking.dae", "Wache 2", callbackWache2 );
		characterController.add( wache2 );

		function callbackWache2( dae ) {
			dae.traverse( function ( child ) {
				if ( child instanceof THREE.Mesh ) {
					// console.log("child.material", child.material );
					var material = getReplacedMaterials( child.material );
					child.material = material;
				}
			} );
		}

		// LIGHTS
		var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
		hemiLight.color.setHSL( 0.6, 1, 0.6 );
		hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
		hemiLight.position.set( 0, 500, 0 );
		scene.add( hemiLight );

		//

		var dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
		dirLight.color.setHSL( 0.1, 1, 0.95 );
		dirLight.position.set( -1, 1.75, 1 );
		dirLight.position.multiplyScalar( 50 );
		scene.add( dirLight );

		// dirLight.castShadow = true;

		// dirLight.shadow.mapSize.width = 2048;
		// dirLight.shadow.mapSize.height = 2048;

		// var d = 50;

		// dirLight.shadow.camera.left = -d;
		// dirLight.shadow.camera.right = d;
		// dirLight.shadow.camera.top = d;
		// dirLight.shadow.camera.bottom = -d;

		// dirLight.shadow.camera.far = 3500;
		// dirLight.shadow.bias = -0.0001;

	};

	// MAIN LOOP
    var animate = function () {

    	deltaTime = clock.getDelta();

		TWEEN.update();
		controls.update();
		stats.update();
		characterController.update( deltaTime );
		THREE.AnimationHandler.update( deltaTime );
		renderer.render( scene, camera );

		requestAnimationFrame( animate );

    };

    return {
        initialize: initialize,
        animate: animate
    }
});