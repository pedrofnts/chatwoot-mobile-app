import React from 'react';
import Svg, { Path } from 'react-native-svg';

// Two overlapping chat bubbles: everyone's conversations, in contrast with the
// single bubble used for the "mine" tab.
export const TeamConversationIconOutline = () => {
  return (
    <Svg width="49" height="40" viewBox="0 0 49 40" fill="none">
      <Path
        d="M27 17.5H20C16.13 17.5 13 14.37 13 10.5C13 6.63 16.13 3.5 20 3.5C23.87 3.5 27 6.63 27 10.5V17.5Z"
        stroke="#171717"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M19 26.5V18C19 13.3 22.8 9.5 27.5 9.5C32.2 9.5 36 13.3 36 18C36 22.7 32.2 26.5 27.5 26.5H19Z"
        fill="#FFFFFF"
        stroke="#171717"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const TeamConversationIconFilled = () => {
  return (
    <Svg width="49" height="40" viewBox="0 0 49 40" fill="none">
      <Path
        d="M27 17.5H20C16.13 17.5 13 14.37 13 10.5C13 6.63 16.13 3.5 20 3.5C23.87 3.5 27 6.63 27 10.5V17.5Z"
        fill="#171717"
      />
      <Path
        d="M19 26.5V18C19 13.3 22.8 9.5 27.5 9.5C32.2 9.5 36 13.3 36 18C36 22.7 32.2 26.5 27.5 26.5H19Z"
        fill="#171717"
        stroke="#FFFFFF"
        strokeWidth="2"
      />
    </Svg>
  );
};
