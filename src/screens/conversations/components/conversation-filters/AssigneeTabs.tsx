import React, { useMemo } from 'react';
import { View } from 'react-native';

import { Tabs } from '@/components-next/common/tabs';
import { tailwind } from '@/theme';
import { useHaptic } from '@/utils';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { useAssigneeTypeOptions } from '@/hooks/useAssigneeTypeOptions';
import { selectFilters, setFilters } from '@/store/conversation/conversationFilterSlice';
import {
  getFilteredConversations,
  selectConversationMeta,
} from '@/store/conversation/conversationSelectors';
import { selectUserId } from '@/store/auth/authSelectors';
import type { ConversationScope } from '@/navigation/stack/ConversationStack';
import i18n from '@/i18n';

type AssigneeTabsProps = {
  scope: ConversationScope;
};

/**
 * Quick views of the conversation list. Mine tab: all / unread; team tab:
 * all / unassigned. Unread is a client-side read-state filter, so its count
 * comes from the loaded conversations rather than the API meta.
 */
export const AssigneeTabs = ({ scope }: AssigneeTabsProps) => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectFilters);
  const meta = useAppSelector(selectConversationMeta);
  const userId = useAppSelector(selectUserId);
  const permittedTypes = useAssigneeTypeOptions();
  const hapticSelection = useHaptic();

  const unreadFilters = useMemo(() => ({ ...filters, read_status: 'unread' }), [filters]);
  const unreadCount = useAppSelector(
    state => getFilteredConversations(state, unreadFilters, userId).length,
  );

  const tabItems = useMemo(() => {
    if (scope === 'me') {
      return [
        {
          id: 'all',
          label: i18n.t('CONVERSATION.FILTERS.ASSIGNEE_TYPE.OPTIONS.ALL'),
          count: meta.mineCount,
        },
        { id: 'unread', label: i18n.t('CONVERSATION.FILTERS.UNREAD'), count: unreadCount },
      ];
    }
    return [
      permittedTypes.includes('all') && {
        id: 'all',
        label: i18n.t('CONVERSATION.FILTERS.ASSIGNEE_TYPE.OPTIONS.ALL'),
        count: meta.allCount,
      },
      permittedTypes.includes('unassigned') && {
        id: 'unassigned',
        label: i18n.t('CONVERSATION.FILTERS.ASSIGNEE_TYPE.OPTIONS.UNASSIGNED'),
        count: meta.unassignedCount,
      },
    ].filter(Boolean) as { id: string; label: string; count?: number }[];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, permittedTypes.join(), meta, unreadCount]);

  const isUnread = filters.read_status === 'unread';
  const activeTabId = scope === 'me' ? (isUnread ? 'unread' : 'all') : filters.assignee_type;

  // With a single permitted view there is nothing to switch between.
  if (tabItems.length < 2) return null;

  const handleTabPress = (tabId: string) => {
    if (tabId === activeTabId) return;
    hapticSelection?.();

    if (scope === 'me') {
      dispatch(setFilters({ key: 'read_status', value: tabId === 'unread' ? 'unread' : 'all' }));
      return;
    }
    dispatch(setFilters({ key: 'assignee_type', value: tabId }));
  };

  return (
    <View style={tailwind.style('px-3 pb-2')}>
      <Tabs items={tabItems} activeTabId={activeTabId} onTabPress={handleTabPress} stretch />
    </View>
  );
};
