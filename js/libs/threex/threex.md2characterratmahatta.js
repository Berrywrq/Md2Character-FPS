/// <reference path="./threex.md2character.js" />

var THREEx = THREEx || {}

/**
 * widely inspired from MD2Character.js from alteredq / http://alteredqualia.com/
 *
 * @name THREEx.MD2Character
 * @class
*/
THREEx.MD2CharacterRatmahatta = function () {
	this.onload = onload;
	// update function
	var onRenderFcts = [];
	this.update = function (delta, now) {
		onRenderFcts.forEach(function (onRenderFct) {
			onRenderFct(delta, now)
		})
	}

	//////////////////////////////////////////////////////////////////////////
	//									//
	//////////////////////////////////////////////////////////////////////////

	var character = new THREE.MD2Character()
	this.character = character
	onRenderFcts.push(function (delta) {
		character.update(delta)
	})


	//////////////////////////////////////////////////////////////////////////
	//									//
	//////////////////////////////////////////////////////////////////////////
	var controls = new THREEx.MD2CharacterControls(character.object3d)
	this.controls = controls
	onRenderFcts.push(function (delta, now) {
		controls.update(delta, now)
	})

	//////////////////////////////////////////////////////////////////////////
	//									//
	//////////////////////////////////////////////////////////////////////////
	// load the data
	// - TODO make all this data cachable, thus 2 instances load only once
	// - take a microcache.js and put it in THREEx.MD2Character
	var config = {

		baseUrl: "models/ratamahatta/",

		body: "ratamahatta.md2",
		skins: ["ratamahatta.png", "ctf_b.png", "ctf_r.png", "dead.png", "gearwhore.png"],
		weapons: [["weapon.md2", "weapon.png"],
		["w_bfg.md2", "w_bfg.png"],
		["w_blaster.md2", "w_blaster.png"],
		["w_chaingun.md2", "w_chaingun.png"],
		["w_glauncher.md2", "w_glauncher.png"],
		["w_hyperblaster.md2", "w_hyperblaster.png"],
		["w_machinegun.md2", "w_machinegun.png"],
		["w_railgun.md2", "w_railgun.png"],
		["w_rlauncher.md2", "w_rlauncher.png"],
		["w_shotgun.md2", "w_shotgun.png"],
		["w_sshotgun.md2", "w_sshotgun.png"]
		]

	};
	character.loadParts(config);

	//////////////////////////////////////////////////////////////////////////
	//									//
	//////////////////////////////////////////////////////////////////////////

	var skinIndexes = {
		ratamahatta: 0,
		ctf_b: 1,
		ctf_r: 2,
		dead: 3,
		gearwhore: 4,
	}
	this.skinNames = Object.keys(skinIndexes)
	this.setSkinName = function (skinName) {
		console.assert(skinIndexes[skinName] !== undefined)
		character.setSkin(skinIndexes[skinName])
	}


	//////////////////////////////////////////////////////////////////////////
	//									//
	//////////////////////////////////////////////////////////////////////////
	var weaponIndexes = {
		none: -1,
		weapon: 0,
		w_bfg: 1,
		w_blaster: 2,
		w_chaingun: 3,
		w_glauncher: 4,
		w_hyperblaster: 5,
		w_machinegun: 6,
		w_railgun: 7,
		w_rlauncher: 8,
		w_shotgun: 9,
		w_sshotgun: 10,
	}
	this.weaponNames = Object.keys(weaponIndexes)
	this.setWeaponName = function (weaponName) {
		console.assert(weaponIndexes[weaponName] !== undefined)
		character.setWeapon(weaponIndexes[weaponName])
	}

	//////////////////////////////////////////////////////////////////////////
	//									//
	//////////////////////////////////////////////////////////////////////////

	// obtained from Object.keys(character.meshBody.geometry.animations) AFTER loading
	var animationNames = ["stand", "run", "attack", "pain", "jump", "flip", "salute", "taunt", "wave", "point", "crstand", "crwalk", "crattack", "crpain", "crdeath", "death"]
	this.animationNames = animationNames
	this.setAnimationName = function (animationName) {
		console.assert(animationNames.indexOf(animationName) !== -1)
		character.setAnimation(animationName)
	}
}

THREEx.MD2CharacterRatmahatta.baseUrl = '../'

