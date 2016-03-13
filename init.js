/* global client, plugin */

// PLUGIN ENVIRONMENT //

plugin.id = "input-keys";

plugin.init =
function _init(glob) {
    this.major = 1;
    this.minor = 0;
    this.version = this.major + "." + this.minor + " (13 Mar 2016)";
    this.description = "Adds some common shortcut keys for entering text formatting. " +
        "By James Ross <chatzilla-plugins@james-ross.co.uk>.";

    this.onKeyPressHook = function() {
        this.onKeyPress.apply(this, arguments);
    }.bind(this);

    return "OK";
}

plugin.enable =
function _enable() {
    client.input.addEventListener("keypress", this.onKeyPressHook, false);
    return true;
}

plugin.disable =
function _disable() {
    client.input.removeEventListener("keypress", this.onKeyPressHook, false);
    return true;
}

plugin.charCodeToReplaceStart = {
    98: "%B", // Control-B
    117: "%U", // Control-U
    107: "%C", // Control-K
    111: "%O", // Control-O
};

plugin.charCodeToReplaceEnd = {
    98: "%B", // Control-B
    117: "%U", // Control-U
    107: "%C", // Control-K
    111: "", // Control-O
};

plugin.onKeyPress =
function _onkeypress(e) {
    var replaceStart = "";
    var replaceEnd = "";

    // If just Control is pressed, find the replacements for the key.
    if (!e.shiftKey && e.ctrlKey && !e.altKey && !e.metaKey && this.charCodeToReplaceStart[e.charCode]) {
        replaceStart = this.charCodeToReplaceStart[e.charCode];
        replaceEnd = this.charCodeToReplaceEnd[e.charCode];
    }

    if (replaceStart) {
        // Get current state of text and selection.
        var line = client.input.value;
        var start = client.input.selectionStart;
        var end = client.input.selectionEnd;
        if (replaceStart !== replaceEnd) {
            // If the start and end are different, try to be smart.
            var posStart = line.lastIndexOf(replaceStart, start);
            var posEnd = line.lastIndexOf(replaceEnd, start);
            if (posStart !== -1 && posStart > posEnd) {
                // Text before insertion point has starting modifier last, swap start/end modifiers.
                var temp = replaceStart;
                replaceStart = replaceEnd;
                replaceEnd = temp;
            }
        }
        if (start === end) {
            // No selection; insert the starting modifier.
            line = line.substr(0, start) + replaceStart + line.substr(start);
        } else {
            // Selection; wrap in starting and ending modifier.
            line = line.substr(0, start) + replaceStart + line.substr(start, end - start) + replaceEnd + line.substr(end);
        }
        start += replaceStart.length;
        end += replaceStart.length;
        // Set new state of text and selection.
        client.input.value = line;
        client.input.selectionStart = start;
        client.input.selectionEnd = end;
    }
}
