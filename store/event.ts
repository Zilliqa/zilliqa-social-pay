import { createDomain } from 'effector';

import { Events } from 'config';
import { fetchSignOut } from 'utils/sing-out';
import { EventState } from 'interfaces';

export const EventDomain = createDomain();
export const setEvent = EventDomain.event<Events>();
export const setContent = EventDomain.event<any>();
export const reset = EventDomain.event();
export const setTimer = EventDomain.event<string | null>();
export const signOut = EventDomain.effect<null, null, Error>();

signOut.use(fetchSignOut);

const initalState = {
  current: Events.None,
  content: null
};

export const store = EventDomain.store<EventState>(initalState)
  .on(reset, () => initalState)
  .on(setEvent, (state, event) => ({
    ...state,
    current: event
   }))
   .on(setContent, (state, payload) => ({
     ...state,
     content: payload
   }))
   .on(setTimer, (state, timer) => ({
     ...state,
     timer
   }));

export default {
  store,
  reset,
  signOut,
  setTimer,
  setEvent,
  setContent
};
