import React from 'react';
import * as Effector from 'effector-react';

import EventStore from 'store/event';

import { Modal } from 'components/modal';
import { Card } from 'components/card';

import { Events } from 'config';

export const FixedWrapper: React.FC = () => {
  const eventState = Effector.useStore(EventStore.store);

  return (
    <React.Fragment>
      <Modal
        show={eventState.current === Events.Settings}
        onBlur={() => EventStore.reset()}
      >
        <Card title="Settings">
          Settings
        </Card>
      </Modal>
    </React.Fragment>
  );
};
