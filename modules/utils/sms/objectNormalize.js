async function normalize(object) {
    this.drillDown = (obj) => {
        let keys = Object.keys(obj);
        for (k in keys) {
            var key = keys[k];
            if ((Object.keys(obj[key]).length === 0)) {
                obj[key] = {
                    _val: obj[key]
                };
            } else {
                obj[key] = this.drillDown(obj[key]);
            }
        }
        return obj
    }
    return this.drillDown(object);
}

module.exports = normalize