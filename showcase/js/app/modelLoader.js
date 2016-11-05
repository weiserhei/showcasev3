/**
 * Load DAE Models
 * and add them to dat.GUI
 *
 */
define([
       'three',
       "scene", 
       "tweenHelper", 
       "debugGUI", 
       "ColladaLoader"
], function (THREE, scene, tweenHelper, debugGUI, ColladaLoader){

	var dg = debugGUI;

	// ugh - Animation loop
	var skeletonHelper = { update: function() {} };

	var modelGroup = new THREE.Group();
	scene.add( modelGroup );

	var folder = [];

	function loadModel( name, path, callback ) {

		// remove existing Folders from the gui
		for ( var j = 0; j < folder.length; j ++ ) {
			dg.removeFolder( folder[ j ] );
		}

		// remove existing models from the scene
		modelGroup.traverse( function ( child ) {
			// if ( child instanceof THREE.SkinnedMesh ) {
			modelGroup.remove( child );
			// }
		});

		// Add new Folder to the GUI
		var newFolder = dg.addFolder( name );
		newFolder.open();
		folder.push( name );

		var colladaLoader = new THREE.ColladaLoader();
		colladaLoader.options.convertUpAxis = true;
		colladaLoader.load( path, function ( collada ) {

			var dae = collada.scene;

			dae.traverse( function ( child ) {

				if (child instanceof THREE.Mesh) {
					// enable casting shadows
					child.castShadow = true;
					// child.receiveShadow = true;
				}

				if ( child instanceof THREE.SkinnedMesh ) {
					// console.log( child );

					scene.remove( skeletonHelper );
					skeletonHelper = new THREE.SkeletonHelper( child );
					skeletonHelper.material.linewidth = 2;
					skeletonHelper.visible = false;
					scene.add( skeletonHelper );

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
			modelGroup.add( dae );
			// scene.add( dae );
			// console.log( dae );

			// var box = new THREE.Box3().setFromObject( mesh )
			// var boundingBoxSize = box.max.sub( box.min );
			// var height = boundingBoxSize.y;
			// camera.position.set( 0, height, 4 );
			// controls.target.copy( new THREE.Vector3( 0, 0.5, 0 ) );

			tweenHelper.fitObject( dae );

		} );
	}

    return {
    		load: loadModel,
    		update: function() {
    			skeletonHelper.update();
    		}
    	};

});