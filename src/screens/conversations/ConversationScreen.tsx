import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, AppState, RefreshControl, StatusBar } from 'react-native';
import Animated, { LinearTransition, SharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';

import {
  ConversationItemContainer,
  ConversationHeader,
  StatusFilters,
  SortByFilters,
  InboxFilters,
  AssigneeTabs,
} from './components';

import { ActionTabs } from '@/components-next';
import { Sheet } from '@/components-next/common/sheet/Sheet';

import { EmptyStateIcon } from '@/svg-icons';
import { SCREENS, LAST_ACTIVE_TIMESTAMP_KEY, LAST_ACTIVE_TIMESTAMP_THRESHOLD } from '@/constants';
import {
  ConversationListStateProvider,
  useConversationListStateContext,
  useRefsContext,
} from '@/context';

import { tailwind } from '@/theme';
import { Conversation } from '@/types';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  selectBottomSheetState,
  selectCurrentState,
  setBottomSheetState,
} from '@/store/conversation/conversationHeaderSlice';
import { resetActionState } from '@/store/conversation/conversationActionSlice';
import { useRoute, RouteProp } from '@react-navigation/native';
import type {
  ConversationScope,
  ConversationStackParamList,
} from '@/navigation/stack/ConversationStack';
import { conversationActions } from '@/store/conversation/conversationActions';
import {
  selectConversationsLoading,
  selectIsAllConversationsFetched,
  getFilteredConversations,
} from '@/store/conversation/conversationSelectors';
import {
  selectFilters,
  setFilters,
  FilterState,
} from '@/store/conversation/conversationFilterSlice';
import { ConversationPayload } from '@/store/conversation/conversationTypes';
import { clearAllConversations } from '@/store/conversation/conversationSlice';
import { selectUserId, selectCurrentUserAccountId } from '@/store/auth/authSelectors';
import { clearAllContacts } from '@/store/contact/contactSlice';
import { clearAssignableAgents } from '@/store/assignable-agent/assignableAgentSlice';

import i18n from '@/i18n';
import ActionBottomSheet from '@/navigation/tabs/ActionBottomSheet';
import { getCurrentRouteName } from '@/utils/navigationUtils';
import { useTabBarHeight } from '@/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

// The screen list thats need to be checked for refreshing the conversations list
const REFRESH_SCREEN_LIST = [SCREENS.CONVERSATION, SCREENS.INBOX, SCREENS.SETTINGS];

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

type FlashListRenderItemType = {
  item: Conversation;
  index: number;
};

