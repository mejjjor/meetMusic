var riot = require('riot')
var todo = require('./todo.tag')
import MyClass from './MyClass' 


var domReady = function(callback) {
    document.readyState === "interactive" || document.readyState === "complete" ? callback() : document.addEventListener("DOMContentLoaded", callback);
};

domReady(function() {
    riot.mount(todo)
    var myClass = new MyClass("Erik")
    document.getElementById("title").innerHTML += ", " + myClass.getAttr()
});
