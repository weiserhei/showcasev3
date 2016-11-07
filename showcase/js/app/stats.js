/**
 * Stats
 */
define(["Stats","container"], function (Stats, container) {

    'use strict';

    var stats = new Stats();

    container.appendChild( stats.domElement );
    // document.body.appendChild( stats.domElement );

    return stats;
});