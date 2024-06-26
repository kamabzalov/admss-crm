import axios, { AxiosResponse } from 'axios';
import { getToken } from './utils';
import { API_URL } from '../app-consts';
import {
    Location,
    ShortUserInfo,
    User,
    UserCreateValidationResponse,
    UserInfo,
    UserLocationError,
    UserPermissionsData,
    UserPermissionsRecord,
} from 'common/interfaces/UserData';
import { UserQuery } from 'common/interfaces/QueriesParams';
import { ActionStatus, Status } from 'common/interfaces/ActionStatus';
export { Status } from 'common/interfaces/ActionStatus';

type Method = 'GET' | 'POST';

export const fetchApiData = async <T>(
    method: Method,
    url: string,
    options?: { data?: unknown; params?: UserQuery }
): Promise<T> => {
    const headers = { Authorization: `Bearer ${getToken()}` };
    const { data, params } = options || {};

    try {
        const response: AxiosResponse<T> = await axios({
            method,
            url: API_URL + url,
            data,
            params,
            headers,
        });
        return response.data;
    } catch (error: any) {
        return error?.data;
    }
};

export const getTotalUsersRecords = (): Promise<{ status: string; total: number }> => {
    return fetchApiData<{ status: string; total: number }>('GET', `user/0/listclients?total=1`);
};

export const createOrUpdateUser = async (userData: {
    loginname?: string;
    loginpassword: string;
    uid?: string;
}): Promise<any> => {
    const { uid, ...reqBody } = userData;

    try {
        const response = await fetchApiData('POST', `user/${uid || '0'}/user`, { data: reqBody });
        return response;
    } catch (error) {
        throw error;
    }
};

export const copyUser = (srcuid: string): Promise<any> => {
    return fetchApiData<ActionStatus>('POST', `user/${srcuid}/copyuser`);
};

export const setUserOptionalData = (uid: string, data: any): Promise<any> => {
    return fetchApiData('POST', `user/${uid}/set`, { data });
};

export const getUsers = (params?: UserQuery): Promise<User[]> => {
    const initialParams: UserQuery = {
        column: params?.column || 'username',
        type: params?.type || 'asc',
        skip: params?.skip || 0,
        qry: params?.qry || '',
        top: params?.top || 10,
    };

    return fetchApiData<User[]>('GET', `user/0/listclients`, { params: initialParams });
};

export const deleteUser = (uid: string): Promise<any> => {
    return fetchApiData<ActionStatus>('POST', `user/${uid}/delete`);
};

export const setUserPermissions = (uid: string, data: any): Promise<any> => {
    return fetchApiData('POST', `user/${uid}/permissions`, { data });
};

export const getUserPermissions = (uid: string): Promise<UserPermissionsRecord> => {
    return fetchApiData<UserPermissionsData>('GET', `user/${uid}/permissionsmap `).then(
        (response) => response.permissions.crm
    );
};

export const getUserExtendedInfo = async (uid: string): Promise<UserInfo | undefined> => {
    try {
        const response = await fetchApiData<UserInfo>('GET', `user/${uid}/info`);
        if (response.status === Status.OK) {
            return response;
        }
    } catch (error) {
        //TODO: add error handler
        return undefined;
    }
};

export const getUserLocations = async (uid: string): Promise<Location[] | undefined> => {
    try {
        const response = await fetchApiData<{
            locations: Location[];
            status: Status;
        }>('GET', `user/${uid}/locations`);
        if (response.status === Status.OK) {
            return response.locations;
        }
    } catch (error) {
        //TODO: add error handler
        return undefined;
    }
};

export const addUserLocation = async (
    uid: string,
    location: Partial<Location>
): Promise<Status.OK | string> => {
    try {
        const response = await fetchApiData<{
            status: Status;
        }>('POST', `user/${uid}/location`, {
            data: location,
        });
        if (response.status === Status.OK) {
            return response.status;
        } else {
            throw response;
        }
    } catch (err) {
        if (axios.isAxiosError(err)) {
            return err.message;
        } else {
            const { error } = err as UserLocationError;
            return error || 'Network error: Unable to connect to the server';
        }
    }
};

export const getUserProfile = (uid: string): Promise<string> => {
    return fetchApiData<string>('GET', `user/${uid}/profile`);
};

export const setUserSettings = (uid: string, data: any): Promise<any> => {
    return fetchApiData('POST', `user/${uid}/settings`, { data });
};

export const getUserSettings = (uid: string): Promise<any> => {
    return fetchApiData('GET', `user/${uid}/settings`);
};

export const listUserSessions = (uid: string): Promise<string> => {
    return fetchApiData<string>('GET', `user/${uid}/sessions`);
};

export const killSession = (uid: string): Promise<any> => {
    return fetchApiData('POST', `user/${uid}/session`);
};

export const listUserLogins = (uid: string): Promise<string> => {
    return fetchApiData<string>('GET', `user/${uid}/logins`);
};

export const listSubusers = (uid: string): Promise<string> => {
    return fetchApiData<string>('GET', `user/${uid}/subusers`);
};

export const listSalesPersons = (uid: string): Promise<string> => {
    return fetchApiData<string>('GET', `user/${uid}/salespersons`);
};

export const getUserShortInfo = (uid: string): Promise<ShortUserInfo> => {
    return fetchApiData<ShortUserInfo>('GET', `user/${uid}/username`);
};

export const checkUser = (username: string): Promise<UserCreateValidationResponse> => {
    return fetchApiData<UserCreateValidationResponse>('POST', `user/checkuser`, {
        data: { username },
    });
};
