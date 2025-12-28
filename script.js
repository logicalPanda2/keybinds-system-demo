document.addEventListener("keydown", handleKeydown);
document.addEventListener("keyup", deactivateKey);

const activeKeysInfo = document.getElementById("activeKeys");
const lastKeyInfo = document.getElementById("lastKey");
const editingInfo = document.getElementById("editingState");
const typingInfo = document.getElementById("typingState");
const currentFocus = document.getElementById("currentFocus");
const input = document.getElementById("input");
const darkModeBtn = document.getElementById("darkModeBtn");
const darkModeEdit = document.getElementById("darkModeEdit");
const moveFocusEdit = document.getElementById("moveFocusEdit");
const resetAccessibilitySettingsEdit = document.getElementById("resetAccessibilitySettingsEdit")
const reducedMotionBtn = document.getElementById("reducedMotionToggle");
const highContrastBtn = document.getElementById("highContrastToggle");
const increasedFocusBtn = document.getElementById("increasedFocusToggle");
const errorDisplay = document.getElementById("errorMessage");

input.addEventListener("focus", assignFocus);
input.addEventListener("blur", assignFocus);
reducedMotionBtn.addEventListener("click", toggleReducedMotion);
reducedMotionBtn.addEventListener("click", toggleSwitch);
highContrastBtn.addEventListener("click", toggleHighContrast);
highContrastBtn.addEventListener("click", toggleSwitch);
increasedFocusBtn.addEventListener("click", toggleIncreasedFocus);
increasedFocusBtn.addEventListener("click", toggleSwitch);
darkModeBtn.addEventListener("click", toggleDarkMode);
darkModeEdit.addEventListener("click", toggleEditMode);
moveFocusEdit.addEventListener("click", toggleEditMode);
resetAccessibilitySettingsEdit.addEventListener("click", toggleEditMode);
window.addEventListener("click", changeFocus);
window.addEventListener("DOMContentLoaded", checkWidth);

let isEditing = false;
let isTyping = false;
let keys = {};
let editedAction = null;
let editedActionInfo = null;
const activeKeys = {};
const shortcuts = {
    darkMode: {
        "Control": true,
        "d": "D",
        action: () => toggleDarkMode(),
    },
    focusSearch: {
        "Control": true,
        "k": "K",
        action: () => input.focus(),
    },
    resetAccessibilitySettings: {
        "Control": true,
        "q": "Q",
        action: () => resetAccessibilitySettings(),
    },
}
const charMap = makeCharMap();

function toggleEditMode(e) {
    if(!isEditing) {
        isEditing = true;
        editedAction = shortcuts[e.target.dataset.action];
        editedActionInfo = document.getElementById(`${e.target.dataset.infoId}`);

        updateElementText(editingInfo, isEditing, false);
    } else {
        if(!Object.keys(keys).length) {
            updateElementText(errorDisplay, "Cannot edit a shortcut with no keys. To exit edit mode, press the Escape key.", false);
            errorDisplay.classList.add("invalid");
            errorDisplay.classList.remove("valid");
            return false;
        }

        isEditing = false;
        commitEdit();

        keys = {};
        editedAction = null;
        editedActionInfo = null;

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
            updateElementText(errorDisplay, "No errors detected", false);
            errorDisplay.classList.remove("invalid");
            errorDisplay.classList.add("valid");

            if(!Object.keys(keys).length) {
                updateElementText(errorDisplay, "Cannot edit a shortcut with no keys. To exit edit mode, press the Escape key.", false);
                errorDisplay.classList.add("invalid");
                errorDisplay.classList.remove("valid");
                return false;
            }

            e.preventDefault();
            isEditing = false;
            commitEdit();

            keys = {};
            editedAction = null;
            editedActionInfo = null;

            updateElementText(editingInfo, isEditing, false);
        } else if(key === "Backspace") {
            keys = {};
        } else if(key === "Escape") {
            updateElementText(errorDisplay, "No errors detected", false);
            errorDisplay.classList.remove("invalid");
            errorDisplay.classList.add("valid");

            updateElementText(editedActionInfo, null, false);
            for(const key in editedAction) {
                if(editedAction[key] !== editedAction.action)
                updateElementText(editedActionInfo, ` ${charMap[key] ? charMap[key] : key} `, true);
            }

            isEditing = false;
            keys = {};
            editedAction = null;
            editedActionInfo = null;

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
        
            updateElementText(editedActionInfo, null, false);
            for(const key in keys) {
                updateElementText(editedActionInfo, ` ${charMap[key] ? charMap[key] : key} `, true);
            }
        }
    }

    if(
        !isEditing &&
        !(key in activeKeys)) {
        activeKeys[key] = true;
        detectShortcut(e, shortcuts.darkMode);
        detectShortcut(e, shortcuts.focusSearch);
        detectShortcut(e, shortcuts.resetAccessibilitySettings)

        const content = activeKeysInfo.textContent.trim();
        if(content === "none") {
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
        updateElementText(activeKeysInfo, "none", false);
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

function checkWidth() {
    if(window.innerWidth <= 752) {
        disableKeybindEdit();
    }
}

function disableKeybindEdit() {
    darkModeEdit.setAttribute("disabled", "");
    moveFocusEdit.setAttribute("disabled", "");
    resetAccessibilitySettingsEdit.setAttribute("disabled", "");
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
    e.currentTarget.ariaPressed === "false" ? 
    e.currentTarget.setAttribute("aria-pressed", "true") : 
    e.currentTarget.setAttribute("aria-pressed", "false");
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

function resetAccessibilitySettings() {
    document.body.classList.remove("reduced-motion");
    document.body.classList.remove("high-contrast");
    document.body.classList.remove("increased-focus");
    reducedMotionBtn.classList.remove("active");
    reducedMotionBtn.setAttribute("aria-pressed", "false");
    highContrastBtn.classList.remove("active");
    highContrastBtn.setAttribute("aria-pressed", "false");
    increasedFocusBtn.classList.remove("active");
    increasedFocusBtn.setAttribute("aria-pressed", "false");
}

function toggleDarkMode() {
    document.body.classList.toggle("dark");
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