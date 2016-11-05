/**
 * Core application handling
 * Initialize Viewer
 */
define([
    "three",
    "TWEEN",
    "scene",
    "camera",
    "renderer",
    "controls",
    "stats",
    "clock",
    "debugGUI",
    "tweenHelper",
    "skycube",
    "modelLoader"
], function ( 
             THREE, 
             TWEEN, 
             scene, 
             camera, 
             renderer, 
             controls, 
             stats, 
             clock,
             debugGUI, 
             tweenHelper,
             skycube,
             modelLoader
             ) {
	
	'use strict';

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
			},
			loadModel: function() {
				modelLoader.load( "Wache", "assets/models/wache/wache23_body_only.dae", function callback( dae ) {

					var material = new THREE.MeshStandardMaterial();
					material.skinning = true;

					// wache
					// dae.children[1].children[0].material.color.setHex( 0x00FF00 );

					dae.traverse( function ( child ) {

						if ( child instanceof THREE.SkinnedMesh ) {
							material.map = child.material.map;
							child.material = material;
						}
						
					} );

				});
			},
			loadMonster: function() {
				modelLoader.load( "Monster", "assets/models/monster/monster.dae", function callback( dae ) {
					dae.scale.multiplyScalar( 0.01 );
				});
			}
		};
		dg.add( options, "reset" ).name("Reset Camera");
		dg.add( options, "loadModel" ).name("Load Guard");
		dg.add( options, "loadMonster" ).name("Load Monster");

		// GRID FOR ORIENTATION
		var gridXZ = new THREE.GridHelper( 3, 10, new THREE.Color( 0xff0000 ), new THREE.Color( 0xffffff ) );
		scene.add(gridXZ);
		gridXZ.position.y = 0;
		gridXZ.visible = false;

		dg.add( gridXZ, "visible" ).name("Show Grid");

		/*
		var name = "Environment";
		if ( dg.__folders[ name ] ) {
			var folder = dg.__folders[ name ];
		} else {
			var folder = dg.addFolder( name );
		}
		*/

		// var cube = new THREE.Mesh( new THREE.BoxGeometry(1, 1, 1), new THREE.MeshPhongMaterial({ color: 0xffaa00 }) );
		// scene.add( cube );
		// cube.castShadow = true;
		// cube.position.set( 0, 0.5, 0 );

		// LIGHTS
		// SETUP STANDARD
		// spotlight #1 -- Hinten
		var spotlight1 = new THREE.SpotLight(0xffffff, 0.5);
		spotlight1.position.set(5,8,-38);
		spotlight1.target.position.set(0, 0, -1);
		scene.add(spotlight1.target);
		spotlight1.target.updateMatrixWorld();
		// spotlight1.shadowDarkness = 0.10;
		spotlight1.castShadow = false;
		scene.add(spotlight1);
		// var lightHelper = new THREE.SpotLightHelper( spotlight1 );
		// scene.add( lightHelper );
		// standardlicht.push(spotlight1);
		
		// spotlight #2 -- Oben mitte
		var spotlight2 = new THREE.SpotLight(0xffffcc, 1); // limit distance to 25 for fast falloff
		spotlight2.position.set(0,15,0);
		// spotlight2.shadowDarkness = 0.20;
		spotlight2.castShadow = true;
		spotlight2.shadow.mapSize.width = spotlight2.shadow.mapSize.height = 2048;
		spotlight2.shadow.camera.near = 10;
		spotlight2.shadow.camera.far = 16;
		spotlight2.shadow.camera.fov = 15;
		scene.add(spotlight2);

		// var helper = new THREE.CameraHelper( spotlight2.shadow.camera );
		// scene.add( helper );
		// var lightHelper = new THREE.SpotLightHelper( spotlight2 );
		// scene.add( lightHelper );
		// standardlicht.push(spotlight2);

		// spotlight #3 -- vorne
		var spotlight3 = new THREE.SpotLight(0xffffff, 1);
		// spotlight3.position.set(-12,2,18);
		spotlight3.position.set(-4,2,5);
		// spotlight3.target.position.set(2.5, 0.1, -4);
		spotlight3.target.position.set(2, 0.1, -2);
		scene.add(spotlight3.target);
	   	spotlight3.target.updateMatrixWorld(); // <==================================
		// spotlight3.shadowDarkness = 0.10;
		spotlight3.castShadow = true;
		// spotlight3.shadow.camera.near = 1;
		// spotlight3.shadow.camera.far = 50;
		spotlight3.shadow.mapSize.width = spotlight3.shadow.mapSize.height = 1024;
		spotlight3.shadow.camera.near = 1;
		spotlight3.shadow.camera.far = 20;
		spotlight3.shadow.camera.fov = 20;
		scene.add(spotlight3);
		// var lightHelper = new THREE.SpotLightHelper( spotlight3 );
		// scene.add( lightHelper );
		// standardlicht.push(spotlight3);
		// var helper = new THREE.CameraHelper( spotlight3.shadow.camera );
		// scene.add( helper );

		//Bodenstrahler
		var spotlight4 = new THREE.SpotLight(0xccccff, 0.5);
		spotlight4.position.set(0,-4,0);
		spotlight4.target.position.set(0,0,0);
		scene.add(spotlight4.target);
		// spotlight4.shadowDarkness = 0.10;
		spotlight4.castShadow = false;
		scene.add(spotlight4);
		spotlight4.target.updateMatrixWorld();
		// var lightHelper = new THREE.SpotLightHelper( spotlight4 );
		// scene.add( lightHelper );
		// standardlicht.push(spotlight4);

		// debugLights( spotlight1, "Spotlight1" );
		// debugLights( spotlight2, "Spotlight2" );
		// debugLights( spotlight3, "Spotlight3" );
		// debugLights( spotlight4, "Spotlight4" );

		function debugLights( light, name ) {
			dg.add( light, "intensity" ).min(0).max(2).name(name);
			dg.add( light, "visible" ).name(name+" visible");

			var lightHelper = new THREE.SpotLightHelper( light );
			scene.add( lightHelper );
			// var helper = new THREE.CameraHelper( light.shadow.camera );
			// scene.add( helper );

		}
		// var ambi = new THREE.AmbientLight(0xddddff, 0.1);
		// scene.add(ambi);
		// standardlicht.push(ambi);
		var ambi2 = new THREE.AmbientLight(0x555555, 0.5);
		scene.add(ambi2);
		// standardlicht.push(ambi2);

		/*
		//Spot von oben, rot links
		var spotRed = new THREE.SpotLight(0xaa0000, 1);
		spotRed.position.set(-6,10,2);
		spotRed.target.position.set(0, -0, 0);
		scene.add(spotRed.target);
		spotRed.castShadow = false;
		spotRed.shadowCameraVisible = false;
		// partylicht.push(spotRed);
		scene.add(spotRed);
		
		//Spot von oben, blau rechs
		var spotBlue = new THREE.SpotLight(0x0000aa, 1);
		spotBlue.position.set(0,10,10);
		spotBlue.target.position.set(0, -20, 0);
		scene.add(spotBlue.target);
		spotBlue.castShadow = false;
		spotBlue.shadowCameraVisible = false;
		// partylicht.push(spotBlue);
		scene.add(spotBlue);
		
		// TÜRKIS AKZENT VOM BODEN AUS HINTEN RECHTS
		var spotCyan = new THREE.SpotLight(0x33ffff, 1, 12);
		spotCyan.position.set(8,-3,-0);
		spotCyan.target.position.set(0, 0, 0);
		scene.add(spotCyan.target);
		spotCyan.castShadow = false;
		spotCyan.shadowCameraVisible = false;
		// partylicht.push(spotCyan);
		scene.add(spotCyan);
		
		//BODEN STRAHLER VORNE RECHTS
		var spotCyan2 = new THREE.SpotLight(0x33ffff, 1, 12);
		spotCyan2.position.set(0,-3,8);
		spotCyan2.target.position.set(0, 0, 0);
		scene.add(spotCyan2.target);
		spotCyan2.castShadow = false;
		spotCyan2.shadowCameraVisible = false;
		// partylicht.push(spotCyan2);
		scene.add(spotCyan2);
		*/

		// LOAD JSON OBJECTS
		var loader = new THREE.JSONLoader();
		loader.load("assets/models/podest/podest.js", 
			function callback(geometry, materials) {

				var material = new THREE.MeshPhongMaterial();

				var path = "assets/models/podest/";
				var tLoader = new THREE.TextureLoader();
				var T_diffuse = tLoader.load( path+"wood_mac.jpg" );
				var T_normal = tLoader.load( path+"wood_normal.jpg");
				var T_specular = tLoader.load( path+"11357.jpg" );

				material.map = T_diffuse;
				material.specularMap = T_specular;
				material.normalMap = T_normal;

				material.shininess = 5;
				material.specular.setHex( 0x111111 );

				var mesh = new THREE.Mesh( geometry, material );
				mesh.scale.multiplyScalar( 0.6 );

				var box = new THREE.Box3().setFromObject( mesh )
				var boundingBoxSize = box.max.sub( box.min );
				var height = boundingBoxSize.y;
				mesh.position.set(0, -height/2, 0);
				
				mesh.rotation.y = Math.PI / 2.5 ;
				mesh.receiveShadow = true;
				scene.add( mesh );

				dg.add( mesh, "visible" ).name("Show Stand");
							
			}
		);

	};

	// function isset(variable) {
	// 	return typeof variable !== typeof undefined ? true : false;
	// }

	// MAIN LOOP
    var animate = function () {

		TWEEN.update();
		controls.update();
		stats.update();
		modelLoader.update(); //update Skeleton helper
		THREE.AnimationHandler.update( clock.getDelta() );

		skycube.update( camera, renderer );
		renderer.render( scene, camera );

		requestAnimationFrame( animate );

    };

    return {
        initialize: initialize,
        animate: animate
    }
});