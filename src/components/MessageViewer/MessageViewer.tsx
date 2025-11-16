import React, { useMemo, useEffect, useRef } from 'react';
import { useAtom, useAtomValue } from 'jotai';

import Message from '../Message/Message';
import * as S from './style';
import {
  activeUserAtom,
  messagesAtom,
  participantsAtom,
} from '../../stores/global';

import { authorColors } from '../../utils/colors';
import {
  datesAtom,
  globalFilterModeAtom,
  limitsAtom,
  isReverseScrollAtom,
} from '../../stores/filters';
import { filterMessagesByDate, getISODateString } from '../../utils/utils';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';

function MessageViewer() {
  const limits = useAtomValue(limitsAtom);
  const [activeUser, setActiveUser] = useAtom(activeUserAtom);
  const participants = useAtomValue(participantsAtom);
  const messages = useAtomValue(messagesAtom);
  const filterMode = useAtomValue(globalFilterModeAtom);
  const isReverseScroll = useAtomValue(isReverseScrollAtom);
  const { start: startDate, end: endDate } = useAtomValue(datesAtom);
  const endDatePlusOne = new Date(endDate);
  endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Apply date filter first if in date mode
  const filteredMessages =
    filterMode === 'date'
      ? filterMessagesByDate(messages, startDate, endDatePlusOne)
      : messages;

  // Use infinite scroll for index mode, static filtering for date mode
  const { displayCount, loadMoreTriggerRef, hasMore } = useInfiniteScroll({
    itemsPerPage: 100,
    totalItems: filteredMessages.length,
    enabled: filterMode === 'index',
    reverse: isReverseScroll,
  });

  // In reverse mode, show last N messages; in normal mode, show first N messages
  const renderedMessages =
    filterMode === 'index'
      ? isReverseScroll
        ? filteredMessages.slice(-displayCount) // Last N messages
        : filteredMessages.slice(0, displayCount) // First N messages
      : filteredMessages;

  const isLimited = renderedMessages.length !== filteredMessages.length;

  const colorMap: Record<string, string> = useMemo(
    () =>
      participants.reduce(
        (obj, participant, i) => ({
          ...obj,
          [participant]: authorColors[i % authorColors.length],
        }),
        {},
      ),
    [participants],
  );

  useEffect(() => {
    setActiveUser(participants[0] || '');
  }, [setActiveUser, participants]);

  // Scroll to bottom when reverse mode is enabled or when messages are loaded in reverse mode
  useEffect(() => {
    if (isReverseScroll && containerRef.current && renderedMessages.length > 0) {
      // Small delay to ensure DOM has updated
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      }, 0);
    }
  }, [isReverseScroll, messages.length]);

  return (
    <S.Container ref={containerRef}>
      {messages.length > 0 && (
        <S.P>
          <S.Info>
            {filterMode === 'index' && (
              <span>
                Showing {renderedMessages.length} out of {filteredMessages.length} messages
                {hasMore && ' - Scroll down to load more'}
              </span>
            )}
            {filterMode === 'date' && (
              <span>
                Showing messages from {getISODateString(startDate)} to{' '}
                {getISODateString(endDate)} ({renderedMessages.length} messages)
              </span>
            )}
          </S.Info>
        </S.P>
      )}

      <S.List>
        {filterMode === 'index' && hasMore && isReverseScroll && (
          <div ref={loadMoreTriggerRef} style={{ height: '1px' }} />
        )}
        {renderedMessages.map((message, i, arr) => {
          const prevMessage = arr[i - 1];

          return (
            <Message
              key={message.index}
              message={message}
              color={colorMap[message.author || '']}
              isActiveUser={activeUser === message.author}
              sameAuthorAsPrevious={
                prevMessage && prevMessage.author === message.author
              }
            />
          );
        })}
        {filterMode === 'index' && hasMore && !isReverseScroll && (
          <div ref={loadMoreTriggerRef} style={{ height: '1px' }} />
        )}
      </S.List>
    </S.Container>
  );
}

export default React.memo(MessageViewer);
