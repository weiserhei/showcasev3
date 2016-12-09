/**
 * Weapon Class
 *
 *
 */
define(['three'], function (THREE){

	function Weapon( name, attackDamage ) {

		this.name = name;
		this.attackDamage = attackDamage;

	}

	return Weapon;

});