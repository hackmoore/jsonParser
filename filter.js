const queryJson = (input, filters) => {
    const results = [];
    input.map((a) => {
        const fields = getFields(a);
        const potentialMatches = depthSearch(null, a, filters);
        potentialMatches.map((pm) => {
            let totalFound = 0;
            filters.map((filter) => {
                const found = pm.predicates.find((pmFilter) => { return pmFilter === filter; });
                if (found !== undefined) {
                    totalFound += 1;
                }
            });
            if (totalFound === filters.length) {
                results.push(pm.pairs);
            }
        });
    });
    return results;
};
const depthSearch = (prefix, obj, filters) => {
    let result = [];
    const baseFields = [];
    const basePredicates = [];
    if (obj == undefined || obj == null) {
        return [];
    }
    Object.keys(obj).map((k) => {
        const v = obj[k];
        const fullpath = (prefix === null) ? k : `${prefix}.${k}`;
        if (typeof v !== "object") {
            baseFields.push({
                key: fullpath,
                value: v,
            });
            filters.map((filter) => {
                if (filter(fullpath, v)) {
                    basePredicates.push(filter);
                }
            });
        }
    });
    Object.keys(obj).map((k) => {
        const v = obj[k];
        const fullpath = (prefix === null) ? k : `${prefix}.${k}`;
        if (typeof v === "object" && Array.isArray(v)) {
            v.map((element) => {
                const search = depthSearch(fullpath, element, filters);
                result = result.concat(search);
            });
        }
        else if (typeof v === "object") {
            const search = depthSearch(fullpath, v, filters);
            result = result.concat(search);
        }
    });
    if (result.length > 0) {
        result.map((pm) => {
            pm.pairs = pm.pairs.concat(baseFields);
            pm.predicates = pm.predicates.concat(basePredicates);
        });
    }
    else if (basePredicates.length > 0) {
        const pm = {
            pairs: baseFields,
            predicates: basePredicates,
        };
        result.push(pm);
    }
    return result;
};
const getFields = (source) => {
    const result = [];
    const flat = (obj, stack) => {
        if (obj == undefined || obj == null) {
            return [];
        }
        Object.keys(obj).forEach((k) => {
            const s = stack.concat([k]);
            const v = obj[k];
            if (typeof v === 'object' && Array.isArray(v)) {
                flat(v[0], s);
            }
            else if (typeof v === 'object') {
                flat(v, s);
            }
            else {
                result.push(s.join("."));
            }
        });
    };
    flat(source, []);
    return result;
};
//# sourceMappingURL=filter.js.map