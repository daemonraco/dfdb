/**
 * @file initializer.dfdb.ts
 * @author Alejandro D. Simi
 */

import { CollectionTypes } from '../constants.dfdb';

export default {
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
                        default: CollectionTypes.Simple
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
