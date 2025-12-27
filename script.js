document.addEventListener("keydown", handleKeydown);
document.addEventListener("keyup", deactivateKey);

let isEditing = false;
let keys = {};
let editedAction = null;
const activeKeys = {};
const shortcuts = {
    darkMode: {
        "Control": true,
        "d": "D",
        action: () => console.log("dark mode toggled"),
    },
    focusSearch: {
        "Control": true,
        "e": "E",
        action: () => console.log("search bar entered"),
    },
    mvSettings: {
        "Control": true,
        "f": "F",
        action: () => console.log("moved to settings"),
    }
}
const charMap = makeCharMap();

function toggleEditMode(e) {
    if(!isEditing) {
        isEditing = true;
        editedAction = shortcuts[e.target.dataset.action];
    } else {
        isEditing = false;
        commitEdit();

        keys = {};
        editedAction = null;
    }
}

function commitEdit() {
    for(const k in editedAction) {
        if(editedAction[k] !== editedAction.action) delete editedAction[k];
    }

    for(const k in keys) {
        editedAction[k] = keys[k];
    }
}

function handleKeydown(e) {
    const key = e.key;

    if(isEditing) {
        e.preventDefault();

        if(key === "Enter") {
            e.preventDefault();
            isEditing = false;
            commitEdit();

            keys = {};
            editedAction = null;
            return false;
        } else if(key === "Backspace") {
            keys = {};
        } else if(key === "Escape") {
            isEditing = false;

            keys = {};
            editedAction = null;
        } else {
            if(isLowercase(key)) {
                if(key in keys) return false;

                keys[key] = key.toUpperCase();
            } else if(isUpperCase(key)) {
                if(key.toLowerCase() in keys) return false;

                keys[key.toLowerCase()] = key;
            } else {
                if(key in keys) return false;

                keys[key] = true;
            }
        }

    }

    if(!isEditing && !(key in activeKeys)) {
        activeKeys[key] = true;
        detectShortcut(e, shortcuts.darkMode);
        detectShortcut(e, shortcuts.focusSearch);
        detectShortcut(e, shortcuts.mvSettings);
    }
}

function deactivateKey(e) {
    const key = e.key;

    delete activeKeys[key];
}

function detectShortcut(e, shortcut) {
    for(const k in shortcut) {
        if(shortcut[k] === shortcut.action) continue;
        if(k in activeKeys || shortcut[k] in activeKeys) continue;
        else return false;
    }

    e.preventDefault();
    shortcut.action();
}

function isLowercase(char) {
    return char === char.toLowerCase();
}

function isUpperCase(char) {
    return char === char.toUpperCase();
}

function makeCharMap() {
    const map = {};
    for(let i = 65; i < (65 + 26); i++) {
        const lowercaseKey = String.fromCharCode(i + 32);
        const uppercaseValue = String.fromCharCode(i);
        map[lowercaseKey] = uppercaseValue;
    }

    map["Control"] = "Ctrl";
    map[" "] = "Space";

    return map;
}