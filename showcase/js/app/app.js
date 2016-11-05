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
    "ColladaLoader",
    "js/libs/three/loaders/collada/Animation.js",
	"js/libs/three/loaders/collada/AnimationHandler.js",
	"js/libs/three/loaders/collada/KeyFrameAnimation.js"
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
             ColladaLoader
             ) {
	
	'use strict';

	var skeletonHelper;

	// Start program
    var initialize = function () {

    	var models = new THREE.Group();
    	scene.add( models );

    	var animations = [];
    	var folder = [];

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
				loadModel( "Wache", "assets/models/wache/wache23_body_only.dae");
			},
			loadMonster: function() {
				loadModel( "Monster", "assets/models/monster/monster.dae", function callback( dae ) {
					dae.scale.multiplyScalar( 0.01 );
				});
			},
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

		/*
		var al =  new THREE.AmbientLight( 0xffffff, 0.3 );
		scene.add( al );

		var light = new THREE.SpotLight(0xffaa00, 0.8);
		light.position.set( 0, 5, 0 );
		scene.add( light );
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
		spotlight3.position.set(-12,1,18);
		spotlight3.target.position.set(2.5, -2, -4);
		scene.add(spotlight3.target);
	   	spotlight3.target.updateMatrixWorld(); // <==================================
		// spotlight3.shadowDarkness = 0.10;
		spotlight3.castShadow = true;
		// spotlight3.shadow.camera.near = 1;
		// spotlight3.shadow.camera.far = 50;
		spotlight3.shadow.mapSize.width = spotlight3.shadow.mapSize.height = 1024;
		scene.add(spotlight3);
		// var lightHelper = new THREE.SpotLightHelper( spotlight3 );
		// scene.add( lightHelper );
		// standardlicht.push(spotlight3);

		//Bodenstrahler
		var spotlight4 = new THREE.SpotLight(0xccccff, 0.5);
		spotlight4.position.set(0,-4,0);
		spotlight4.target.position.set(0,0,0);
		scene.add(spotlight4.target);
		// spotlight4.shadowDarkness = 0.10;
		spotlight4.castShadow = false;
		scene.add(spotlight4);
		// var lightHelper = new THREE.SpotLightHelper( spotlight4 );
		// scene.add( lightHelper );
		// standardlicht.push(spotlight4);

		// var ambi = new THREE.AmbientLight(0xddddff, 0.1);
		// scene.add(ambi);
		// standardlicht.push(ambi);
		var ambi2 = new THREE.AmbientLight(0x555555, 0.5);
		scene.add(ambi2);
		// standardlicht.push(ambi2);



		// LOAD JSON OBJECTS
		var loader = new THREE.JSONLoader();
		loader.load("assets/models/podest/podest.js", 
			function callback(geometry, materials) {

				var material = new THREE.MeshStandardMaterial();
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

		function loadModel( name, path, callback ) {

			// remove existing Folders from the gui
			for ( var j = 0; j < folder.length; j ++ ) {
				dg.removeFolder( folder[ j ] );
			}

			// remove existing models from the scene
			models.traverse( function ( child ) {
				// if ( child instanceof THREE.SkinnedMesh ) {
				models.remove( child );
				// }
			});

			// Add new Folder to the GUI
			var newFolder = dg.addFolder( name );
			newFolder.open();
			folder.push( name );

			var material = new THREE.MeshLambertMaterial();

			var colladaLoader = new THREE.ColladaLoader();
			colladaLoader.options.convertUpAxis = true;
			colladaLoader.load( path, function ( collada ) {

				var dae = collada.scene;

				dae.traverse( function ( child ) {

					if (child instanceof THREE.Mesh) {

						// console.log( child.material );
						// apply custom material
						// child.material = material; // WTF
						
						// enable casting shadows
						child.castShadow = true;
						// child.receiveShadow = true;
					}

					if ( child instanceof THREE.SkinnedMesh ) {

						scene.remove( skeletonHelper );
						skeletonHelper = new THREE.SkeletonHelper( child );
						skeletonHelper.material.linewidth = 2;
						scene.add( skeletonHelper );

						child.material = material; // WTF
						var animation = new THREE.Animation( child, child.geometry.animation );
						animation.play();

						newFolder.add( skeletonHelper, "visible" ).name("Show Skeletton");
						var aPlay = newFolder.add( animation, "play" ).name("Play "+animation.data.name);
						var aStop = newFolder.add( animation, "stop" ).name("Stop "+animation.data.name);

					}

					
				} );

				if ( callback !== undefined ) {
					callback( dae );
				}

				dae.updateMatrix();
				models.add( dae );
				// scene.add( dae );
				// console.log( dae );

				// wache
				// dae.children[1].children[0].material.color.setHex( 0x00FF00 );

				// var box = new THREE.Box3().setFromObject( mesh )
				// var boundingBoxSize = box.max.sub( box.min );
				// var height = boundingBoxSize.y;
				// camera.position.set( 0, height, 4 );
				// controls.target.copy( new THREE.Vector3( 0, 0.5, 0 ) );

				tweenHelper.fitObject( dae );

			} );
		}

	};

	function isset(variable) {
		return typeof variable !== typeof undefined ? true : false;
	}

	// MAIN LOOP
    var animate = function () {

		TWEEN.update();
		controls.update();
		stats.update();
		if ( isset(skeletonHelper) ) {
			skeletonHelper.update();
		}
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