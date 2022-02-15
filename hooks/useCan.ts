import { useContext } from 'react';
import { AuthContext } from '../Contexts/AuthContext';
import { validateUserPermissions } from '../utils/validateUserPermissions';

type UseCanParams = {
  permissions?: string[];
  roles?: string[];
};

export function useCan({ permissions, roles }: UseCanParams) {
  const { user, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return false;
  }

  const userHasValidPermission = validateUserPermissions({
    user,
    permissions,
    roles,
  });

  // if (permissions && permissions.length > 0) {
  //   const hasAllPermissions = permissions.every((permission) =>
  //     user?.permissions.includes(permission),
  //   );

  //   if (!hasAllPermissions) {
  //     return false;
  //   }
  // }

  // if (roles && roles.length > 0) {
  //   const hasAllRoles = roles.some((role) => user?.permissions.includes(role));

  //   if (!hasAllRoles) {
  //     return false;
  //   }
  // }

  return userHasValidPermission;
}
