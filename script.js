document.addEventListener("keydown", handleKeydown);
document.addEventListener("keyup", deactivateKey);

const activeKeysInfo = document.getElementById("activeKeys");
const lastKeyInfo = document.getElementById("lastKey");
const editingInfo = document.getElementById("editingState");
const typingInfo = document.getElementById("typingState");
const currentFocus = document.getElementById("currentFocus");
const input = document.getElementById("input");
const darkModeBtn = document.getElementById("darkModeBtn");
const reducedMotionBtn = document.getElementById("reducedMotionToggle");
const highContrastBtn = document.getElementById("highContrastToggle");
const increasedFocusBtn = document.getElementById("increasedFocusToggle");
const focusable = [input, darkModeBtn, window];

input.addEventListener("focus", assignFocus);
input.addEventListener("blur", assignFocus);
reducedMotionBtn.addEventListener("click", toggleReducedMotion);
reducedMotionBtn.addEventListener("click", toggleSwitch);
highContrastBtn.addEventListener("click", toggleHighContrast);
highContrastBtn.addEventListener("click", toggleSwitch);
increasedFocusBtn.addEventListener("click", toggleIncreasedFocus);
increasedFocusBtn.addEventListener("click", toggleSwitch);
focusable.forEach(element => element.addEventListener("click", changeFocus));

let isEditing = false;
let isTyping = false;
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

        updateElementText(editingInfo, isEditing, false);
    } else {
        isEditing = false;
        commitEdit();

        keys = {};
        editedAction = null;

        updateElementText(editingInfo, isEditing, false);
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

            updateElementText(editingInfo, isEditing, false);
        } else if(key === "Backspace") {
            keys = {};
        } else if(key === "Escape") {
            isEditing = false;

            keys = {};
            editedAction = null;

            updateElementText(editingInfo, isEditing, false);
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

    if(
        !isEditing &&
        !isTyping && 
        !(key in activeKeys)) {
        activeKeys[key] = true;
        detectShortcut(e, shortcuts.darkMode);
        detectShortcut(e, shortcuts.focusSearch);
        detectShortcut(e, shortcuts.mvSettings);

        const content = activeKeysInfo.textContent.trim();
        if(content === "NONE") {
            updateElementText(activeKeysInfo, ` ${charMap[key] ? charMap[key] : key} `, false);
        } else {
            updateElementText(activeKeysInfo, ` ${charMap[key] ? charMap[key] : key} `, true);
        }

        updateElementText(lastKeyInfo, ` ${charMap[key] ? charMap[key] : key} `, false);
    }
}

function deactivateKey(e) {
    const key = e.key;

    delete activeKeys[key];

    updateElementText(activeKeysInfo, null, false);
    for(const k in activeKeys) {
        updateElementText(activeKeysInfo, ` ${charMap[k] ? charMap[k] : k} `, true);
    }

    const content = activeKeysInfo.textContent.trim();
    if(!content) {
        updateElementText(activeKeysInfo, "NONE", false);
    }
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

function changeFocus(e) {
    currentFocus.textContent = e.target.id ? e.target.id : "window";
}

function assignFocus(e) {
    if(e.type === "focus") {
        isTyping = true;
    } else {
        isTyping = false;
    }
    updateElementText(typingInfo, isTyping, false);
}

function toggleSwitch(e) {
    e.currentTarget.classList.toggle("active");
}

function toggleReducedMotion() {
    document.body.classList.toggle("reduced-motion");
}

function toggleHighContrast() {
    document.body.classList.toggle("high-contrast");
}

function toggleIncreasedFocus() {
    document.body.classList.toggle("increased-focus");
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

function updateElementText(HTMLElement, string, append) {
    append ?
    HTMLElement.textContent += string :
    HTMLElement.textContent = string;
}