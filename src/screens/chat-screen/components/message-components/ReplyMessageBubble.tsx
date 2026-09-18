import React, { useCallback, useMemo } from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { useChatWindowContext } from '@/context';
import { AttachFileIcon, CameraIcon, VideoCall, VoiceNote } from '@/svg-icons';
import { tailwind } from '@/theme';
import { Message } from '@/types';
import { isMarkdown } from '@/utils';
import { Icon } from '@/components-next';
import { MarkdownBubble } from './MarkdownBubble';
import { DARK_BUBBLE_VARIANTS, MESSAGE_VARIANTS, TEXT_MAX_WIDTH } from '@/constants';

type ReplyMessageBubbleProps = {
  replyMessage: Message;
  variant: string;
};

// On the solid blue bubbles the quoted message gets a darker translucent panel
// (WhatsApp-style); on the light contact bubble it gets a white panel.
const variantBaseMap = {
  [MESSAGE_VARIANTS.AGENT]: 'bg-blackA-A6',
  [MESSAGE_VARIANTS.BOT]: 'bg-blackA-A6',
  [MESSAGE_VARIANTS.TEMPLATE]: 'bg-blackA-A6',
  [MESSAGE_VARIANTS.ERROR]: 'bg-blackA-A6',
  [MESSAGE_VARIANTS.USER]: 'bg-white',
};

export const ReplyMessageBubble = (props: ReplyMessageBubbleProps) => {
  const replyMessageItem = props.replyMessage as Message;
  const isDarkQuote = DARK_BUBBLE_VARIANTS.includes(props.variant);

  const { setScrollToMessageId } = useChatWindowContext();

  const hasAttachments = useMemo(
    () => replyMessageItem?.attachments?.length > 0,
    [replyMessageItem?.attachments],
  );

  const renderAttachmentSection = () => {
    switch (replyMessageItem.attachments[0].fileType) {
      case 'audio':
        return <Icon size={15} icon={<VoiceNote />} />;
      case 'video':
        return <Icon size={15} icon={<VideoCall />} />;
      case 'image':
        return <Icon size={15} icon={<CameraIcon />} />;
      case 'file':
        return <Icon size={15} icon={<AttachFileIcon />} />;
      default:
        return null;
    }
  };

  const handleScrollToMessage = useCallback(() => {
    if (replyMessageItem?.id) {
      setScrollToMessageId(replyMessageItem.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replyMessageItem?.id]);

  return (
    <Pressable
      onPress={handleScrollToMessage}
      style={[
        tailwind.style(
          'relative max-w-[300px] pl-2 pr-2.5 py-2 mb-2 rounded-[10px] overflow-hidden -ml-[5px]',
          `max-w-[${TEXT_MAX_WIDTH}px]`,
          variantBaseMap[props.variant],
        ),
      ]}>
      <Animated.View style={tailwind.style('flex flex-row')}>
        <Animated.View
          style={tailwind.style(
            'w-[3px] h-auto rounded-[4px]',
            isDarkQuote ? 'bg-whiteA-A9' : 'bg-gray-300',
          )}
        />
        <Animated.View style={tailwind.style('pl-2.5')}>
          <Animated.Text
            style={tailwind.style(
              'text-cxs font-inter-420-20 leading-[14.95px] tracking-[0.32px]',
              isDarkQuote ? 'text-whiteA-A11' : 'text-blackA-A11',
            )}>
            Replying to {replyMessageItem?.sender?.name}
          </Animated.Text>
          {hasAttachments ? (
            <Animated.View style={tailwind.style('py-[3px] flex flex-row items-center')}>
              {renderAttachmentSection()}
              <Animated.Text
                style={tailwind.style(
                  'text-[14px] font-inter-normal-20 leading-[19.6px] tracking-[0.16px] pl-1.5',
                  isDarkQuote ? 'text-white' : 'text-gray-950',
                )}>
                {replyMessageItem?.attachments[0].fileType}
              </Animated.Text>
            </Animated.View>
          ) : null}

          {replyMessageItem?.content ? (
            isMarkdown(replyMessageItem?.content) ? (
              <MarkdownBubble
                messageContent={replyMessageItem?.content?.split('\n')?.[0]}
                variant={props.variant}
              />
            ) : (
              <Animated.Text
                numberOfLines={1}
                style={tailwind.style(
                  'text-[14px] font-inter-normal-20 leading-[19.6px] tracking-[0.16px]',
                  isDarkQuote ? 'text-white' : 'text-gray-950',
                )}>
                {replyMessageItem?.content}
              </Animated.Text>
            )
          ) : null}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};
