import { combineReducers } from 'redux';
import { connectRouter as router } from 'connected-react-router'
import stats from './statsReducer';
import { createHashHistory } from 'history';

const history = createHashHistory();
const rootReducer = combineReducers({ router: router(history), stats });

export default rootReducer;
