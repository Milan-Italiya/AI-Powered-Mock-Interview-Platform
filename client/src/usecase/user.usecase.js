import { getProfileDatasource, removeProfilePictureDatasource, updateProfileDatasource } from "../datasource/user.datasource.js"

export const getProfile = async () => {
    return await getProfileDatasource()
}

export const updateProfile = async (data) => {
    return await updateProfileDatasource(data);
}

export const removeProfilePicture = async () => {
    return await removeProfilePictureDatasource()
}