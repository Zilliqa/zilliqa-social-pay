import { createDomain } from 'effector';

import { Events } from 'config';

import { EventState } from 'interfaces';

export const EventDomain = createDomain();
export const setEvent = EventDomain.event<Events>();
export const reset = EventDomain.event();


const initalState = {
  current: Events.None
};

export const store = EventDomain.store<EventState>(initalState)
  .on(reset, () => initalState)
  .on(setEvent, (state, event) => ({
    ...state,
    current: event
   }));

export default {
  store,
  reset,
  setEvent
};
