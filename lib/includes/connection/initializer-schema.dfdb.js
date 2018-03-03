"use strict";
/**
 * @file initializer.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
const constants_dfdb_1 = require("../constants.dfdb");
exports.default = {
    properties: {
        collections: {
            type: "array",
            default: [],
            items: {
                type: "object",
                properties: {
                    name: {
                        type: "string"
                    },
                    type: {
                        type: "string",
                        default: constants_dfdb_1.CollectionTypes.Simple
                    },
                    indexes: {
                        type: "array",
                        default: [],
                        items: {
                            type: "object",
                            properties: {
                                field: { type: "string" }
                            },
                            required: ['field']
                        }
                    },
                    schema: {
                        type: "object"
                    },
                    data: {
                        type: "array",
                        default: [],
                        items: { type: "object" }
                    }
                },
                required: ['name', 'type', 'indexes', 'data'],
                additionalProperties: false
            }
        }
    },
    required: ['collections'],
    additionalProperties: false
};
