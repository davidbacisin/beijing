"use strict";

module.exports = class RegexMap {
	constructor(data) {
		this._map = new Map();
		for (let k of Object.keys(data)) {
			this._map.set(new RegExp(k), data[k]);
		}
	}
	
	get size() { return this._map.size; }
	
	find(val) {
		for (let pair of this._map) {
			if (pair[0].test(val)) {
				return pair[1];
			}
		}
		return null;
	}
	
	add(re, val) {
		this._map.set(new RegExp(re), val);
	}
}
