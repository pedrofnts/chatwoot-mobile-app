import { useSelector } from 'react-redux';

import { AssigneeOptions, AssigneeTypes } from '@/types';
import { selectUser } from '@/store/auth/authSelectors';
import { getUserPermissions } from '@/utils/permissionUtils';

const assigneeTypeList = Object.keys(AssigneeOptions) as AssigneeTypes[];

/**
 * Assignee types the current user is allowed to browse, based on the
 * conversation permissions of the active account. Views are additive so the
 * Izzy fork's per-role combinations map directly:
 * - mine: always available to anyone with a conversation permission
 * - unassigned: conversation_unassigned_manage
 * - all: conversation_participating_manage
 * - conversation_manage / agent / administrator grant every view
 * A role holding only conversation_mine_manage browses just its own list.
 */
export const useAssigneeTypeOptions = (): AssigneeTypes[] => {
  const user = useSelector(selectUser);
  const { account_id: activeAccountId } = user || { account_id: null };

  const userPermissions = user ? getUserPermissions(user, activeAccountId) : [];

  const hasFullAccess =
    userPermissions.includes('conversation_manage') ||
    userPermissions.includes('agent') ||
    userPermissions.includes('administrator');
  const canBrowseUnassigned =
    hasFullAccess || userPermissions.includes('conversation_unassigned_manage');
  const canBrowseAll =
    hasFullAccess || userPermissions.includes('conversation_participating_manage');

  return assigneeTypeList.filter(type => {
    if (type === 'unassigned') return canBrowseUnassigned;
    if (type === 'all') return canBrowseAll;
    return true;
  });
};
