import React, { useEffect, useMemo } from 'react';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';

import { useConversationListStateContext, useRefsContext } from '@/context';
import { selectInboxById } from '@/store/inbox/inboxSelectors';
import { setBottomSheetState } from '@/store/conversation/conversationHeaderSlice';
import i18n from '@/i18n';
import { tailwind } from '@/theme';
import { useHaptic } from '@/utils';
import { getFilteredConversations } from '@/store/conversation/conversationSelectors';
import { selectUserId } from '@/store/auth/authSelectors';
import {
  setFilters,
  selectFilters,
  defaultFilterState,
  FilterState,
} from '@/store/conversation/conversationFilterSlice';
import {
  clearSelection,
  selectAll,
  selectSelectedConversations,
} from '@/store/conversation/conversationSelectedSlice';
import { selectCurrentState, setCurrentState } from '@/store/conversation/conversationHeaderSlice';
import { ConversationFilterBar } from '../conversation-filters';
import { ConversationHeaderPresenter } from './ConversationHeaderPresenter';

import { useAppDispatch, useAppSelector } from '@/hooks';
import { useNavigation } from '@react-navigation/native';
import { StackActions } from '@react-navigation/native';
import { selectNotificationsMetadata } from '@/store/notification/notificationSelectors';
import type { ConversationScope } from '@/navigation/stack/ConversationStack';

type ConversationHeaderProps = {
  scope: ConversationScope;
};

// The assignee scope lives in the bottom tabs / assignee tabs and the inbox in
// the header subtitle, so only the filters hidden behind the filter bar count
// towards the applied badge.
const FILTER_BAR_KEYS: (keyof FilterState)[] = ['status', 'sort_by'];

const getFiltersAppliedCount = (defaultState: FilterState, updatedState: FilterState): number => {
  return FILTER_BAR_KEYS.filter(key => defaultState[key] !== updatedState[key]).length;
};

export const ConversationHeader = ({ scope }: ConversationHeaderProps) => {
  const currentState = useAppSelector(selectCurrentState);
  const { unreadCount } = useAppSelector(selectNotificationsMetadata);

  const filters = useAppSelector(selectFilters);
  const dispatch = useAppDispatch();
  const userId = useAppSelector(selectUserId);
  const navigation = useNavigation();
  const { filtersModalSheetRef } = useRefsContext();

  const selectedInbox = useAppSelector(state => selectInboxById(state, parseInt(filters.inbox_id)));
  const inboxName = selectedInbox?.name ?? i18n.t('CONVERSATION.HEADER.ALL_INBOXES');

  const handleInboxPress = () => {
    dispatch(setBottomSheetState('inbox_id'));
    filtersModalSheetRef.current?.present();
  };

  const { openedRowIndex } = useConversationListStateContext();

  const allConversations = useAppSelector(state =>
    getFilteredConversations(state, filters, userId),
  );

  const selectedConversations = useAppSelector(selectSelectedConversations);

  const isSelectedAll = useMemo(
    () => selectedConversations.length === allConversations.length,
    [selectedConversations, allConversations],
  );

  const hapticSuccess = useHaptic('success');

  const headerBorderColor = tailwind.color('text-blackA-A3') as string;

  const headerOpenState = useDerivedValue(() =>
    currentState !== 'none' && currentState !== 'Select' ? withSpring(1) : withSpring(0),
  );

  // This creates a subtle visual effect where the border fades away when the header is in an active state (Search/Filter) and reappears when returning to the default state.
  const headerBorderAnimation = useAnimatedStyle(() => {
    return {
      borderBottomColor: interpolateColor(
        headerOpenState.value,
        [0, 1],
        [headerBorderColor, 'transparent'],
      ),
    };
  }, []);

  useEffect(() => {
    if (currentState !== 'none') {
      openedRowIndex.value = -1;
    }
  }, [currentState, openedRowIndex]);

  const handleLeftIconPress = () => {
    if (currentState === 'Select') {
      if (isSelectedAll) {
        dispatch(clearSelection());
      } else {
        dispatch(selectAll(allConversations));
      }
    } else {
      // Navigate to search screen
      const pushToSearchScreen = StackActions.push('SearchScreen');
      navigation.dispatch(pushToSearchScreen);
    }
  };

  const handleRightIconPress = () => {
    if (currentState === 'Filter') {
      dispatch(setCurrentState('none'));
    } else if (currentState === 'Select') {
      dispatch(clearSelection());
      dispatch(setCurrentState('none'));
    } else {
      dispatch(setCurrentState('Filter'));
    }
  };

  const filtersAppliedCount = useMemo(
    () => getFiltersAppliedCount(defaultFilterState, filters),
    [filters],
  );

  const handleClearFilter = () => {
    hapticSuccess?.();
    FILTER_BAR_KEYS.forEach(key => {
      dispatch(setFilters({ key, value: defaultFilterState[key] }));
    });
  };

  const handleNotificationPress = () => {
    navigation.dispatch(StackActions.push('Notifications'));
  };

  return (
    <Animated.View style={[tailwind.style('border-b-[1px] bg-white z-10'), headerBorderAnimation]}>
      <ConversationHeaderPresenter
        currentState={currentState}
        scope={scope}
        inboxName={inboxName}
        isSelectedAll={isSelectedAll}
        filtersAppliedCount={filtersAppliedCount}
        unreadNotificationCount={unreadCount}
        onLeftIconPress={handleLeftIconPress}
        onRightIconPress={handleRightIconPress}
        onClearFilter={handleClearFilter}
        onNotificationPress={handleNotificationPress}
        onInboxPress={handleInboxPress}
      />
      {currentState === 'Filter' ? <ConversationFilterBar /> : null}
    </Animated.View>
  );
};
