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

	var animation;

	var kfAnimations = [];
	var kfAnimationsLength;

	var colladaLoader = new THREE.ColladaLoader();
	colladaLoader.options.convertUpAxis = true;

	function cleanUp() {

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

	}

	function loadModel( name, path, callback ) {

		cleanUp();

		// Add new Folder to the GUI
		var newFolder = dg.addFolder( name );
		newFolder.open();
		folder.push( name );

		colladaLoader.load( path, function ( collada ) {

			var dae = collada.scene;

			// prep animations
			var animations = collada.animations;
			kfAnimationsLength = animations.length;

			// KeyFrame Animations

			for ( var i = 0; i < kfAnimationsLength; ++i ) {

				var animation = animations[ i ];

				var kfAnimation = new THREE.KeyFrameAnimation( animation );
				kfAnimation.timeScale = 1;
				kfAnimations.push( kfAnimation );

			}

			for ( var i = 0; i < kfAnimationsLength; ++i ) {

				var animation = kfAnimations[i];

				for ( var h = 0, hl = animation.hierarchy.length; h < hl; h++ ) {

					var keys = animation.data.hierarchy[ h ].keys;
					var sids = animation.data.hierarchy[ h ].sids;
					var obj = animation.hierarchy[ h ];

					if ( keys.length && sids ) {

						for ( var s = 0; s < sids.length; s++ ) {

							var sid = sids[ s ];
							var next = animation.getNextKeyWith( sid, h, 0 );

							if ( next ) next.apply( sid );

						}

						obj.matrixAutoUpdate = false;
						animation.data.hierarchy[ h ].node.updateMatrix();
						obj.matrixWorldNeedsUpdate = true;

					}

				}

				animation.loop = true;
				animation.play();

			}
			// end prep

			console.log( "animations", kfAnimations );

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
					newFolder.add( skeletonHelper, "visible" ).name("Show Skeletton");

					animation = new THREE.Animation( child, child.geometry.animation );
					// animation.timeScale = 1/2 ; // add this
					animation.play( false );

					// newFolder.add( animation, "currentTime" );
					newFolder.add( kfAnimation, "timeScale" ).max(2).min(0.1);
					var aPlay = newFolder.add( kfAnimation, "play" ).name("Play "+animation.data.name);
					var aStop = newFolder.add( kfAnimation, "stop" ).name("Stop "+animation.data.name);

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
    		update: function( deltaTime ) {
    			skeletonHelper.update();

    			// var frameTime = ( timestamp - lastTimestamp ) * 0.001;

				// if ( progress >= 0 && progress < 48 ) {

					for ( var i = 0; i < kfAnimationsLength; ++i ) {
						kfAnimations[ i ].update( deltaTime );
					}

				// }

    			// frames: 
    			// 0/1 idle 
    			// 40 idle to walk 
    			// 50 walk 
    			// 90 walk to run 
    			// 100 run 
    			// 120 ||| 120 (basis: idle) attack 
    			// 141 (hold pose)  attack2 (holdpose) 
    			// 161 hold idle 
    			// 171  bis 191 mist
    			// 191 bis 211 die ani

    			/*
    			if( animation ) {

				    if (currentSequence == 'standing') {
				        if (animation.currentTime > 1.3) {
				            animation.stop();
				            animation.play(false, 0); // play the animation not looped, from 0s
				        }
				    } else if (currentSequence == 'walking') {
				        if (animation.currentTime <= 1.3 || animation.currentTime > 4) {
				            animation.stop();
				            animation.play(false, 1.3); // play the animation not looped, from 4s
				       }
				   }
				}
				*/

    		}
    	};

});