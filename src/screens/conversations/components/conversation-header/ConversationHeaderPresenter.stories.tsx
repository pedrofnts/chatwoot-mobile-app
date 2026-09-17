import { Meta, StoryObj } from '@storybook/react';
import { ConversationHeaderPresenter } from './ConversationHeaderPresenter';
import { tailwind } from '@/theme';
import { ScrollView, View, Text } from 'react-native';

const meta: Meta<typeof ConversationHeaderPresenter> = {
  title: 'Conversations Screen Header',
  component: ConversationHeaderPresenter,
  args: {
    currentState: 'none',
    scope: 'team',
    inboxName: 'All inboxes',
    isSelectedAll: false,
    filtersAppliedCount: 0,
    unreadNotificationCount: 0,
    onLeftIconPress: () => {},
    onRightIconPress: () => {},
    onClearFilter: () => {},
    onNotificationPress: () => {},
    onInboxPress: () => {},
  },
  argTypes: {
    currentState: {
      control: 'select',
      options: ['none', 'Select', 'Filter', 'Search'],
    },
    isSelectedAll: {
      control: 'boolean',
    },
    filtersAppliedCount: {
      control: 'number',
    },
  },
  decorators: [
    Story => (
      <View style={tailwind.style('border-b-[1px] border-blackA-A3')}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ConversationHeaderPresenter>;

export const Default: Story = {
  args: {
    currentState: 'none',
  },
};

const Title = ({ title }: { title: string }) => (
  <View style={tailwind.style('flex items-center justify-center')}>
    <Text style={tailwind.style('text-md font-medium italic text-gray-800')}>{title}</Text>
  </View>
);

const HeaderContainer = ({ children }: { children: React.ReactNode }) => (
  <View style={tailwind.style('flex-1 border-b-[1px] border-blackA-A3 ')}>{children}</View>
);

export const AllVariants: Story = {
  render: () => (
    <ScrollView contentContainerStyle={tailwind.style('flex gap-4 pt-4')}>
      <Title title="Select All" />
      <HeaderContainer>
        <ConversationHeaderPresenter
          scope="team"
          inboxName="All inboxes"
          onInboxPress={() => {}}
          unreadNotificationCount={0}
          currentState="Select"
          isSelectedAll={false}
          filtersAppliedCount={0}
          onLeftIconPress={() => {}}
          onRightIconPress={() => {}}
          onClearFilter={() => {}}
          onNotificationPress={() => {}}
        />
      </HeaderContainer>
      <Title title="Selected All" />
      <HeaderContainer>
        <ConversationHeaderPresenter
          scope="team"
          inboxName="All inboxes"
          onInboxPress={() => {}}
          unreadNotificationCount={0}
          currentState="Select"
          isSelectedAll={true}
          filtersAppliedCount={0}
          onLeftIconPress={() => {}}
          onRightIconPress={() => {}}
          onClearFilter={() => {}}
          onNotificationPress={() => {}}
        />
      </HeaderContainer>

      <Title title="Filter" />
      <HeaderContainer>
        <ConversationHeaderPresenter
          scope="team"
          inboxName="All inboxes"
          onInboxPress={() => {}}
          unreadNotificationCount={0}
          currentState="Filter"
          isSelectedAll={false}
          filtersAppliedCount={2}
          onLeftIconPress={() => {}}
          onRightIconPress={() => {}}
          onClearFilter={() => {}}
          onNotificationPress={() => {}}
        />
      </HeaderContainer>

      <Title title="Filter Empty" />
      <HeaderContainer>
        <ConversationHeaderPresenter
          scope="team"
          inboxName="All inboxes"
          onInboxPress={() => {}}
          unreadNotificationCount={0}
          currentState="Filter"
          isSelectedAll={false}
          filtersAppliedCount={0}
          onLeftIconPress={() => {}}
          onRightIconPress={() => {}}
          onClearFilter={() => {}}
          onNotificationPress={() => {}}
        />
      </HeaderContainer>

      <Title title="Filter Applied" />
      <HeaderContainer>
        <ConversationHeaderPresenter
          scope="team"
          inboxName="All inboxes"
          onInboxPress={() => {}}
          unreadNotificationCount={0}
          currentState="Filter"
          isSelectedAll={false}
          filtersAppliedCount={2}
          onLeftIconPress={() => {}}
          onRightIconPress={() => {}}
          onClearFilter={() => {}}
          onNotificationPress={() => {}}
        />
      </HeaderContainer>

      <Title title="Filter Applied with out state" />
      <HeaderContainer>
        <ConversationHeaderPresenter
          scope="team"
          inboxName="All inboxes"
          onInboxPress={() => {}}
          unreadNotificationCount={0}
          currentState="none"
          isSelectedAll={false}
          filtersAppliedCount={2}
          onLeftIconPress={() => {}}
          onRightIconPress={() => {}}
          onClearFilter={() => {}}
          onNotificationPress={() => {}}
        />
      </HeaderContainer>
    </ScrollView>
  ),
};
