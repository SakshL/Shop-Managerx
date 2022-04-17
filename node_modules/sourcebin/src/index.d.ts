declare module 'sourcebin' {
    export function url(
        url: string,
    ): {
        key: string;
        url: string;
        short: string;
    };

    export function get(
        url: string,
        options?: {
            fetchContent?: boolean;
        },
    ): Promise<SourceBin>;

    export function create(
        bins: {
            name?: string;
            content: string;
            language?: string | number;
        }[],
        options?: {
            title?: string;
            description?: string;
        },
    ): Promise<SourceBin>;

    class SourceBin {
        constructor(
            key: string,
            data: {
                key: string;
                url: string;
                short: string;
                title?: string | undefined;
                description?: string | undefined;
                views: number;
                created: string;
                timestamp?: number;
                files: File[];
            },
        );

        get key(): string;
        get url(): string;
        get short(): string;
        get title(): string | undefined;
        get description(): string | undefined;
        get views(): number;
        get created(): string;
        get timestamp(): number;
        get files(): File[];
    }

    class File {
        constructor(
            key: string,
            index: number,
            data: {
                name?: string;
                content: string;
                languageId?: number;
                language?: {
                    name: string;
                    extension: string;
                    aliases: string[];
                    aceMode: string;
                };
            },
        );

        get name(): string;
        get content(): string;
        get languageId(): number;
        get language(): {
            name: string;
            extension: string;
            aliases: string[];
            aceMode: string;
        };
    }
}
