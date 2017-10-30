'use strict';


function Storage(nameTable) {
    this.__table = {};
    try {
        this.__table = JSON.parse(localStorage.getItem(nameTable)) || {};
    } catch (e) {
        localStorage.setItem(nameTable, JSON.stringify(this.__table));
    }
    for (let _name in this.__table) {
        try {
            this[_name] = JSON.parse(localStorage.getItem(this.__table[_name]));
        } catch (e) {
            console.error(e);
            delete this.__table[_name];
            localStorage.setItem(nameTable, JSON.stringify(this.__table))
        }
    }


    this.set = function (name, val) {
        if (val !== undefined && name !== undefined) {
            this.__table[name] = nameTable + '_' + name;
            localStorage.setItem(this.__table[name], JSON.stringify(val));
            this[name] = val;
            try {
                localStorage.setItem(nameTable, JSON.stringify(this.__table));
            } catch (e) {
                console.error(e);
            }
            return this[name]
        } else {
            console.error('undefined', this, '\n', name, val)
        }
    };
    this.softSet = function (name, val) {
        if (!this[name]) {
            return this.set(name, val);
        }
    };

    this.del = function (name) {
        delete this.__table[name];
        delete this[name];
        localStorage.removeItem(this.__table[name]);
        try {
            localStorage.setItem(nameTable, JSON.stringify(this.__table));
        } catch (e) {
            console.error(e);
        }
    };

    this.forEach = function (fn) {
        for (let i in this.__table) {
            fn(this.__table[i], i)
        }
    };
}
