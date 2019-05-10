import { combineReducers } from 'redux';
import { connectRouter as router } from 'connected-react-router'
import inbox from './inboxReducer';
import { createHashHistory } from 'history';

const history = createHashHistory();
const rootReducer = combineReducers({ router: router(history), inbox });

export default rootReducer;
