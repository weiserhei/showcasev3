/**
 * Audio Listener
 *
 */
define(['three',"camera"], function (THREE,camera){

	// instantiate a listener
	var audioListener = new THREE.AudioListener();
	camera.add( audioListener );

    return audioListener;

});