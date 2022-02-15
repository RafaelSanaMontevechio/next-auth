type User = {
  permissions: string[];
  roles: string[];
};

type validateUserPermissionsParams = {
  user?: User;
  permissions?: string[];
  roles?: string[];
};

export function validateUserPermissions({
  user,
  permissions,
  roles,
}: validateUserPermissionsParams) {
  if (permissions && permissions.length > 0) {
    const hasAllPermissions = permissions.every((permission) =>
      user?.permissions.includes(permission),
    );

    if (!hasAllPermissions) {
      return false;
    }
  }

  if (roles && roles.length > 0) {
    const hasAllRoles = roles.some((role) => user?.permissions.includes(role));

    if (!hasAllRoles) {
      return false;
    }
  }

  return true;
}
