import { useRef, useEffect, startTransition } from 'react';
import { useAtom, useAtomValue } from 'jotai';

import Credits from '../Credits/Credits';
import ActiveUserSelector from '../ActiveUserSelector/ActiveUserSelector';

import * as S from './style';
import {
  activeUserAtom,
  isAnonymousAtom,
  isMenuOpenAtom,
  participantsAtom,
} from '../../stores/global';
import {
  isReverseScrollAtom,
} from '../../stores/filters';

function Sidebar() {
  const [isMenuOpen, setIsMenuOpen] = useAtom(isMenuOpenAtom);
  const [isAnonymous, setIsAnonymous] = useAtom(isAnonymousAtom);
  const [isReverseScroll, setIsReverseScroll] = useAtom(isReverseScrollAtom);
  const participants = useAtomValue(participantsAtom);
  const [activeUser, setActiveUser] = useAtom(activeUserAtom);

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };

    document.addEventListener('keydown', keyDownHandler);
    return () => document.removeEventListener('keydown', keyDownHandler);
  }, [setIsMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) closeButtonRef.current?.focus();
    else openButtonRef.current?.focus();
  }, [isMenuOpen]);

  return (
    <>
      <S.MenuOpenButton
        className="menu-open-button"
        type="button"
        onClick={() => setIsMenuOpen(true)}
        ref={openButtonRef}
      >
        Open menu
      </S.MenuOpenButton>
      <S.Overlay
        type="button"
        $isActive={isMenuOpen}
        onClick={() => setIsMenuOpen(false)}
        tabIndex={-1}
      />
      <S.Sidebar $isOpen={isMenuOpen}>
        <S.MenuCloseButton
          type="button"
          onClick={() => setIsMenuOpen(false)}
          ref={closeButtonRef}
        >
          Close menu
        </S.MenuCloseButton>
        <S.SidebarContainer>
          <S.SidebarChildren>
            <ActiveUserSelector
              participants={participants}
              activeUser={activeUser}
              setActiveUser={setActiveUser}
            />

            <S.Field>
              <S.Label htmlFor="is-anonymous">Anonymize users</S.Label>
              <S.ToggleCheckbox
                id="is-anonymous"
                type="checkbox"
                checked={isAnonymous}
                onChange={() =>
                  startTransition(() => setIsAnonymous(bool => !bool))
                }
              />
            </S.Field>

            <S.Field>
              <S.Label htmlFor="reverse-scroll">Reverse scroll (newest first)</S.Label>
              <S.ToggleCheckbox
                id="reverse-scroll"
                type="checkbox"
                checked={isReverseScroll}
                onChange={() => setIsReverseScroll(bool => !bool)}
              />
            </S.Field>
          </S.SidebarChildren>
          <Credits />
        </S.SidebarContainer>
      </S.Sidebar>
    </>
  );
}

export default Sidebar;
