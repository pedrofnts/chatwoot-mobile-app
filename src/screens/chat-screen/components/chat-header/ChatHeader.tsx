import React from 'react';
import { ImageSourcePropType, Keyboard, Platform, Pressable, ScrollView, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Avatar, Icon } from '@/components-next';
import { ChevronLeft, Overflow, ResolvedIcon, SLAIcon } from '@/svg-icons';
import { Sheet } from '@/components-next/common/sheet/Sheet';
import { tailwind } from '@/theme';
import { ChatDropdownMenu, DashboardList } from './DropdownMenu';
import { SLAEvent } from '@/types/common';
import { useRefsContext } from '@/context';
import { SlaEvents } from './SlaEvents';

export type ChatHeaderLabel = {
  title: string;
  color?: string | null;
};

type ChatHeaderProps = {
  name: string;
  imageSrc: ImageSourcePropType;
  isResolved: boolean;
  isSlaMissed?: boolean;
  hasSla?: boolean;
  slaEvents?: SLAEvent[];
  dashboardsList: DashboardList[];
  statusText?: string;
  subtitle?: string;
  inboxName?: string;
  labels?: ChatHeaderLabel[];
  onBackPress: () => void;
  onContactDetailsPress: () => void;
  onToggleChatStatus: () => void;
};

export const ChatHeader = ({
  name,
  imageSrc,
  isResolved,
  slaEvents,
  isSlaMissed,
  hasSla,
  statusText,
  subtitle,
  inboxName,
  labels,
  dashboardsList,
  onBackPress,
  onContactDetailsPress,
  onToggleChatStatus,
}: ChatHeaderProps) => {
  const { slaEventsSheetRef } = useRefsContext();

  const toggleSlaEventsSheet = () => {
    if (slaEvents?.length) {
      Keyboard.dismiss();
      slaEventsSheetRef.current?.present();
    }
  };

  return (
    <Animated.View style={[tailwind.style('border-b-[1px] border-b-blackA-A3')]}>
      <Animated.View style={tailwind.style('flex flex-row justify-between items-center px-4 py-2')}>
        <Animated.View style={tailwind.style('flex-1 flex-row gap-2 items-center justify-center')}>
          <Pressable
            hitSlop={8}
            style={tailwind.style('h-8 w-8 flex  justify-center items-start')}
            onPress={onBackPress}>
            <Icon icon={<ChevronLeft />} size={24} />
          </Pressable>
          <Pressable
            onPress={onContactDetailsPress}
            style={tailwind.style('flex flex-row items-center flex-1')}>
            <Avatar size="xl" src={imageSrc} name={name} />
            <Animated.View style={tailwind.style('pl-2 flex-1')}>
              <Animated.Text
                numberOfLines={1}
                style={tailwind.style(
                  'text-[17px] font-inter-medium-24 tracking-[0.32px] text-gray-950',
                )}>
                {name}
              </Animated.Text>
              {subtitle ? (
                <Animated.Text
                  numberOfLines={1}
                  style={tailwind.style(
                    'text-cxs font-inter-420-20 tracking-[0.32px] text-gray-600 pt-[2px]',
                  )}>
                  {subtitle}
                </Animated.Text>
              ) : null}
            </Animated.View>
          </Pressable>
        </Animated.View>

        <Animated.View
          style={tailwind.style(
            `flex flex-row justify-end pl-2 ${Platform.OS === 'ios' ? 'gap-4' : ''}`,
          )}>
          <Animated.View style={tailwind.style('flex flex-row items-center gap-4')}>
            {hasSla && (
              <Pressable hitSlop={8} onPress={toggleSlaEventsSheet}>
                <Icon icon={<SLAIcon color={isSlaMissed ? '#E13D45' : '#BBBBBB'} />} size={24} />
              </Pressable>
            )}
            <Pressable hitSlop={8} onPress={onToggleChatStatus}>
              <Icon
                icon={
                  <ResolvedIcon
                    strokeWidth={2}
                    {...(isResolved && { stroke: tailwind.color('bg-green-700') })}
                  />
                }
                size={24}
              />
            </Pressable>
          </Animated.View>
          {dashboardsList.length > 0 && (
            <ChatDropdownMenu dropdownMenuList={dashboardsList}>
              <Icon icon={<Overflow strokeWidth={2} />} size={24} />
            </ChatDropdownMenu>
          )}
        </Animated.View>
      </Animated.View>
      {inboxName || (labels && labels.length > 0) ? (
        <View style={tailwind.style('flex flex-row items-center px-4 pb-2 gap-1.5')}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={tailwind.style('flex-1')}
            contentContainerStyle={tailwind.style('gap-1.5 items-center')}>
            {(labels || []).map(label => (
              <View
                key={label.title}
                style={tailwind.style(
                  'flex flex-row items-center gap-1 rounded-full bg-gray-100 px-2 py-[3px]',
                )}>
                <View
                  style={[
                    tailwind.style('h-1.5 w-1.5 rounded-full'),
                    { backgroundColor: label.color || tailwind.color('bg-gray-500') },
                  ]}
                />
                <Animated.Text
                  style={tailwind.style(
                    'text-xs font-inter-420-20 tracking-[0.32px] text-gray-700',
                  )}>
                  {label.title}
                </Animated.Text>
              </View>
            ))}
          </ScrollView>
          {inboxName ? (
            <View style={tailwind.style('rounded-full bg-blue-50 px-2 py-[3px]')}>
              <Animated.Text
                numberOfLines={1}
                style={tailwind.style('text-xs font-inter-420-20 tracking-[0.32px] text-blue-800')}>
                {inboxName}
              </Animated.Text>
            </View>
          ) : null}
        </View>
      ) : null}
      <Sheet ref={slaEventsSheetRef} detents={[0.36]}>
        <SlaEvents slaEvents={slaEvents} statusText={statusText ?? ''} />
      </Sheet>
    </Animated.View>
  );
};
