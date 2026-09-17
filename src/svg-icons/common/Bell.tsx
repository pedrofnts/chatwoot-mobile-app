import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { IconProps } from '../../types';

export const BellIcon = ({ stroke = '#858585' }: IconProps): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3C8.68629 3 6 5.68629 6 9V12.2C6 12.7038 5.85295 13.1966 5.57696 13.618L4.19625 15.7263C3.7594 16.3934 4.238 17.2778 5.03536 17.2778H18.9646C19.762 17.2778 20.2406 16.3934 19.8037 15.7263L18.423 13.618C18.147 13.1966 18 12.7038 18 12.2V9C18 5.68629 15.3137 3 12 3Z"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.75 20.25C10.2298 20.7823 11.0693 21.125 12 21.125C12.9307 21.125 13.7702 20.7823 14.25 20.25"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
};
