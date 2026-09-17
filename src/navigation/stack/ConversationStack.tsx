import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ConversationScreen from '@/screens/conversations/ConversationScreen';

// 'me' shows only the conversations assigned to the logged-in agent (the
// "Minhas" tab); 'team' is the team-wide view with the all/unassigned tabs.
export type ConversationScope = 'me' | 'team';

export type ConversationStackParamList = {
  ConversationScreen: { scope: ConversationScope };
};

const Stack = createNativeStackNavigator<ConversationStackParamList>();

const buildConversationStack = (scope: ConversationScope) => {
  const ScopedConversationStack = () => (
    <Stack.Navigator initialRouteName="ConversationScreen">
      <Stack.Screen
        options={{ headerShown: false }}
        name="ConversationScreen"
        component={ConversationScreen}
        initialParams={{ scope }}
      />
    </Stack.Navigator>
  );
  ScopedConversationStack.displayName = `ConversationStack(${scope})`;
  return ScopedConversationStack;
};

export const MineConversationStack = buildConversationStack('me');
export const ConversationStack = buildConversationStack('team');
