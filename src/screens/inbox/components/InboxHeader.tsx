import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { Sheet } from '@/components-next/common/sheet/Sheet';
import { Icon } from '@/components-next/common/icon';
import { ChevronLeft, DoubleCheckIcon, InboxFilterIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { InboxFilters } from './InboxFilters';
import i18n from '@/i18n';
import { useRefsContext } from '@/context';

type InboxHeaderProps = {
  markAllAsRead: () => void;
  onBack: () => void;
};

export const InboxHeader = (props: InboxHeaderProps) => {
  const { markAllAsRead, onBack } = props;
  const { inboxFiltersSheetRef } = useRefsContext();
  const handleToggleState = () => {
    inboxFiltersSheetRef.current?.present();
  };

  return (
    <Animated.View style={[tailwind.style('border-b-[1px] border-b-blackA-A3')]}>
      <Animated.View
        style={[tailwind.style('flex flex-row justify-between items-center px-4 pt-2 pb-[12px]')]}>
        <Animated.View style={tailwind.style('flex-1')}>
          <Pressable hitSlop={16} onPress={onBack}>
            <Icon icon={<ChevronLeft stroke={tailwind.color('text-gray-800')} />} size={24} />
          </Pressable>
        </Animated.View>
        <Animated.View style={tailwind.style('flex-1')}>
          <Animated.Text
            numberOfLines={1}
            style={tailwind.style(
              'text-[17px] text-center leading-[17px] tracking-[0.32px] font-inter-medium-24 text-gray-950',
            )}>
            {i18n.t('NOTIFICATION.INBOX')}
          </Animated.Text>
        </Animated.View>
        <Animated.View style={tailwind.style('flex-1 flex-row items-center justify-end gap-4')}>
          <Pressable hitSlop={8} onPress={markAllAsRead}>
            <Icon icon={<DoubleCheckIcon />} size={24} />
          </Pressable>
          <Pressable onPress={handleToggleState} hitSlop={8}>
            <Icon icon={<InboxFilterIcon />} size={24} />
          </Pressable>
        </Animated.View>
      </Animated.View>
      <Sheet ref={inboxFiltersSheetRef} height={160}>
        <InboxFilters />
      </Sheet>
    </Animated.View>
  );
};
