import { push } from 'connected-react-router'
import { endPoint } from '../components/Api';

export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOADING_LADDER = 'LOADING_LADDER';
export const RECEIVED_LADDER = 'RECEIVED_LADDER';
export const RECEIVED_USER = 'RECEIVED_USER';
export const ADD_PIN = 'ADD_PIN';
export const REMOVE_PIN = 'REMOVE_PIN';
export const LOGOUT = 'LOGOUT';

export const initialLogin = data => (dispatch) => {
  dispatch({
    type: LOGIN_SUCCESS,
    data,
  });
  dispatch(push('/inbox'));
};

const wait = () => {
return new Promise(res => setTimeout(x => res(),1000))
}

export const fetchLadder = () => async (dispatch, getState) => {
try {
    const res = await fetch(`${endPoint}/ladder/`, {
      method: 'GET',
    });
    const { data, error } = await res.json();
    if (error) {
      // Not good, token dead?
      throw new Error(error.name);
    } else {
      dispatch({
        type: RECEIVED_LADDER,
        data,
      });
    }
  } catch (e) {
    // Might need to check various API Errors here
    // or forward to caller
   throw e;
 }
  return true;
};

export const addPin = id => dispatch => dispatch({type:ADD_PIN,id});
export const removePin = id => dispatch => dispatch({type:REMOVE_PIN,id});
export const fetchUser = (id) => async (dispatch, getState) => {
try {
    const res = await fetch(`${endPoint}/user/${id}`, {
      method: 'GET',
    });
    const { data, error } = await res.json();
    if (error) {
      // Not good, token dead?
      throw new Error(error.name);
    } else {
      dispatch({
        type: RECEIVED_USER,
        data,
        id,
      });
    }
  } catch (e) {
    // Might need to check various API Errors here
    // or forward to caller
   throw e;
 }
  return true;
};
