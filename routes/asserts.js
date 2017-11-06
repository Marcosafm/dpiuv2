module.exports = {

    assertPropertiesAreNullOrEmpty(object, ...couldBeEmptyProp) {
        let keys = Object.keys(object);
        for (i = 0; i < keys.length; i++) {
            if (!couldBeEmptyProp.includes(keys[i]))
                if (!object[keys[i]] || object[keys[i]] == "")
                    return false;
        }
        return true;
    }
}