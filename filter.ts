
type Match = Array<KeyValuePair>;
type Predicate = (field: string, value: any) => boolean;
const queryJson = (input: Array<any>, filters: Array<Predicate>): Array<Match> => {
    const results: Array<Match> = [];
    input.map((a: any) => {
        const fields = getFields(a);
        const potentialMatches = depthSearch(null, a, filters);
        potentialMatches.map((pm: PotentialMatch) => {
            let totalFound = 0;
            filters.map((filter: Predicate): void => {
                const found = pm.predicates.find((pmFilter): boolean => { return pmFilter === filter; });
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

interface KeyValuePair {
    key: string;
    value: any;
}
interface PotentialMatch {
    pairs: Array<KeyValuePair>;
    predicates: Array<Predicate>;
}

const depthSearch = (prefix: string | null, obj: any, filters: Array<Predicate>): Array<PotentialMatch> => {
    let result: Array<PotentialMatch> = [];
    const baseFields: Array<KeyValuePair> = [];
    const basePredicates: Array<Predicate> = [];

    if (prefix === "distributors" && obj.id !== undefined && obj.id === 3855) {
        console.log("here");
    }

    Object.keys(obj).map((k: string ) => {
        const v = obj[k];
        const fullpath = (prefix === null) ? k : `${prefix}.${k}`;

        if (typeof v !== "object") {
            baseFields.push({
                key: fullpath,
                value: v,
            });
            filters.map((filter: Predicate) => {
                if (filter(fullpath, v)) {
                    basePredicates.push(filter);
                }
            });
        }
    });

    Object.keys(obj).map((k: string) => {
        const v = obj[k];
        const fullpath = (prefix === null) ? k : `${prefix}.${k}`;

        if (typeof v === "object" && Array.isArray(v)) {
            v.map((element: any) => {
                const search = depthSearch(fullpath, element, filters);
                result = result.concat(search);
            });
        }
        else if (typeof v === "object") {
            const search = depthSearch(fullpath, v, filters);
            result = result.concat(search);
        }
    });

    if (result.length > 0) { // If a child started meeting conditions, we want it.
        result.map((pm: PotentialMatch) => {
            pm.pairs = pm.pairs.concat(baseFields);
            pm.predicates = pm.predicates.concat(basePredicates);
        });
    }
    else if (basePredicates.length > 0) { // Otherwise base off ourself.
        const pm: PotentialMatch = {
            pairs: baseFields,
            predicates: basePredicates,
        };
        result.push(pm);
    }

    return result;
};

const getFields = (source: any): Array<string> => {
    const result: Array<string> = [];
    const flat = (obj: any, stack: Array<string>): void => {
        Object.keys(obj).forEach((k: string) => {
            const s = stack.concat([k]);
            const v = obj[k];

            if (typeof v === 'object' && Array.isArray(v) ){
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