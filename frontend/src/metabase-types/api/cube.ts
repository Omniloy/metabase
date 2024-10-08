export interface CubeDataItem {
    fileName: string;
    content: string;
}

export type CubeDataResponse = CubeDataItem[];

export type GetCubeDataRequest = {
    companyName: string;
}

export type UpdateCubeDataRequest = {
    payload: {
        cubeFiles: {
            model: {
                cubes: Record<string, string>;
            };
        };
    };
    companyName: string;
};
