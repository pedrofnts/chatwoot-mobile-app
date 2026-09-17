import { useSelector } from 'react-redux';

import { AssigneeOptions, AssigneeTypes } from '@/types';
import { selectUser } from '@/store/auth/authSelectors';
import { getUserPermissions } from '@/utils/permissionUtils';

const assigneeTypeList = Object.keys(AssigneeOptions) as AssigneeTypes[];

/**
 * Assignee types the current user is allowed to browse, based on the
 * conversation permissions of the active account.
 * - conversation_manage / agent / administrator: all types
 * - conversation_unassigned_manage only: mine and unassigned
 * - conversation_participating_manage only: mine and all
 */
export const useAssigneeTypeOptions = (): AssigneeTypes[] => {
  const user = useSelector(selectUser);
  const { account_id: activeAccountId } = user || { account_id: null };

  const userPermissions = user ? getUserPermissions(user, activeAccountId) : [];

  if (
    userPermissions.includes('conversation_manage') ||
    userPermissions.includes('agent') ||
    userPermissions.includes('administrator')
  ) {
    return assigneeTypeList;
  }
  if (userPermissions.includes('conversation_unassigned_manage')) {
    return assigneeTypeList.filter(type => type !== 'all');
  }
  return assigneeTypeList.filter(type => type !== 'unassigned');
};
