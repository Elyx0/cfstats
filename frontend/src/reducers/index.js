import { combineReducers } from 'redux';
import { connectRouter as router } from 'connected-react-router'
import stats from './statsReducer';
import { createBrowserHistory  } from 'history';

const history = createBrowserHistory ();
const rootReducer = combineReducers({ router: router(history), stats });

export default rootReducer;
