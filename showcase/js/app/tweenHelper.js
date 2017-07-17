/**
 * Move Camera
 * fit viewspace to model size
 */
define([
       "three", 
       "TWEEN",
       "camera",
       "controls",
], function ( THREE, TWEEN, camera, controls ) {

    'use strict';

	function tweenVector ( source, target, time ) {

		var time = time || 800;
		// TWEEN.removeAll();
		return new TWEEN.Tween( source ).to( {
			x: target.x,
			y: target.y,
			z: target.z }, time )
			.easing( TWEEN.Easing.Sinusoidal.InOut )
			// .easing( TWEEN.Easing.Quadratic.InOut)
			// .easing( TWEEN.Easing.Elastic.Out)
			.start();
	}

	function fitObject ( object ) {

		var box = new THREE.Box3().setFromObject( object )

		var height = boundingBoxSize.y;

		if ( height == Number.POSITIVE_INFINITY || height == Number.NEGATIVE_INFINITY)
		{
			console.warn( "Bounding Box Height of Model results in Infinity" );
			return;
		}

		var offset = offset || 1;
		// adjusting camera position
		// to display model in full visible height

		var position = new THREE.Vector3( 0, height * 1.1 + object.position.y, calc_distance + offset );

		tweenVector ( camera.position, position );
		tweenVector ( controls.target, target );

		// set Reset Values
		controls.target0 = target.clone();
		controls.position0 = position.clone();
		controls.zoom0 = camera.zoom;

	}

	function resetCamera ( time ) {
		tweenVector( camera.position, controls.position0, time );
		tweenVector( controls.target, controls.target0, time );
		// Instant
		// camera.position.copy( controls.position0 );
		// controls.target.copy( controls.target0 );

	}

	return {
		tweenVector: tweenVector,
		fitObject: fitObject,
		resetCamera: resetCamera
	};

});