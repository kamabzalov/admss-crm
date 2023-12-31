import { useEffect, useState } from 'react';
import { renderList } from 'components/dashboard/helpers/helpers';
import { PrimaryButton } from 'components/dashboard/smallComponents/buttons/PrimaryButton';
import { Status, getUserPermissions, setUserPermissions } from 'services/user.service';
import { useToast } from 'components/dashboard/helpers/renderToastHelper';
import { AxiosError } from 'axios';
import { filterObjectValues, sortPermissions } from '../../data/permissions';

interface UserPermissionsModalProps {
    onClose: () => void;
    useruid: string;
    username: string;
    onUpdateUsers: () => void;
}

export const UserPermissionsModal = ({
    onClose,
    useruid,
    username,
    onUpdateUsers,
}: UserPermissionsModalProps): JSX.Element => {
    const [userPermissionsJSON, setUserPermissionsJSON] = useState<string>('');
    const [initialUserPermissionsJSON, setInitialUserPermissionsJSON] = useState<string>('');
    const [modifiedJSON, setModifiedJSON] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true);

    const { handleShowToast } = useToast();

    useEffect(() => {
        setIsLoading(true);
        if (useruid) {
            getUserPermissions(useruid).then(async (response) => {
                const sortedPermissions = sortPermissions(response);
                const stringifiedResponse = JSON.stringify(sortedPermissions, null, 2);
                setUserPermissionsJSON(stringifiedResponse);
                setInitialUserPermissionsJSON(stringifiedResponse);
                const filteredData = filterObjectValues(sortedPermissions);
                setModifiedJSON(filteredData);
                setIsLoading(false);
            });
        }
    }, [useruid]);

    useEffect(() => {
        if (initialUserPermissionsJSON !== userPermissionsJSON && !isLoading) {
            setIsButtonDisabled(false);
        } else {
            setIsButtonDisabled(true);
        }
    }, [userPermissionsJSON, initialUserPermissionsJSON, isLoading]);

    const handleChangeUserPermissions = ([fieldName, fieldValue]: [string, number]): void => {
        const parsedUserPermission = JSON.parse(userPermissionsJSON);
        parsedUserPermission[fieldName] = fieldValue;
        setUserPermissionsJSON(JSON.stringify(parsedUserPermission, null, 2));
        setModifiedJSON(filterObjectValues(parsedUserPermission));
    };

    const handleSetUserPermissions = async (): Promise<void> => {
        try {
            if (useruid) {
                const response = await setUserPermissions(useruid, JSON.parse(userPermissionsJSON));
                if (response.status === Status.OK) {
                    handleShowToast({
                        message: `<strong>${username}</strong> permissions successfully saved`,
                        type: 'success',
                    });
                    onClose();
                    onUpdateUsers();
                }
            }
        } catch (err) {
            const { message } = err as Error | AxiosError;
            handleShowToast({ message, type: 'danger' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {!isLoading && (
                <>
                    {renderList({
                        data: modifiedJSON,
                        checkbox: true,
                        action: handleChangeUserPermissions,
                    })}
                </>
            )}
            <PrimaryButton
                icon='check'
                disabled={isButtonDisabled}
                buttonClickAction={handleSetUserPermissions}
            >
                Save permissions
            </PrimaryButton>
        </>
    );
};
