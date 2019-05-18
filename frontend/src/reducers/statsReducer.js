import { cloneDeep } from 'lodash';
import * as statsActions from '../actions/statsActions';

const initialState = {
  users: {},
  ladder: {},
  matches: {},
  pins: {},
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
      
      if (state.ladder && state.ladder.ladder2v2) {
      // Go through newState and get the positional diff
      // Should do it in one loop ideally
      const oldMappings = Object.keys(state.ladder).forEach(key => {
        state.ladder[key] = state.ladder[key].map(x => x.playerID); 
      });

      Object.keys(data).forEach(key => {
        data[key].forEach((el,index) => {
          const oldPos = state.ladder[key].indexOf(el.playerID);
          // Can be new to the ladder?
          // Can be out of the ladder -> No because i work with newest data
          if (oldPos !== -1) {
            el.diff = index - oldPos;
            if (Number.isNaN(el.diff)) el.diff = 0;
            // Wondering about timestamps of last update
          }
          
        })
      });
      }

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
    case statsActions.ADD_PIN: {
      const { id } = action;
      const newState = cloneDeep(state);
      newState.pins[id] = true;
      return newState;
    }
    case statsActions.REMOVE_PIN: {
      const { id } = action;
      const newState = cloneDeep(state);
      delete newState.pins[id];
      return newState;
    }
    default:
      return state;
  }
};
