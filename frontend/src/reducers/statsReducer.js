import { cloneDeep } from 'lodash';
import * as statsActions from '../actions/statsActions';

const initialState = {
  users: {},
  ladder: {},
  matches: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case statsActions.LOGIN_SUCCESS: {
      const { data: { user, token, feeds } } = action;
      user.token = token;

        // Differentiate accounts / feeds received.
      const newFeeds = {};
      const newAccounts = { [user.id]: {
        username: user.name,
        id: Number(user.id),
        picture: user.avatar,
      } };
      feeds.forEach(({ accounts, items, id }) => {
        const participants = accounts.map(acc => acc.id);
        accounts.forEach((acc) => {
          if (!(acc.id in newAccounts)) newAccounts[acc.id] = acc;
        });
        newFeeds[id] = {
          items,
          participants,
        };
      });

      const newState = { user, accounts: newAccounts, feeds: newFeeds };
      return newState;
    }
    case statsActions.RECEIVED_LADDER: {
      const { data } = action;
      const newState = cloneDeep(state);
      newState.ladder = data;
      return newState;
    }
    case statsActions.RECEIVED_USER: {
      const { data, id } = action;
      const newState = cloneDeep(state);
      const { players, matches } = data;
      players.forEach(player => {
          newState.users[player.playerID] = player;
      });
      matches.forEach(match => {
          newState.matches[match.matchID] = match;
      });
      return newState;
    }
    case statsActions.LOGOUT: {
      return initialState;
    }
    default:
      return state;
  }
};
