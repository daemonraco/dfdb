declare const _default: {
    properties: {
        collections: {
            type: string;
            default: any[];
            items: {
                type: string;
                properties: {
                    name: {
                        type: string;
                    };
                    type: {
                        type: string;
                        default: string;
                    };
                    indexes: {
                        type: string;
                        default: any[];
                        items: {
                            type: string;
                            properties: {
                                field: {
                                    type: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    schema: {
                        type: string;
                    };
                    data: {
                        type: string;
                        default: any[];
                        items: {
                            type: string;
                        };
                    };
                };
                required: string[];
                additionalProperties: boolean;
            };
        };
    };
    required: string[];
    additionalProperties: boolean;
};
export default _default;
