/**
 * Simple Gui for Debugging
 * and tweaking values
 */

define([
    "three",
    "dat",
], function (THREE,dat) {

    'use strict';

    dat.GUI.prototype.addThreeColor=function(obj,varName){
        // threejs & dat.gui have color incompatible formats so we use a dummy data as target :
        var dummy={};
        // set dummy initial value :
        dummy[varName]=obj[varName].getStyle(); 
        return this.addColor(dummy,varName)
            .onChange(function( colorValue  ){
                //set color from result :
                obj[varName].setStyle(colorValue);
            });
    };
    dat.GUI.prototype.addThreeUniformColor=function(material,uniformName,label){
        return this.addThreeColor(material.uniforms[uniformName],"value").name(label||uniformName);
    };

    dat.GUI.prototype.removeFolder = function(name) {
      var folder = this.__folders[name];
      if (!folder) {
        return;
      }
      folder.close();
      this.__ul.removeChild(folder.domElement.parentNode);
      delete this.__folders[name];
      this.onResize();
    }

    var gui = new dat.GUI();
    var folder = gui.addFolder("Debug Menu");
    folder.open();

    return folder;

});