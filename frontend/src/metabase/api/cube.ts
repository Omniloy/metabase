import { CubeDataResponse, GetCubeDataRequest, UpdateCubeDataRequest } from "metabase-types/api";
import { CubeApi } from "./cubeApi";
import { provideCubeDataTags } from "./tags";
import { invalidateTags, tag } from "./tags";

const company_name = process.env.COMPANY_NAME

export const cubeDataApi = CubeApi.injectEndpoints({
    endpoints: builder => ({
        getCubeData: builder.query<CubeDataResponse, GetCubeDataRequest | void>({
            query: () => ({
                method: 'GET',
                url: `/company/company-cube-files/${company_name}`,
            }),
            transformResponse: (response: Record<string, string>) => {
                return Object.entries(response).map(([fileName, content]) => ({
                    fileName,
                    content,
                }))
            },
            providesTags: (result) => {
                return provideCubeDataTags(result ?? [])
            } 
        }),
        updateCubeData: builder.mutation<void, UpdateCubeDataRequest>({
            query: (updateData) => ({
                url: `/company/edit-cube-files/${company_name}`,
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: updateData.payload,
            }),
            invalidatesTags: (_, error, { }) =>
                invalidateTags(error, [
                  tag("company-name"),
                ]),
        })
    })
})

export const {
    useGetCubeDataQuery,
    useUpdateCubeDataMutation
} = cubeDataApi