const ConversationList = () => {
  const dispatch = useAppDispatch();
  const tabBarHeight = useTabBarHeight();
  const [appState, setAppState] = useState(AppState.currentState);

  // This is used to prevent the infinite scrolling before the list is ready
  const [isFlashListReady, setFlashListReady] = useState(false);
  // This is used for pull to refresh
  const [isRefreshing, setIsRefreshing] = useState(false);
  // This is used for pagination
  const [pageNumber, setPageNumber] = useState(1);
  const userId = useAppSelector(selectUserId);
  const accountId = useAppSelector(selectCurrentUserAccountId);

  // This is used to store the index of the item that is currently selected
  const { openedRowIndex } = useConversationListStateContext();

  // This is used to check if the conversations are still loading
  const isConversationsLoading = useAppSelector(selectConversationsLoading);
  // This is used to check if all the conversations are fetched
  const isAllConversationsFetched = useAppSelector(selectIsAllConversationsFetched);

  const handleRender = useCallback(({ item, index }: FlashListRenderItemType) => {
    return (
      <ConversationItemContainer
        index={index}
        conversationItem={item}
        openedRowIndex={openedRowIndex as SharedValue<number | null>}
      />
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filters = useAppSelector(selectFilters);

  // Reset last active timestamp when the conversation screen is opened
  useEffect(() => {
    AsyncStorage.removeItem(LAST_ACTIVE_TIMESTAMP_KEY);
  }, []);

  // Fetch on mount and whenever the account or filters change (single effect so a
  // switch that also resets filters doesn't fire two fetches).
  useEffect(() => {
    clearAndFetchConversations(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, filters]);

  const clearAndFetchConversations = useCallback(async (filters: FilterState) => {
    setPageNumber(1);
    await dispatch(clearAllConversations());
    await dispatch(clearAllContacts());
    await dispatch(clearAssignableAgents());
    fetchConversations(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ListFooterComponent = () => {
    if (isAllConversationsFetched || !isFlashListReady) return null;
    return (
      <Animated.View
        style={tailwind.style('flex-1 items-center justify-center pt-8', `pb-[${tabBarHeight}px]`)}>
        <ActivityIndicator size="small" />
      </Animated.View>
    );
  };

  const handleRefresh = useCallback(() => {
    setFlashListReady(false);
    setIsRefreshing(true);
    clearAndFetchConversations(filters).finally(() => {
      setIsRefreshing(false);
    });
  }, [clearAndFetchConversations, filters]);

  const checkAppStateAndFetchConversations = useCallback(async () => {
    const lastActiveTimestamp = await AsyncStorage.getItem(LAST_ACTIVE_TIMESTAMP_KEY);
    if (lastActiveTimestamp) {
      const currentTimestamp = Date.now();
      const difference = currentTimestamp - parseInt(lastActiveTimestamp);
      if (difference > LAST_ACTIVE_TIMESTAMP_THRESHOLD) {
        clearAndFetchConversations(filters);
      }
    }
  }, [clearAndFetchConversations, filters]);

  // Update conversations when app comes to foreground from background
  useEffect(() => {
    const appStateListener = AppState.addEventListener('change', nextAppState => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        const routeName = getCurrentRouteName();
        if (routeName && REFRESH_SCREEN_LIST.includes(routeName)) {
          checkAppStateAndFetchConversations();
        }
      }

      if (appState === 'active' && nextAppState.match(/inactive|background/)) {
        // App is going to background
        const currentTimestamp = Date.now();
        AsyncStorage.setItem(LAST_ACTIVE_TIMESTAMP_KEY, currentTimestamp.toString());
      }

      setAppState(nextAppState);
    });
    return () => {
      appStateListener?.remove();
    };
  }, [appState, checkAppStateAndFetchConversations, clearAndFetchConversations, filters]);

  const fetchConversations = useCallback(
    async (filters: FilterState, page: number = 1) => {
      const conversationFilters = {
        status: filters.status,
        assigneeType: filters.assignee_type,
        page: page,
        sortBy: filters.sort_by,
        inboxId: parseInt(filters.inbox_id),
      } as ConversationPayload;

      dispatch(conversationActions.fetchConversations(conversationFilters));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const onChangePageNumber = () => {
    const nextPageNumber = pageNumber + 1;
    setPageNumber(nextPageNumber);
    fetchConversations(filters, nextPageNumber);
  };

  const handleOnEndReached = () => {
    const shouldLoadMoreConversations =
      isFlashListReady && !isAllConversationsFetched && !isConversationsLoading;
    if (shouldLoadMoreConversations) {
      onChangePageNumber();
    }
  };

  const handleScrollBeginDrag = useCallback(() => {
    openedRowIndex.value = -1;
    if (!isFlashListReady) {
      setFlashListReady(true);
    }
  }, [isFlashListReady, openedRowIndex]);

  const allConversations = useAppSelector(state =>
    getFilteredConversations(state, filters, userId),
  );

  const shouldShowEmptyLoader = isConversationsLoading && allConversations.length === 0;

  return shouldShowEmptyLoader ? (
    <Animated.View
      style={tailwind.style('flex-1 items-center justify-center', `pb-[${tabBarHeight}px]`)}>
      <ActivityIndicator />
    </Animated.View>
  ) : allConversations.length === 0 ? (
    <Animated.ScrollView
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      contentContainerStyle={tailwind.style(
        'flex-1 items-center justify-center',
        `pb-[${tabBarHeight}px]`,
      )}>
      <EmptyStateIcon />
      <Animated.Text style={tailwind.style('pt-6 text-md  tracking-[0.32px] text-gray-800')}>
        {i18n.t('CONVERSATION.EMPTY')}
      </Animated.Text>
    </Animated.ScrollView>
  ) : (
    <AnimatedFlashList
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      showsVerticalScrollIndicator={false}
      data={allConversations}
      onScrollBeginDrag={handleScrollBeginDrag}
      onEndReached={handleOnEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={ListFooterComponent}
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      renderItem={handleRender}
      contentContainerStyle={tailwind.style(`pb-[${tabBarHeight - 1}px]`)}
    />
  );
};

const ConversationScreen = () => {
  const route = useRoute<RouteProp<ConversationStackParamList, 'ConversationScreen'>>();
  const scope: ConversationScope = route.params?.scope ?? 'team';

  const currentBottomSheet = useAppSelector(selectBottomSheetState);
  const currentHeaderState = useAppSelector(selectCurrentState);
  const filters = useAppSelector(selectFilters);
  const dispatch = useAppDispatch();

  const { filtersModalSheetRef } = useRefsContext();

  // The mine/team bottom tabs share the persisted filter state, so the filters
  // scoped by this screen are realigned before the list mounts (the tabs
  // unmount on blur, so only one screen ever runs this). The team tab has no
  // unread control, so a leftover unread read-state is also cleared there.
  const needsScopeSync =
    scope === 'me'
      ? filters.assignee_type !== 'me'
      : filters.assignee_type === 'me' || filters.read_status === 'unread';

  useEffect(() => {
    if (!needsScopeSync) return;
    if (scope === 'me') {
      dispatch(setFilters({ key: 'assignee_type', value: 'me' }));
      return;
    }
    if (filters.assignee_type === 'me') {
      dispatch(setFilters({ key: 'assignee_type', value: 'all' }));
    }
    if (filters.read_status === 'unread') {
      dispatch(setFilters({ key: 'read_status', value: 'all' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsScopeSync, scope, dispatch]);

  const handleOnDismiss = () => {
    /**
     * Resetting the bottoms sheet state to none with a timeout
     * to avoid flickering of bottom sheet
     */
    dispatch(setBottomSheetState('none'));
    dispatch(resetActionState());
  };

  const isInbox = currentBottomSheet === 'inbox_id';

  const filterHeight = (() => {
    switch (currentBottomSheet) {
      case 'status':
        return 290;
      case 'sort_by':
        return 200;
      default:
        return 250;
    }
  })();

  // The assignee tabs get out of the way while conversations are being multi-selected.
  const showAssigneeTabs = currentHeaderState !== 'Select';

  return (
    <SafeAreaView edges={['top']} style={tailwind.style('flex-1 bg-white')}>
      <StatusBar
        translucent
        backgroundColor={tailwind.color('bg-white')}
        barStyle={'dark-content'}
      />
      <ConversationListStateProvider>
        <ConversationHeader scope={scope} />
        {showAssigneeTabs ? (
          <Animated.View layout={LinearTransition.springify().damping(22).stiffness(180)}>
            <AssigneeTabs scope={scope} />
          </Animated.View>
        ) : null}
        <Animated.View
          style={tailwind.style('flex-1')}
          layout={LinearTransition.springify().damping(22).stiffness(180)}>
          {needsScopeSync ? (
            <Animated.View style={tailwind.style('flex-1 items-center justify-center')}>
              <ActivityIndicator />
            </Animated.View>
          ) : (
            <ConversationList />
          )}
        </Animated.View>
        <Sheet
          ref={filtersModalSheetRef}
          height={isInbox ? undefined : filterHeight}
          detents={isInbox ? [0.7] : undefined}
          scrollable={isInbox}
          onDismiss={handleOnDismiss}>
          {isInbox ? (
            <InboxFilters />
          ) : (
            <>
              {currentBottomSheet === 'status' ? <StatusFilters /> : null}
              {currentBottomSheet === 'sort_by' ? <SortByFilters /> : null}
            </>
          )}
        </Sheet>
        <ActionBottomSheet />
        <ActionTabs />
      </ConversationListStateProvider>
    </SafeAreaView>
  );
};

export default ConversationScreen;
