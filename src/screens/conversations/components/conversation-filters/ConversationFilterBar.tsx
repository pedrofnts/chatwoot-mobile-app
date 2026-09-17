import React from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { BottomSheetType, setBottomSheetState } from '@/store/conversation/conversationHeaderSlice';
import { selectFilters } from '@/store/conversation/conversationFilterSlice';
import { BaseFilterOption, FilterBar } from '@/components-next';
import { StatusOptions, SortOptions } from '@/types/common/ConversationStatus';

// The assignee scope lives in the bottom tabs / assignee tabs and the inbox in
// the header subtitle, so the filter bar only holds the lower-frequency filters.
export const ConversationFilterOptions: BaseFilterOption[] = [
  {
    type: 'status',
    options: StatusOptions,
    defaultFilter: 'Open',
  },
  {
    type: 'sort_by',
    options: SortOptions,
    defaultFilter: 'Latest',
  },
];

export const ConversationFilterBar = () => {
  const dispatch = useAppDispatch();
  const selectedFilters = useAppSelector(selectFilters);

  const handleFilterButtonPress = (type: string) => {
    dispatch(setBottomSheetState(type as BottomSheetType));
  };

  return (
    <FilterBar
      allFilters={ConversationFilterOptions}
      selectedFilters={selectedFilters}
      onFilterPress={handleFilterButtonPress}
    />
  );
};
