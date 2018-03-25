/** HOW TO USE _uglysettings.js
  * 0. <script src="0uglysettings.js" charset="utf-8"></script>
  * 1. make div#settings
  * 2. new UglySetting("label text here", "default value", options)
  */

function UglySetting(labelText, defaultValue, options) {
  this.wrapperElem = document.createElement("p");
  this.labelElem = document.createElement("label");
  this.inputElem = document.createElement(options.textarea ? "textarea" : "input");

  this.inputElem.value = defaultValue;
  this.labelElem.appendChild(document.createTextNode(labelText));

  this.wrapperElem.classList.add("ugly-setting-wrapper");
  this.wrapperElem.appendChild(this.labelElem);
  this.wrapperElem.appendChild(this.inputElem);

  this.type = options.type || null;

  if (options.addToDOM) this.addToDOM();
}
UglySetting.prototype.getValue = function() {
  if (this.type === "number") return +this.inputElem.value;
  else if (this.type === "boolean") return this.inputElem.value[0].toLowerCase() === "n";
  else return this.inputElem.value;
};
UglySetting.prototype.addToDOM = function() {
  if (!UglySetting.wrapper) UglySetting.wrapper = document.getElementById("settings");
  UglySetting.wrapper.appendChild(this.wrapperElem);
};
document.addEventListener("DOMContentLoaded", function() {
  UglySetting.wrapper = document.getElementById("settings");
}, false);
