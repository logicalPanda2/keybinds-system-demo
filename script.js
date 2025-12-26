document.addEventListener("keydown", activateKey);
document.addEventListener("keyup", deactivateKey);

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


function activateKey(e) {
    const key = e.key;

    if(!(key in activeKeys)) {
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