import React from 'react';
import { render } from 'react-dom';
//import { unregister } from './registerServiceWorker';
import './index.css';
import Root from './containers/Root';
import { configureStore, history, load } from './store/configureStore';
import { push } from 'connected-react-router';

const store = configureStore();
load(store).then(newState => {
  if (newState.inbox && newState.inbox.user && newState.inbox.user.token) {
    // Already logged in
    // store.dispatch(push('/inbox'));
  }
});


render(
  <Root store={store} history={history} />,
  document.getElementById('root')
);
