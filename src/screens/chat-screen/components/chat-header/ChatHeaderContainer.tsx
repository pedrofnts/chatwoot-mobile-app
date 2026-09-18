import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { StackActions, useNavigation } from '@react-navigation/native';
import { useChatWindowContext, useRefsContext } from '@/context';
import { showToast } from '@/utils/toastUtils';
import i18n from '@/i18n';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { conversationActions } from '@/store/conversation/conversationActions';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { CONVERSATION_STATUS } from '@/constants';
import { ConversationStatus } from '@/types/common/ConversationStatus';
import { ChatHeader } from './ChatHeader';
import { DashboardList } from './DropdownMenu';
import { ImageSourcePropType } from 'react-native';
import { SLAStatus } from '@/types/common/SLA';
import { evaluateSLAStatus } from '@chatwoot/utils';
import { resetSentMessage } from '@/store/conversation/sendMessageSlice';
import { selectAllDashboardApps } from '@/store/dashboard-app/dashboardAppSlice';
import { selectUser } from '@/store/auth/authSelectors';
import { selectInboxById } from '@/store/inbox/inboxSelectors';
import { selectAllLabels } from '@/store/label/labelSelectors';

type ChatScreenHeaderProps = {
  name: string;
  imageSrc: ImageSourcePropType;
};

const REFRESH_INTERVAL = 60000;

// Formats Brazilian numbers as "+55 (11) 91234-5678"; other numbers pass through untouched.
const formatPhoneNumber = (phoneNumber: string) => {
  const brMatch = phoneNumber.match(/^\+55(\d{2})(\d{4,5})(\d{4})$/);
  if (brMatch) {
    return `+55 (${brMatch[1]}) ${brMatch[2]}-${brMatch[3]}`;
  }
  return phoneNumber;
};

export const ChatHeaderContainer = (props: ChatScreenHeaderProps) => {
  const { name, imageSrc } = props;
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { conversationId } = useChatWindowContext();
  const conversation = useAppSelector(state => selectConversationById(state, conversationId));
  const currentUser = useAppSelector(selectUser);
  const dashboardApps = useAppSelector(selectAllDashboardApps);
  const inbox = useAppSelector(state =>
    conversation?.inboxId ? selectInboxById(state, conversation.inboxId) : undefined,
  );
  const allLabels = useAppSelector(selectAllLabels);

  // Contact phone number (formatted) shown under the name, with the inbox as a chip beside it.
  const phoneNumber = conversation?.meta?.sender?.phoneNumber;
  const subtitle = phoneNumber ? formatPhoneNumber(phoneNumber) : '';
  const inboxName = inbox?.name || '';

  // Conversation labels are plain titles; colors come from the account label list.
  const labels = useMemo(
    () =>
      (conversation?.labels || []).map(title => ({
        title,
        color: allLabels.find(label => label.title === title)?.color,
      })),
    [conversation?.labels, allLabels],
  );

  const appliedSla = conversation?.appliedSla;

  const [slaStatus, setSlaStatus] = useState<SLAStatus | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const conversationStatus = conversation?.status;
  const isResolved = conversationStatus === CONVERSATION_STATUS.RESOLVED;

  const updateSlaStatus = useCallback(() => {
    if (appliedSla) {
      const status = evaluateSLAStatus({
        appliedSla: {
          id: appliedSla.id,
          name: appliedSla.slaName,
          description: appliedSla.slaDescription,
          sla_first_response_time_threshold: appliedSla.slaFirstResponseTimeThreshold,
          sla_next_response_time_threshold: appliedSla.slaNextResponseTimeThreshold,
          sla_resolution_time_threshold: appliedSla.slaResolutionTimeThreshold,
          only_during_business_hours: appliedSla.slaOnlyDuringBusinessHours,
          created_at: appliedSla.createdAt,
        },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        chat: {
          first_reply_created_at: conversation?.firstReplyCreatedAt,
          waiting_since: conversation?.waitingSince,
          status: conversation?.status,
        },
      });
      setSlaStatus(status);
    }
  }, [appliedSla, conversation]);

  const { chatPagerView } = useRefsContext();
  const { pagerViewIndex } = useChatWindowContext();

  const createTimer = useCallback(() => {
    timerRef.current = setTimeout(() => {
      updateSlaStatus();
      createTimer();
    }, REFRESH_INTERVAL);
  }, [updateSlaStatus]);

  useEffect(() => {
    createTimer();
    updateSlaStatus();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [createTimer, updateSlaStatus]);

  const handleBackPress = () => {
    dispatch(resetSentMessage());
    if (navigation.canGoBack()) {
      navigation.dispatch(StackActions.pop());
    } else {
      navigation.dispatch(StackActions.replace('Tab'));
    }
  };

  const handleNavigationToContactDetails = () => {
    const navigateToScreen = StackActions.push('ContactDetails', { conversationId });
    navigation.dispatch(navigateToScreen);
  };

  const handleNavigation = (url?: string, title?: string) => {
    if (url) {
      const navigateToScreen = StackActions.push('Dashboard', {
        url,
        title,
        conversation,
        currentUser,
      });
      navigation.dispatch(navigateToScreen);
    } else {
      chatPagerView.current?.setPage(1);
    }
  };

  const toggleChatStatus = async () => {
    const updatedStatus =
      conversationStatus === CONVERSATION_STATUS.RESOLVED
        ? CONVERSATION_STATUS.OPEN
        : CONVERSATION_STATUS.RESOLVED;
    await dispatch(
      conversationActions.toggleConversationStatus({
        conversationId,
        payload: { status: updatedStatus as ConversationStatus, snoozed_until: null },
      }),
    );

    showToast({
      message: i18n.t('CONVERSATION.STATUS_CHANGE'),
    });
  };

  const dashboardRoutes = dashboardApps.map(dashboardApp => ({
    title: dashboardApp.title,
    url: dashboardApp.content[0].url,
    onSelect: handleNavigation,
  }));

  const dashboardsList = useMemo(() => {
    return [
      pagerViewIndex === 0
        ? {
            title: i18n.t('CONVERSATION_ACTION.TITLE'),
            onSelect: handleNavigation,
          }
        : undefined,
      ...dashboardRoutes,
    ].filter((item): item is DashboardList => item !== undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagerViewIndex]);

  const sLAStatusText = () => {
    const upperCaseType = slaStatus?.type?.toUpperCase(); // FRT, NRT, or RT
    const statusKey = slaStatus?.isSlaMissed ? 'MISSED' : 'DUE';
    return i18n.t(`SLA.STATUS.${upperCaseType}`, {
      status: i18n.t(`SLA.STATUS.${statusKey}`),
    });
  };
  return (
    <ChatHeader
      name={name}
      imageSrc={imageSrc}
      isResolved={isResolved}
      subtitle={subtitle}
      inboxName={inboxName}
      labels={labels}
      dashboardsList={dashboardsList}
      isSlaMissed={slaStatus?.isSlaMissed}
      hasSla={!!appliedSla}
      slaEvents={conversation?.slaEvents}
      statusText={`${sLAStatusText()}: ${slaStatus?.threshold}`}
      onBackPress={handleBackPress}
      onContactDetailsPress={handleNavigationToContactDetails}
      onToggleChatStatus={toggleChatStatus}
    />
  );
};
