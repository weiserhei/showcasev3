/**
 * Setup the control method
 */
define(["three","debugGUI","scene", "tweenHelper", "ColladaLoader"], 
       function (THREE, debugGUI, scene, tweenHelper, ColladaLoader) {

    'use strict';

	var modelGroup = new THREE.Group();
	scene.add( modelGroup );

	var dg = debugGUI;
	var folder = [];
	var skeletonHelper;
	var activeCharacter;

	// var kfAnimations = [];
	// var kfAnimationsLength;

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

		scene.remove( skeletonHelper );

	}

    function Character( url, name, onLoad ){

    	this._url = url;
    	this._name = name;
    	this._onLoad = onLoad;
    	// this._mesh = null; //?
    	this.handlers = [];  // callbacks

    }

    Character.prototype = {

		subscribeOnLoad: function(fn) {
		    this.handlers.push(fn);
		},
		unsubscribe: function(fn) {
		    this.handlers = this.handlers.filter(
		        function(item) {
		            if (item !== fn) {
		                return item;
		            }
		        }
		    );
		},
		fire: function(o, thisObj) {
		    var scope = thisObj || window;
		    this.handlers.forEach(function(item) {
		        item.call(scope, o);
		    });
		},

    	getName: function() {
    		return this._name;
    	},
    	update: function( deltaTime ) {
			// skeletonHelper.update();
    	},
    	load: function () {

			cleanUp();

			var self = this;

			// Add new Folder to the GUI
			var newFolder = dg.addFolder( this._name );
			newFolder.open();
			folder.push( this._name );

			colladaLoader.load( this._url, function ( collada ) {

				var dae = collada.scene;

				// prep animations
				/*
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

				if ( kfAnimationsLength > 0 ) {

					self.update = function( deltaTime ) {
						for ( var i = 0; i < kfAnimationsLength; ++i ) {
							console.log("updateing af");
							kfAnimations[ i ].update( deltaTime );
						}
						
					}

				}
				// end prep
				// console.log( "animations", kfAnimations );
				*/

				dae.traverse( function ( child ) {

					if (child instanceof THREE.Mesh) {
						// enable casting shadows
						child.castShadow = true;
						// child.receiveShadow = true;

					}

					if ( child instanceof THREE.SkinnedMesh ) {
						// console.log( child );
						skeletonHelper = new THREE.SkeletonHelper( child );
						skeletonHelper.material.linewidth = 2;
						skeletonHelper.visible = false;
						scene.add( skeletonHelper );
						newFolder.add( skeletonHelper, "visible" ).name("Show Skeletton");

						self.update = function() {
							skeletonHelper.update();
						}

						var animation = new THREE.Animation( child, child.geometry.animation );
						animation.timeScale = 1/2 ; // add this
						animation.play( false );

						// newFolder.add( animation, "currentTime" );
						newFolder.add( animation, "timeScale" ).max(2).min(0.1);
						var aPlay = newFolder.add( animation, "play" ).name("Play "+animation.data.name);
						var aStop = newFolder.add( animation, "stop" ).name("Stop "+animation.data.name);

					}
					
				} );


				dae.updateMatrix();
				modelGroup.add( dae );
				if ( this._onLoad !== undefined ) {
					this._onLoad( dae );
				}
				// scene.add( dae );
				// console.log( dae );

				// var box = new THREE.Box3().setFromObject( mesh )
				// var boundingBoxSize = box.max.sub( box.min );
				// var height = boundingBoxSize.y;
				// camera.position.set( 0, height, 4 );
				// controls.target.copy( new THREE.Vector3( 0, 0.5, 0 ) );

				tweenHelper.fitObject( dae );

				// load complete
				this.fire( this );

			}.bind( this ) ); // bind the Model to access its callback
    	}

    };

    return Character;
});