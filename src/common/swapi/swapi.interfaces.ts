export interface SwapiResourceResponse<T> {
    message: string;
    result: {
        properties: T;
        uid: string;
        description: string;
    };
}

export interface SwapiListResponse {
    message: string;
    total_records: number;
    total_pages: number;
    previous: string | null;
    next: string | null;
    results: {
        uid: string;
        name: string;
        url: string;
    }[];
}
